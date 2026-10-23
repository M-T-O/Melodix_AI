import React from 'react';
import { ViewMode, SynthSettings } from '../types/music';
import { audioEngine } from '../audio/audioEngine';
import { Sliders, Activity, Sparkles, Volume2, Waves, Radio } from 'lucide-react';

interface SynthRackProps {
  mode: ViewMode;
  synth: SynthSettings;
  setSynth: React.Dispatch<React.SetStateAction<SynthSettings>>;
  onOpenAIDSP: () => void;
}

export const SynthRack: React.FC<SynthRackProps> = ({
  mode,
  synth,
  setSynth,
  onOpenAIDSP,
}) => {
  const update = (partial: Partial<SynthSettings>) => {
    audioEngine.ensureContext();
    audioEngine.updateSettings(partial);
    setSynth((prev) => ({ ...prev, ...partial }));
  };

  const previewSound = () => {
    audioEngine.ensureContext();
    audioEngine.playNote(60, 0.4, 0.9);
    audioEngine.playNote(64, 0.4, 0.85);
    audioEngine.playNote(67, 0.5, 0.85);
  };

  // Quick Timbre Presets
  const applyQuickTimbre = (type: 'piano' | 'synth80' | 'pluck' | 'pad' | 'acid') => {
    if (type === 'piano') {
      update({
        oscType: 'triangle',
        subOscLevel: 0.2,
        detuneCents: 2,
        filterType: 'lowpass',
        filterCutoff: 3000,
        filterResonance: 1.5,
        attack: 0.01,
        decay: 0.4,
        sustain: 0.3,
        release: 0.35,
        reverbDecay: 2.0,
        reverbMix: 0.25,
        delayMix: 0.1,
        distortion: 0.02,
        lfoDestination: 'none',
      });
    } else if (type === 'synth80') {
      update({
        oscType: 'sawtooth',
        subOscLevel: 0.4,
        detuneCents: 12,
        filterType: 'lowpass',
        filterCutoff: 4200,
        filterResonance: 3.5,
        attack: 0.02,
        decay: 0.25,
        sustain: 0.6,
        release: 0.3,
        reverbDecay: 2.5,
        reverbMix: 0.3,
        delayMix: 0.25,
        distortion: 0.18,
        lfoDestination: 'filter',
        lfoRate: 4.0,
        lfoDepth: 0.2,
      });
    } else if (type === 'pluck') {
      update({
        oscType: 'square',
        subOscLevel: 0.15,
        detuneCents: 4,
        filterType: 'lowpass',
        filterCutoff: 5000,
        filterResonance: 4.0,
        attack: 0.005,
        decay: 0.15,
        sustain: 0.1,
        release: 0.2,
        reverbDecay: 3.0,
        reverbMix: 0.35,
        delayMix: 0.3,
        distortion: 0.05,
        lfoDestination: 'none',
      });
    } else if (type === 'pad') {
      update({
        oscType: 'sine',
        subOscLevel: 0.5,
        detuneCents: 8,
        filterType: 'lowpass',
        filterCutoff: 2200,
        filterResonance: 1.8,
        attack: 0.4,
        decay: 0.6,
        sustain: 0.8,
        release: 0.8,
        reverbDecay: 4.5,
        reverbMix: 0.5,
        delayMix: 0.35,
        distortion: 0.05,
        lfoDestination: 'pitch',
        lfoRate: 1.5,
        lfoDepth: 0.1,
      });
    } else if (type === 'acid') {
      update({
        oscType: 'sawtooth',
        subOscLevel: 0.3,
        detuneCents: 0,
        filterType: 'lowpass',
        filterCutoff: 1800,
        filterResonance: 8.5,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.25,
        reverbDecay: 1.5,
        reverbMix: 0.2,
        delayMix: 0.2,
        distortion: 0.45,
        lfoDestination: 'filter',
        lfoRate: 6.0,
        lfoDepth: 0.4,
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              {mode === 'amateur'
                ? 'Ses Karakteri & Efektler (Ses Şekillendirici)'
                : 'Gelişmiş DSP Sentez & Efekt Laboratuvarı'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'amateur'
                ? 'Osilatör ve efektleri sezgisel 4 ana ayarla kolayca yönet'
                : 'Sub-osilatör, ADSR zarfı, rezonant filtre, çift gecikme ve LFO matrisi'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={previewSound}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            title="Mevcut sentez ayarlarını üçlü akor ile dene"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Sesi Dene</span>
          </button>

          <button
            onClick={onOpenAIDSP}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-all"
            title="Yapay zekaya istediğin tınıyı tarif et"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Ses Tasarımı</span>
          </button>
        </div>
      </div>

      {/* Quick Timbre Bar */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-800/80">
        <span className="text-[11px] text-slate-500 font-semibold mr-1">Hazır Tınılar:</span>
        <button
          onClick={() => applyQuickTimbre('piano')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800"
        >
          Elektrik Piyano
        </button>
        <button
          onClick={() => applyQuickTimbre('synth80')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800"
        >
          80ler Analog Synth
        </button>
        <button
          onClick={() => applyQuickTimbre('pluck')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800"
        >
          Kristal Pluck
        </button>
        <button
          onClick={() => applyQuickTimbre('pad')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800"
        >
          Sıcak Ambient Pad
        </button>
        <button
          onClick={() => applyQuickTimbre('acid')}
          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-800"
        >
          Asit Bas Lead
        </button>
      </div>

      {/* AMATEUR MODE: 4 Macro Sliders */}
      {mode === 'amateur' ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Macro 1: Sıcaklık & Dolgunluk */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Sıcaklık & Bas Dolgunluğu</span>
                <span className="text-amber-400 font-mono">
                  {Math.round(synth.subOscLevel * 100)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Alt frekansları ve analog gövdeyi zenginleştirir
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={synth.subOscLevel}
              onChange={(e) => update({ subOscLevel: parseFloat(e.target.value) })}
              className="w-full mt-4 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Macro 2: Parlaklık & Keskinlik */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Parlaklık & Netlik</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round((synth.filterCutoff / 10000) * 100)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Filtreyi açarak tınıyı daha açık ve ışıltılı yapar
              </p>
            </div>
            <input
              type="range"
              min={400}
              max={12000}
              step={100}
              value={synth.filterCutoff}
              onChange={(e) => update({ filterCutoff: parseFloat(e.target.value) })}
              className="w-full mt-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Macro 3: Boşluk & Yankı */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Mekan & Yankı (Reverb/Eko)</span>
                <span className="text-purple-400 font-mono">
                  {Math.round(synth.reverbMix * 100)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Büyük konser salonu veya sonsuz uzay hissi katar
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={0.7}
              step={0.02}
              value={synth.reverbMix}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                update({ reverbMix: val, delayMix: val * 0.8 });
              }}
              className="w-full mt-4 accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Macro 4: Analog Doygunluk */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Analog Güç & Karakter</span>
                <span className="text-rose-400 font-mono">
                  {Math.round(synth.distortion * 100)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tüplü amfi sıcaklığı ve hafif distortion ekler
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.02}
              value={synth.distortion}
              onChange={(e) => update({ distortion: parseFloat(e.target.value) })}
              className="w-full mt-4 accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      ) : (
        /* INTELLECTUAL MODE: Detailed Modular DSP Sections */
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Section 1: Oscillators */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
              <span>Osilatör Motoru</span>
              <Waves className="w-3.5 h-3.5" />
            </div>

            {/* Waveform Selector */}
            <div>
              <label className="text-[11px] text-slate-400">Ana Dalga Formu:</label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {(['sine', 'triangle', 'sawtooth', 'square'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => update({ oscType: w })}
                    className={`py-1 text-[10px] font-mono uppercase rounded border transition-all ${
                      synth.oscType === w
                        ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Oscillator */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Alt Osilatör (Sub -1 Oct):</span>
                <span className="font-mono text-indigo-300">
                  {Math.round(synth.subOscLevel * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={synth.subOscLevel}
                onChange={(e) => update({ subOscLevel: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Detune Cents */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Detune (Unison Cents):</span>
                <span className="font-mono text-indigo-300">{synth.detuneCents}¢</span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={synth.detuneCents}
                onChange={(e) => update({ detuneCents: parseInt(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Resonant Filter */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span>Biquad Filtre</span>
              <Activity className="w-3.5 h-3.5" />
            </div>

            {/* Filter Type */}
            <div className="grid grid-cols-3 gap-1">
              {(['lowpass', 'highpass', 'bandpass'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ filterType: t })}
                  className={`py-1 text-[10px] font-mono uppercase rounded border transition-all ${
                    synth.filterType === t
                      ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'lowpass' ? 'LP' : t === 'highpass' ? 'HP' : 'BP'}
                </button>
              ))}
            </div>

            {/* Cutoff Hz */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Kesim Frekansı (Cutoff):</span>
                <span className="font-mono text-cyan-300">{Math.round(synth.filterCutoff)} Hz</span>
              </div>
              <input
                type="range"
                min={80}
                max={16000}
                step={50}
                value={synth.filterCutoff}
                onChange={(e) => update({ filterCutoff: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Resonance Q */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Rezonans (Q Faktörü):</span>
                <span className="font-mono text-cyan-300">{synth.filterResonance.toFixed(1)} Q</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={15}
                step={0.5}
                value={synth.filterResonance}
                onChange={(e) => update({ filterResonance: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* Section 3: ADSR Envelope */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              <span>ADSR Zarfı</span>
              <span className="text-[10px] font-mono text-slate-500">Amplitude</span>
            </div>

            {/* ADSR visual sliders */}
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Attack (A):</span>
                  <span className="font-mono text-emerald-300">{(synth.attack * 1000).toFixed(0)} ms</span>
                </div>
                <input
                  type="range"
                  min={0.005}
                  max={1.5}
                  step={0.01}
                  value={synth.attack}
                  onChange={(e) => update({ attack: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Decay (D):</span>
                  <span className="font-mono text-emerald-300">{(synth.decay * 1000).toFixed(0)} ms</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={2.0}
                  step={0.05}
                  value={synth.decay}
                  onChange={(e) => update({ decay: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Sustain (S):</span>
                  <span className="font-mono text-emerald-300">{Math.round(synth.sustain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={synth.sustain}
                  onChange={(e) => update({ sustain: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Release (R):</span>
                  <span className="font-mono text-emerald-300">{(synth.release * 1000).toFixed(0)} ms</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={3.0}
                  step={0.05}
                  value={synth.release}
                  onChange={(e) => update({ release: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: FX & LFO Matrix */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center justify-between">
              <span>Efektler & LFO Matrisi</span>
              <Radio className="w-3.5 h-3.5" />
            </div>

            {/* Delay & Reverb */}
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Delay (Eko) Karışımı:</span>
                  <span className="font-mono text-pink-300">{Math.round(synth.delayMix * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={synth.delayMix}
                  onChange={(e) => update({ delayMix: parseFloat(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400">
                  <span>Reverb (Yankı) Karışımı:</span>
                  <span className="font-mono text-pink-300">{Math.round(synth.reverbMix * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={synth.reverbMix}
                  onChange={(e) => update({ reverbMix: parseFloat(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>

              {/* LFO Destination */}
              <div>
                <label className="text-[10px] text-slate-400">LFO Hedefi (Modülasyon):</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {(['none', 'filter', 'pitch'] as const).map((dest) => (
                    <button
                      key={dest}
                      onClick={() => update({ lfoDestination: dest })}
                      className={`py-0.5 text-[9px] uppercase rounded border transition-all ${
                        synth.lfoDestination === dest
                          ? 'bg-pink-600 border-pink-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {dest === 'none' ? 'Kapalı' : dest === 'filter' ? 'Filtre' : 'Vibrato'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
