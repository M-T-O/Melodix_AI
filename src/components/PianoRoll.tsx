import React, { useState } from 'react';
import { StepNote, ViewMode, ScaleDefinition } from '../types/music';
import { NOTE_NAMES, generateNoteRange, getScaleMidiNotes, SCALES } from '../utils/musicTheory';
import { audioEngine } from '../audio/audioEngine';
import {
  Lock,
  Unlock,
  Volume2,
  Trash2,
  Shuffle,
  ArrowUp,
  ArrowDown,
  Repeat,
  Info,
  Sliders,
} from 'lucide-react';

interface PianoRollProps {
  notes: StepNote[];
  setNotes: React.Dispatch<React.SetStateAction<StepNote[]>>;
  currentStep: number;
  mode: ViewMode;
  rootNote: string;
  scaleId: string;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  notes,
  setNotes,
  currentStep,
  mode,
  rootNote,
  scaleId,
}) => {
  // In amateur mode, scale lock is default ON
  const [scaleLock, setScaleLock] = useState<boolean>(true);
  const [selectedNote, setSelectedNote] = useState<StepNote | null>(null);

  // Generate piano roll note rows: C3 (48) to B5 (83)
  const allNotes = generateNoteRange(48, 83);
  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  const rootMidi = 48 + (rootIndex === -1 ? 0 : rootIndex);
  const scaleMidiList = getScaleMidiNotes(rootMidi, scaleId, 48, 83);
  const scaleMidiSet = new Set(scaleMidiList);

  // Visible rows (inverted so high pitches are at the top)
  const visibleRows = (scaleLock ? allNotes.filter((n) => scaleMidiSet.has(n.midi)) : allNotes).slice().reverse();

  const handleCellClick = (step: number, midi: number, pitch: string) => {
    audioEngine.ensureContext();
    // Check if a note already exists at this step & pitch
    const existingIndex = notes.findIndex((n) => n.step === step && n.midi === midi);

    if (existingIndex !== -1) {
      // Remove note
      setNotes((prev) => prev.filter((_, i) => i !== existingIndex));
      if (selectedNote?.step === step && selectedNote?.midi === midi) {
        setSelectedNote(null);
      }
    } else {
      // Add note
      const newNote: StepNote = {
        id: `${step}-${midi}-${Date.now()}`,
        step,
        pitch,
        midi,
        duration: 1,
        velocity: 0.85,
        cents: 0,
      };
      // Preview sound
      audioEngine.playNote(midi, 0.35, 0.85, 0);
      setNotes((prev) => [...prev, newNote]);
      setSelectedNote(newNote);
    }
  };

  // Transformation tools
  const shiftOctave = (delta: number) => {
    setNotes((prev) =>
      prev.map((n) => {
        const newMidi = Math.max(36, Math.min(96, n.midi + delta * 12));
        const noteIndex = newMidi % 12;
        const octave = Math.floor(newMidi / 12) - 1;
        return {
          ...n,
          midi: newMidi,
          pitch: `${NOTE_NAMES[noteIndex]}${octave}`,
        };
      })
    );
  };

  const reverseNotes = () => {
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        step: 15 - n.step,
      }))
    );
  };

  const invertPitches = () => {
    if (notes.length === 0) return;
    const avgMidi = Math.round(notes.reduce((acc, n) => acc + n.midi, 0) / notes.length);
    setNotes((prev) =>
      prev.map((n) => {
        const invertedMidi = Math.max(48, Math.min(84, avgMidi - (n.midi - avgMidi)));
        const noteIndex = invertedMidi % 12;
        const octave = Math.floor(invertedMidi / 12) - 1;
        return {
          ...n,
          midi: invertedMidi,
          pitch: `${NOTE_NAMES[noteIndex]}${octave}`,
        };
      })
    );
  };

  const randomizeNotes = () => {
    const scale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
    const available = scaleMidiList.length > 0 ? scaleMidiList : [60, 62, 64, 65, 67, 69, 71, 72];
    const newNotes: StepNote[] = [];
    const stepCount = 16;
    for (let s = 0; s < stepCount; s += 2) {
      if (Math.random() > 0.3) {
        const randMidi = available[Math.floor(Math.random() * available.length)];
        const noteIndex = randMidi % 12;
        const octave = Math.floor(randMidi / 12) - 1;
        newNotes.push({
          id: `${s}-${randMidi}-${Date.now()}`,
          step: s,
          midi: randMidi,
          pitch: `${NOTE_NAMES[noteIndex]}${octave}`,
          duration: Math.random() > 0.5 ? 2 : 1,
          velocity: 0.75 + Math.random() * 0.2,
          cents: 0,
        });
      }
    }
    setNotes(newNotes);
  };

  const updateSelectedNote = (field: keyof StepNote, value: any) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, [field]: value };
    setSelectedNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? updated : n)));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
            <span>Nota Düzenleyici & Piyano Rulosu</span>
            <span className="text-xs font-normal text-indigo-400 font-mono">
              ({notes.length} Nota)
            </span>
          </h2>

          {/* Scale Lock Button */}
          <button
            onClick={() => setScaleLock(!scaleLock)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              scaleLock
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={
              scaleLock
                ? 'Gam Kilidi Açık: Yalnızca seçili gama uyan doğru notalar gösterilir (Hata yapmazsın)'
                : 'Kromatik Serbestlik: Tüm 12 yarı ton açık'
            }
          >
            {scaleLock ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{scaleLock ? 'Gam Kilidi (Hatasız)' : 'Kromatik (Tüm Notalar)'}</span>
          </button>
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => shiftOctave(1)}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Tüm melodiyi 1 oktav yukarı taşı"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+Oktav</span>
          </button>
          <button
            onClick={() => shiftOctave(-1)}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Tüm melodiyi 1 oktav aşağı taşı"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">-Oktav</span>
          </button>
          <button
            onClick={reverseNotes}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Geri Sar / Retrograde (Melodiyi sondan başa çevirir)"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ters Ritim</span>
          </button>
          <button
            onClick={invertPitches}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Armonik İnversiyon (Aralıkları aynalar)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aynala</span>
          </button>
          <button
            onClick={randomizeNotes}
            className="flex items-center space-x-1 px-2 py-1 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 rounded-lg border border-indigo-700/50"
            title="Rastgele Müzikal Motif Oluştur"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rastgele</span>
          </button>
          <button
            onClick={() => setNotes([])}
            className="flex items-center space-x-1 px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/40"
            title="Notaları Temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="mt-3 flex overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Left Piano Keys Column */}
        <div className="sticky left-0 z-20 bg-slate-900 pr-2 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-lg">
          {/* Header spacer */}
          <div className="h-7 border-b border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-end px-1">
            Nota
          </div>
          {visibleRows.map((row) => {
            const isRoot = row.baseNote === rootNote && !row.accidental;
            const isAccidental = Boolean(row.accidental);
            return (
              <button
                key={row.midi}
                onClick={() => {
                  audioEngine.ensureContext();
                  audioEngine.playNote(row.midi, 0.4, 0.85);
                }}
                className={`h-7 w-16 px-1.5 flex items-center justify-between text-[11px] font-mono border-b border-slate-800/60 transition-all ${
                  isRoot
                    ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-amber-400'
                    : isAccidental
                    ? 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
                title={`${row.note} (${row.frequency.toFixed(1)} Hz)`}
              >
                <span>{row.note}</span>
                {isRoot && <span className="text-[9px] uppercase px-1 rounded bg-amber-500/30">Ton</span>}
              </button>
            );
          })}
        </div>

        {/* Step Columns (0 to 15) */}
        <div className="flex-1 min-w-[560px]">
          {/* Step Numbers Header */}
          <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] h-7 border-b border-slate-800 text-[10px] font-mono text-slate-400">
            {Array.from({ length: 16 }).map((_, step) => {
              const isQuarter = step % 4 === 0;
              const isCurrent = currentStep === step;
              return (
                <div
                  key={step}
                  className={`flex items-center justify-center border-r border-slate-800/60 font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : isQuarter
                      ? 'bg-slate-800/40 text-indigo-300'
                      : 'text-slate-500'
                  }`}
                >
                  {step + 1}
                </div>
              );
            })}
          </div>

          {/* Grid Rows */}
          {visibleRows.map((row) => (
            <div key={row.midi} className="grid grid-cols-[repeat(16,minmax(0,1fr))] h-7 border-b border-slate-800/50">
              {Array.from({ length: 16 }).map((_, step) => {
                const noteOnCell = notes.find((n) => n.step === step && n.midi === row.midi);
                const isCurrent = currentStep === step;
                const isQuarter = step % 4 === 0;
                const isSelected = selectedNote?.id === noteOnCell?.id;

                return (
                  <div
                    key={step}
                    onClick={() => handleCellClick(step, row.midi, row.note)}
                    className={`relative border-r border-slate-800/40 cursor-pointer transition-all ${
                      isCurrent ? 'bg-indigo-500/10' : isQuarter ? 'bg-slate-950/40' : 'bg-transparent'
                    } hover:bg-slate-800/60`}
                  >
                    {/* Active Playhead Cursor line */}
                    {isCurrent && (
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-400 z-10 pointer-events-none" />
                    )}

                    {/* Placed Note Block */}
                    {noteOnCell && (
                      <div
                        className={`absolute inset-0.5 rounded-md flex items-center justify-center font-bold text-[10px] shadow-md transition-all ${
                          isSelected
                            ? 'ring-2 ring-white z-10'
                            : ''
                        } ${
                          mode === 'amateur'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-sans'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-mono'
                        }`}
                        title={`${noteOnCell.pitch} | Vuruş: ${step + 1} | Hız: ${(noteOnCell.velocity * 100).toFixed(0)}%`}
                      >
                        {mode === 'intellectual' && noteOnCell.cents !== 0 && (
                          <span className="text-[8px] text-amber-200 absolute -top-1 right-0.5">
                            {noteOnCell.cents! > 0 ? `+${noteOnCell.cents}` : noteOnCell.cents}¢
                          </span>
                        )}
                        <span className="truncate px-0.5">{row.baseNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Note Micro-Editor (For intellectual or precise amateur adjustments) */}
      {selectedNote && (
        <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-indigo-300 font-mono">{selectedNote.pitch}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Adım: {selectedNote.step + 1}</span>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => {
                audioEngine.ensureContext();
                audioEngine.playNote(selectedNote.midi, selectedNote.duration * 0.5, selectedNote.velocity, selectedNote.cents || 0);
              }}
              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded"
              title="Notayı Dinle"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Velocity */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Vurma Gücü (Velocity):</span>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={selectedNote.velocity}
                onChange={(e) => updateSelectedNote('velocity', parseFloat(e.target.value))}
                className="w-20 accent-indigo-500"
              />
              <span className="font-mono text-slate-300 w-8 text-right">
                {Math.round(selectedNote.velocity * 100)}%
              </span>
            </div>

            {/* Microtuning cents (Intellectual mode) */}
            {mode === 'intellectual' && (
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
                <span className="text-slate-400">Mikro Ton (Cent Detune):</span>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={selectedNote.cents || 0}
                  onChange={(e) => updateSelectedNote('cents', parseInt(e.target.value))}
                  className="w-20 accent-amber-500"
                />
                <span className="font-mono text-amber-300 w-10 text-right">
                  {selectedNote.cents || 0}¢
                </span>
              </div>
            )}

            {/* Note Duration */}
            <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-4">
              <span className="text-slate-400">Süre:</span>
              <select
                value={selectedNote.duration}
                onChange={(e) => updateSelectedNote('duration', parseFloat(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
              >
                <option value={1}>1 Adım (16lık)</option>
                <option value={2}>2 Adım (8lik)</option>
                <option value={4}>4 Adım (Dörtlük)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
