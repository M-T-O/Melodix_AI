export type ViewMode = 'amateur' | 'intellectual';

export interface NotePitch {
  note: string; // e.g. "C4", "D#4"
  frequency: number; // in Hz
  midi: number; // 60 for C4
  octave: number;
  baseNote: string; // "C", "D"
  accidental: '' | '#' | 'b';
}

export interface StepNote {
  id: string;
  step: number; // 0 to 15 (or 31)
  pitch: string; // "C4"
  midi: number;
  duration: number; // in steps (default 1)
  velocity: number; // 0.1 to 1.0
  cents?: number; // microtuning offset (-50 to +50)
  probability?: number; // 0 to 1
}

export interface DrumStep {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  clap: boolean[];
}

export interface ScaleDefinition {
  id: string;
  name: string;
  nameTr: string;
  category: 'major' | 'minor' | 'modal' | 'world' | 'makam' | 'jazz';
  intervals: number[]; // semitone steps from root (e.g. [0, 2, 4, 5, 7, 9, 11] for Major)
  description: string;
  intellectualNote: string;
  amateurVibe: string;
}

export interface ChordDefinition {
  name: string;
  romanNumeral: string;
  function: string;
  intervals: number[]; // semitones relative to root
  color: string;
}

export interface SynthSettings {
  oscType: 'sine' | 'triangle' | 'sawtooth' | 'square';
  subOscLevel: number; // 0 to 1
  detuneCents: number; // -50 to 50
  
  // Filter
  filterType: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  filterCutoff: number; // 20 to 20000 Hz
  filterResonance: number; // 0.1 to 20 Q
  
  // Envelope
  attack: number; // seconds
  decay: number;
  sustain: number; // 0 to 1
  release: number; // seconds
  
  // Effects
  distortion: number; // 0 to 1
  delayTime: number; // 0.05 to 1.0 s
  delayFeedback: number; // 0 to 0.85
  delayMix: number; // 0 to 0.8
  reverbDecay: number; // 0.5 to 8 s
  reverbMix: number; // 0 to 0.8
  
  // LFO
  lfoRate: number; // 0.1 to 20 Hz
  lfoDepth: number; // 0 to 1
  lfoDestination: 'filter' | 'pitch' | 'amp' | 'none';
  lfoWave: 'sine' | 'triangle' | 'sawtooth' | 'square';
}

export interface AIMelodyResult {
  title: string;
  scaleDetected: string;
  musicalRationale: string;
  beginnerTip: string;
  recommendedChords: Array<{
    chordName: string;
    romanNumeral: string;
    notes: string[];
    function: string;
  }>;
  notes: Array<{
    step: number;
    pitch: string;
    midi: number;
    duration: number;
    velocity: number;
  }>;
}

export interface AIHarmonyAnalysis {
  harmonicRating: number;
  melodicContour: string;
  intellectualAnalysis: {
    tonalCenter: string;
    voiceLeadingInsight: string;
    modalCharacter: string;
    cadenceSuggestions: string[];
    academicCritique: string;
  };
  amateurAdvice: {
    summary: string;
    easyNextStep: string;
    catchinessTip: string;
  };
}

export interface PresetProject {
  id: string;
  title: string;
  category: string;
  tempo: number;
  rootNote: string;
  scaleId: string;
  description: string;
  notes: StepNote[];
  drums: DrumStep;
  synth: SynthSettings;
}
