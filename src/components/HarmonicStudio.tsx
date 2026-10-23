import React from 'react';
import { ViewMode, ChordDefinition, StepNote } from '../types/music';
import {
  NOTE_NAMES,
  NOTE_NAMES_TR,
  SCALES,
  getChordsForScale,
  CIRCLE_OF_FIFTHS,
  CircleKey,
} from '../utils/musicTheory';
import { audioEngine } from '../audio/audioEngine';
import { Compass, Music2, Layers, Sparkles, BookOpen, Volume2, Plus } from 'lucide-react';

interface HarmonicStudioProps {
  mode: ViewMode;
  rootNote: string;
  setRootNote: (r: string) => void;
  scaleId: string;
  setScaleId: (s: string) => void;
  onAddChordToRoll?: (chord: ChordDefinition) => void;
}

export const HarmonicStudio: React.FC<HarmonicStudioProps> = ({
  mode,
  rootNote,
  setRootNote,
  scaleId,
  setScaleId,
  onAddChordToRoll,
}) => {
  const currentScale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
  const diatonicChords = getChordsForScale(rootNote, scaleId);

  // Play polyphonic chord through the audio engine
  const playChord = (chord: ChordDefinition) => {
    audioEngine.ensureContext();
    const rootIdx = NOTE_NAMES.indexOf(rootNote);
    const baseMidi = 60 + (rootIdx === -1 ? 0 : rootIdx); // C4

    chord.intervals.forEach((interval, idx) => {
      // Stagger slightly by 15ms for human strum feeling
      setTimeout(() => {
        audioEngine.playNote(baseMidi + interval, 1.2, 0.75 - idx * 0.05);
      }, idx * 18);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Armoni Laboratuvarı & Beşliler Çemberi
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'amateur'
                ? 'Şarkının tonunu ve birbiriyle kusursuz uyum sağlayan akorları seç'
                : 'Modal analiz, derecelendirme (Roman Numeral) ve harmonik çekim merkezleri'}
            </p>
          </div>
        </div>

        {/* Root Note Picker */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Kök Nota (Tonik):</span>
          <div className="flex flex-wrap gap-1">
            {NOTE_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => setRootNote(name)}
                className={`w-7 h-7 text-xs font-mono font-bold rounded-lg transition-all ${
                  rootNote === name
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Scales on Left, Circle of Fifths & Chords on Right */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Scales & Makams list */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Gam & Makam Seçimi</span>
            <span className="text-[10px] text-indigo-400 font-normal">
              {SCALES.length} Sistem Mevcut
            </span>
          </div>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {SCALES.map((scale) => {
              const isSelected = scale.id === scaleId;
              return (
                <div
                  key={scale.id}
                  onClick={() => setScaleId(scale.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-indigo-300' : 'text-slate-200'
                      }`}
                    >
                      {rootNote} {scale.nameTr}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                        scale.category === 'makam'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : scale.category === 'modal'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : scale.category === 'world'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {scale.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {mode === 'amateur' ? scale.amateurVibe : scale.description}
                  </p>

                  {/* Intellectual Note */}
                  {mode === 'intellectual' && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[10px] text-indigo-300/90 font-mono">
                      {scale.intellectualNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Circle of Fifths & Diatonic Chords */}
        <div className="lg:col-span-7 space-y-4">
          {/* Diatonic Chord Pads */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {mode === 'amateur' ? 'Tek Tuşla Uyumlu Akor Pedleri' : 'Diyatonik & Modal Akor Çözülmeleri'}
                </span>
              </span>
              <span className="text-[10px] text-slate-400">Tıkla ve Dinle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {diatonicChords.map((chord, index) => (
                <div
                  key={index}
                  className="group relative bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => playChord(chord)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white font-mono group-hover:text-indigo-300 transition-colors">
                      {chord.name}
                    </span>
                    <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-amber-300 font-semibold">
                      {chord.romanNumeral}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{chord.function}</div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Volume2 className="w-3 h-3" />
                      <span>Çal</span>
                    </span>

                    {onAddChordToRoll && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddChordToRoll(chord);
                        }}
                        className="p-1 hover:bg-indigo-600 hover:text-white rounded text-slate-400 transition-colors"
                        title="Bu akorun notalarını piyano rulosuna ekle"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circle of Fifths Visual Wheel */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Beşliler Çemberi (Circle of Fifths)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {mode === 'amateur'
                  ? 'Komşu tonlar kulağa en uyumlu gelen kardeş tonlardır'
                  : 'Modülasyon yolları ve alterasyon sayısı'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {CIRCLE_OF_FIFTHS.map((k) => {
                const isCurrentMajor = rootNote === k.major;
                return (
                  <button
                    key={k.major}
                    onClick={() => setRootNote(k.major)}
                    className={`p-1.5 rounded-lg text-center border transition-all ${
                      isCurrentMajor
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{k.major}</div>
                    <div className="text-[9px] text-slate-500">{k.minor}</div>
                    {mode === 'intellectual' && (
                      <div className="text-[8px] text-slate-600 font-mono">
                        {k.accidentals > 0
                          ? `+${k.accidentals}#`
                          : k.accidentals < 0
                          ? `${k.accidentals}b`
                          : '0'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
