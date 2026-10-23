import { SynthSettings } from '../types/music';
import { getMidiFrequency } from '../utils/musicTheory';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Effects nodes
  private filterNode: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayWetGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  // LFO
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Recording
  private mediaDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  // Base settings
  private settings: SynthSettings = {
    oscType: 'sawtooth',
    subOscLevel: 0.3,
    detuneCents: 5,
    filterType: 'lowpass',
    filterCutoff: 3200,
    filterResonance: 3.5,
    attack: 0.02,
    decay: 0.3,
    sustain: 0.6,
    release: 0.4,
    distortion: 0.15,
    delayTime: 0.28,
    delayFeedback: 0.35,
    delayMix: 0.25,
    reverbDecay: 2.2,
    reverbMix: 0.3,
    lfoRate: 3.5,
    lfoDepth: 0.2,
    lfoDestination: 'filter',
    lfoWave: 'sine',
  };

  private masterVolume: number = 0.8;
  private baseTuningHz: number = 440;

  public init() {
    if (this.ctx && this.ctx.state !== 'closed') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain & Analyser
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    // Filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = this.settings.filterType;
    this.filterNode.frequency.setValueAtTime(this.settings.filterCutoff, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(this.settings.filterResonance, this.ctx.currentTime);

    // Distortion
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(this.settings.distortion);
    this.distortionNode.oversample = '4x';

    // Delay FX
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(this.settings.delayTime, this.ctx.currentTime);
    this.delayFeedbackGain = this.ctx.createGain();
    this.delayFeedbackGain.gain.setValueAtTime(this.settings.delayFeedback, this.ctx.currentTime);
    this.delayWetGain = this.ctx.createGain();
    this.delayWetGain.gain.setValueAtTime(this.settings.delayMix, this.ctx.currentTime);

    // Feedback loop
    this.delayNode.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode);
    this.delayNode.connect(this.delayWetGain);

    // Reverb FX
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.buildImpulseResponse(this.settings.reverbDecay);
    this.reverbWetGain = this.ctx.createGain();
    this.reverbWetGain.gain.setValueAtTime(this.settings.reverbMix, this.ctx.currentTime);
    this.reverbNode.connect(this.reverbWetGain);

    // Dry gain
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Signal routing:
    // [Instruments] -> filterNode -> distortionNode -> [Dry, Delay, Reverb] -> masterGain -> analyser -> destination
    this.filterNode.connect(this.distortionNode);

    this.distortionNode.connect(this.dryGain);
    this.distortionNode.connect(this.delayNode);
    this.distortionNode.connect(this.reverbNode);

    this.dryGain.connect(this.masterGain);
    this.delayWetGain.connect(this.masterGain);
    this.reverbWetGain.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Media destination for recording WAV
    try {
      this.mediaDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.mediaDest);
    } catch (e) {
      console.warn('MediaStreamDestination not supported', e);
    }

    // Setup LFO
    this.setupLFO();
  }

  public ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupLFO() {
    if (!this.ctx || !this.filterNode) return;
    try {
      if (this.lfoNode) {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      }
      if (this.lfoGain) {
        this.lfoGain.disconnect();
      }

      if (this.settings.lfoDestination === 'none' || this.settings.lfoDepth === 0) return;

      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = this.settings.lfoWave;
      this.lfoNode.frequency.setValueAtTime(this.settings.lfoRate, this.ctx.currentTime);

      this.lfoGain = this.ctx.createGain();

      if (this.settings.lfoDestination === 'filter') {
        // Modulate filter cutoff (e.g. +/- 1200 Hz)
        const depthHz = this.settings.lfoDepth * 1800;
        this.lfoGain.gain.setValueAtTime(depthHz, this.ctx.currentTime);
        this.lfoNode.connect(this.lfoGain);
        this.lfoGain.connect(this.filterNode.frequency);
      } else if (this.settings.lfoDestination === 'amp' && this.masterGain) {
        // Tremolo
        this.lfoGain.gain.setValueAtTime(this.settings.lfoDepth * 0.3, this.ctx.currentTime);
        this.lfoNode.connect(this.lfoGain);
        this.lfoGain.connect(this.masterGain.gain);
      }

      this.lfoNode.start();
    } catch (e) {
      console.error('Error starting LFO', e);
    }
  }

  private makeDistortionCurve(amount: number): any {
    const k = Math.max(0, amount) * 40;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    return curve;
  }

  private buildImpulseResponse(decayTime: number): AudioBuffer {
    if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * Math.max(0.2, decayTime));
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const decay = Math.exp(-t * (4 + decayTime));
      // Stereo diffusion
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  }

  // Play a note through the synthesizer
  public playNote(
    midi: number,
    duration: number = 0.5,
    velocity: number = 0.8,
    centsOffset: number = 0
  ) {
    this.ensureContext();
    if (!this.ctx || !this.filterNode) return;

    const now = this.ctx.currentTime;
    const freq = getMidiFrequency(midi, this.baseTuningHz, centsOffset + this.settings.detuneCents);
    const subFreq = freq / 2;

    // Main Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = this.settings.oscType;
    osc.frequency.setValueAtTime(freq, now);

    // Sub Oscillator (for warmth/bass richness)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(subFreq, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(this.settings.subOscLevel * 0.5, now);
    subOsc.connect(subGain);

    // Voice Gain Node with ADSR envelope
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);

    const attack = Math.max(0.005, this.settings.attack);
    const decay = Math.max(0.02, this.settings.decay);
    const sustain = Math.max(0.05, this.settings.sustain);
    const release = Math.max(0.02, this.settings.release);
    const targetGain = velocity * 0.4;

    // Attack
    voiceGain.gain.linearRampToValueAtTime(targetGain, now + attack);
    // Decay to Sustain
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain * sustain), now + attack + decay);

    // Connect to filter
    osc.connect(voiceGain);
    subGain.connect(voiceGain);
    voiceGain.connect(this.filterNode);

    osc.start(now);
    subOsc.start(now);

    // Schedule Note Off & Release
    const stopTime = now + Math.max(0.1, duration);
    voiceGain.gain.setValueAtTime(voiceGain.gain.value, stopTime);
    voiceGain.gain.exponentialRampToValueAtTime(0.00001, stopTime + release);

    osc.stop(stopTime + release + 0.05);
    subOsc.stop(stopTime + release + 0.05);

    setTimeout(() => {
      try {
        osc.disconnect();
        subOsc.disconnect();
        subGain.disconnect();
        voiceGain.disconnect();
      } catch (e) {
        // already cleaned up
      }
    }, (duration + release + 0.1) * 1000);
  }

  // Play synthesized drum hits
  public playDrum(type: 'kick' | 'snare' | 'hihat' | 'clap') {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (type === 'kick') {
      // 808 style punchy kick
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'snare') {
      // Tonal body + white noise crack
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.1);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.13);

      // Noise burst
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.21);
    } else if (type === 'hihat') {
      // Crisp metallic noise
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(8500, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(now);
      source.stop(now + 0.08);
    } else if (type === 'clap') {
      // Multi-tap noise impulse
      const count = 3;
      for (let c = 0; c < count; c++) {
        const offset = c * 0.012;
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now + offset);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start(now + offset);
        source.stop(now + offset + 0.045);
      }
    }
  }

  // Update Settings
  public updateSettings(newSettings: Partial<SynthSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.filterNode && (newSettings.filterCutoff !== undefined || newSettings.filterResonance !== undefined || newSettings.filterType !== undefined)) {
      if (newSettings.filterType) this.filterNode.type = newSettings.filterType;
      if (newSettings.filterCutoff) this.filterNode.frequency.setTargetAtTime(newSettings.filterCutoff, now, 0.02);
      if (newSettings.filterResonance) this.filterNode.Q.setTargetAtTime(newSettings.filterResonance, now, 0.02);
    }

    if (this.distortionNode && newSettings.distortion !== undefined) {
      this.distortionNode.curve = this.makeDistortionCurve(newSettings.distortion);
    }

    if (this.delayNode && newSettings.delayTime !== undefined) {
      this.delayNode.delayTime.setTargetAtTime(newSettings.delayTime, now, 0.02);
    }
    if (this.delayFeedbackGain && newSettings.delayFeedback !== undefined) {
      this.delayFeedbackGain.gain.setTargetAtTime(newSettings.delayFeedback, now, 0.02);
    }
    if (this.delayWetGain && newSettings.delayMix !== undefined) {
      this.delayWetGain.gain.setTargetAtTime(newSettings.delayMix, now, 0.02);
    }

    if (this.reverbNode && newSettings.reverbDecay !== undefined) {
      this.reverbNode.buffer = this.buildImpulseResponse(newSettings.reverbDecay);
    }
    if (this.reverbWetGain && newSettings.reverbMix !== undefined) {
      this.reverbWetGain.gain.setTargetAtTime(newSettings.reverbMix, now, 0.02);
    }

    if (
      newSettings.lfoRate !== undefined ||
      newSettings.lfoDepth !== undefined ||
      newSettings.lfoDestination !== undefined ||
      newSettings.lfoWave !== undefined
    ) {
      this.setupLFO();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  public setBaseTuning(hz: number) {
    this.baseTuningHz = hz; // 440 or 432
  }

  public getSettings(): SynthSettings {
    return { ...this.settings };
  }

  public getVisualizerData(): { waveform: Uint8Array; spectrum: Uint8Array } | null {
    if (!this.analyser) return null;
    const waveform = new Uint8Array(this.analyser.fftSize);
    const spectrum = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(waveform);
    this.analyser.getByteFrequencyData(spectrum);
    return { waveform, spectrum };
  }

  // Audio Recording to WAV / WebM
  public startRecording() {
    this.ensureContext();
    if (!this.mediaDest) return;
    this.recordedChunks = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaDest.stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
      });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (e) {
      console.error('Failed to start recording', e);
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  public getRecordingState(): boolean {
    return this.isRecording;
  }
}

export const audioEngine = new AudioEngine();
