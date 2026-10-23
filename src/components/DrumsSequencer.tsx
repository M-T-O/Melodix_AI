import React from 'react';
import { DrumStep } from '../types/music';
import { audioEngine } from '../audio/audioEngine';
import { Volume2, VolumeX, Sparkles, Trash2 } from 'lucide-react';

interface DrumsSequencerProps {
  drums: DrumStep;
  setDrums: React.Dispatch<React.SetStateAction<DrumStep>>;
  currentStep: number;
}

export const DrumsSequencer: React.FC<DrumsSequencerProps> = ({
  drums,
  setDrums,
  currentStep,
}) => {
  const toggleStep = (instrument: keyof DrumStep, index: number) => {
    audioEngine.ensureContext();
    setDrums((prev) => {
      const updated = [...prev[instrument]];
      updated[index] = !updated[index];
      if (updated[index]) {
        audioEngine.playDrum(instrument);
      }
      return { ...prev, [instrument]: updated };
    });
  };

  const previewDrum = (inst: keyof DrumStep) => {
    audioEngine.ensureContext();
    audioEngine.playDrum(inst);
  };

  // Drum presets
  const applyPreset = (type: 'four_on_floor' | 'hiphop' | 'trap' | 'clear') => {
    if (type === 'clear') {
      setDrums({
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        clap: Array(16).fill(false),
      });
      return;
    }

    if (type === 'four_on_floor') {
      setDrums({
        kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        clap: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
      });
    } else if (type === 'hiphop') {
      setDrums({
        kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
      });
    } else if (type === 'trap') {
      setDrums({
        kick: [true, false, false, true, false, false, false, false, true, false, false, false, false, true, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      });
    }
  };

  const tracks: Array<{ key: keyof DrumStep; label: string; color: string; sub: string }> = [
    { key: 'kick', label: '808 Kick', color: 'from-rose-500 to-red-600', sub: '35Hz Derin Vurucu' },
    { key: 'snare', label: 'Snare (Trampet)', color: 'from-amber-500 to-orange-600', sub: 'Akustik Çatlama' },
    { key: 'hihat', label: 'Hi-Hat (Zil)', color: 'from-cyan-400 to-blue-500', sub: 'Metalik 8kHz Titreşim' },
    { key: 'clap', label: 'Clap (El Çırpma)', color: 'from-purple-500 to-pink-600', sub: 'Stereo Çoklu Darbe' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Ritim & Davul Makinesi (808 Drum Machine)
          </h2>
          <p className="text-xs text-slate-400">
            Gerçek zamanlı osilatör ve beyaz gürültü sentezli davul kanalları
          </p>
        </div>

        {/* Rhythm Templates */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Şablonlar:</span>
          <button
            onClick={() => applyPreset('four_on_floor')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            4/4 Dans / Pop
          </button>
          <button
            onClick={() => applyPreset('hiphop')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            Boom-Bap / Lo-Fi
          </button>
          <button
            onClick={() => applyPreset('trap')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            Trap / Modern
          </button>
          <button
            onClick={() => applyPreset('clear')}
            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/40"
            title="Tüm ritimleri temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {tracks.map((track) => {
          const trackKey = track.key;
          const activeSteps = drums[trackKey];

          return (
            <div
              key={trackKey}
              className="flex items-center bg-slate-950 p-2 rounded-xl border border-slate-800/80 gap-3"
            >
              {/* Track Info & Preview */}
              <button
                onClick={() => previewDrum(trackKey)}
                className="w-36 text-left shrink-0 group flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg transition-all"
                title={`${track.label} sesini test et`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {track.label}
                  </div>
                  <div className="text-[9px] text-slate-500">{track.sub}</div>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
              </button>

              {/* 16 Steps */}
              <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 flex-1">
                {activeSteps.map((active, stepIdx) => {
                  const isQuarter = stepIdx % 4 === 0;
                  const isCurrent = currentStep === stepIdx;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(trackKey, stepIdx)}
                      className={`h-9 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold transition-all relative ${
                        active
                          ? `bg-gradient-to-t ${track.color} text-white shadow-md shadow-indigo-500/10`
                          : isQuarter
                          ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-500 border border-slate-700/50'
                          : 'bg-slate-900/70 hover:bg-slate-800 text-slate-600 border border-slate-800/50'
                      }`}
                    >
                      {/* Step Indicator Dot */}
                      {isCurrent && (
                        <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      )}
                      <span>{stepIdx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
