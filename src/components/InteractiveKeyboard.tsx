import React, { useEffect, useState } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { NOTE_NAMES, getScaleMidiNotes } from '../utils/musicTheory';

interface InteractiveKeyboardProps {
  rootNote: string;
  scaleId: string;
  onNoteTriggered?: (midi: number) => void;
}

// 2 octaves from C4 (60) to C6 (84)
const KEYBOARD_KEYS = [
  { midi: 60, name: 'C4', key: 'a', isBlack: false },
  { midi: 61, name: 'C#4', key: 'w', isBlack: true },
  { midi: 62, name: 'D4', key: 's', isBlack: false },
  { midi: 63, name: 'D#4', key: 'e', isBlack: true },
  { midi: 64, name: 'E4', key: 'd', isBlack: false },
  { midi: 65, name: 'F4', key: 'f', isBlack: false },
  { midi: 66, name: 'F#4', key: 't', isBlack: true },
  { midi: 67, name: 'G4', key: 'g', isBlack: false },
  { midi: 68, name: 'G#4', key: 'y', isBlack: true },
  { midi: 69, name: 'A4', key: 'h', isBlack: false },
  { midi: 70, name: 'A#4', key: 'u', isBlack: true },
  { midi: 71, name: 'B4', key: 'j', isBlack: false },
  { midi: 72, name: 'C5', key: 'k', isBlack: false },
  { midi: 73, name: 'C#5', key: 'o', isBlack: true },
  { midi: 74, name: 'D5', key: 'l', isBlack: false },
  { midi: 75, name: 'D#5', key: 'p', isBlack: true },
  { midi: 76, name: 'E5', key: ';', isBlack: false },
  { midi: 77, name: 'F5', key: "'", isBlack: false },
  { midi: 78, name: 'F#5', key: ']', isBlack: true },
  { midi: 79, name: 'G5', key: 'Enter', isBlack: false },
  { midi: 80, name: 'G#5', key: '', isBlack: true },
  { midi: 81, name: 'A5', key: '', isBlack: false },
  { midi: 82, name: 'A#5', key: '', isBlack: true },
  { midi: 83, name: 'B5', key: '', isBlack: false },
  { midi: 84, name: 'C6', key: '', isBlack: false },
];

export const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  rootNote,
  scaleId,
  onNoteTriggered,
}) => {
  const [activeMidis, setActiveMidis] = useState<Set<number>>(new Set());

  // Determine scale midi notes
  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  const rootMidi = 60 + (rootIndex === -1 ? 0 : rootIndex);
  const scaleMidis = new Set(getScaleMidiNotes(rootMidi, scaleId, 60, 84));

  const triggerNote = (midi: number) => {
    audioEngine.ensureContext();
    audioEngine.playNote(midi, 0.45, 0.85);
    setActiveMidis((prev) => new Set(prev).add(midi));
    if (onNoteTriggered) onNoteTriggered(midi);

    setTimeout(() => {
      setActiveMidis((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const matched = KEYBOARD_KEYS.find((k) => k.key && k.key.toLowerCase() === e.key.toLowerCase());
      if (matched && !activeMidis.has(matched.midi)) {
        triggerNote(matched.midi);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMidis]);

  const whiteKeys = KEYBOARD_KEYS.filter((k) => !k.isBlack);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Etkileşimli Piyano Klavyesi
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            (Klavyenizin A-W-S-E-D-F tuşlarıyla veya tıklayarak çalabilirsiniz)
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[10px]">
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Kök Tonik</span>
          </span>
          <span className="flex items-center space-x-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Gam İçi Notalar</span>
          </span>
        </div>
      </div>

      {/* Piano Keys Visual Deck */}
      <div className="relative flex justify-center overflow-x-auto py-2">
        <div className="relative inline-flex h-32 bg-slate-950 p-2 rounded-xl shadow-2xl border border-slate-800">
          {/* White keys */}
          <div className="flex">
            {whiteKeys.map((key) => {
              const isRoot = (key.midi % 12) === rootIndex;
              const inScale = scaleMidis.has(key.midi);
              const isPressed = activeMidis.has(key.midi);

              return (
                <button
                  key={key.midi}
                  onMouseDown={() => triggerNote(key.midi)}
                  className={`relative w-9 h-28 mx-[1px] rounded-b-md border transition-all flex flex-col justify-end items-center pb-2 ${
                    isPressed
                      ? 'bg-indigo-300 border-indigo-400 translate-y-1 shadow-inner'
                      : 'bg-white hover:bg-slate-100 border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Indicators */}
                  {isRoot && (
                    <div className="w-2 h-2 rounded-full bg-amber-500 mb-1 ring-2 ring-amber-300" />
                  )}
                  {inScale && !isRoot && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mb-1" />
                  )}

                  <span className="text-[10px] font-bold text-slate-800 font-mono">
                    {key.name.replace(/\d/, '')}
                  </span>
                  {key.key && (
                    <span className="text-[8px] text-slate-400 uppercase font-mono mt-0.5">
                      {key.key}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Black Keys layer positioned absolutely */}
          <div className="absolute top-2 left-2 flex pointer-events-none">
            {whiteKeys.map((whiteKey, idx) => {
              // Find if this white key has a sharp black key immediately following it
              const nextBlack = KEYBOARD_KEYS.find(
                (k) => k.isBlack && k.midi === whiteKey.midi + 1
              );

              return (
                <div key={idx} className="relative w-9 mx-[1px] h-0">
                  {nextBlack && (
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        triggerNote(nextBlack.midi);
                      }}
                      className={`pointer-events-auto absolute -right-3.5 top-0 z-10 w-7 h-18 rounded-b-md transition-all flex flex-col justify-end items-center pb-1 shadow-md ${
                        activeMidis.has(nextBlack.midi)
                          ? 'bg-indigo-600 translate-y-1'
                          : 'bg-slate-900 hover:bg-slate-800 border-x border-b border-slate-700'
                      }`}
                    >
                      {scaleMidis.has(nextBlack.midi) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mb-1" />
                      )}
                      <span className="text-[8px] text-slate-300 font-mono">
                        {nextBlack.name.replace(/\d/, '')}
                      </span>
                      {nextBlack.key && (
                        <span className="text-[7px] text-slate-500 uppercase font-mono">
                          {nextBlack.key}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
