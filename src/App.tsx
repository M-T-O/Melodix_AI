/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, StepNote, DrumStep, SynthSettings, ChordDefinition } from './types/music';
import { PRESETS } from './utils/presets';
import { exportNotesToMidiBlob, SCALES } from './utils/musicTheory';
import { audioEngine } from './audio/audioEngine';
import { Header } from './components/Header';
import { Visualizer } from './components/Visualizer';
import { PianoRoll } from './components/PianoRoll';
import { DrumsSequencer } from './components/DrumsSequencer';
import { HarmonicStudio } from './components/HarmonicStudio';
import { SynthRack } from './components/SynthRack';
import { InteractiveKeyboard } from './components/InteractiveKeyboard';
import { AIAssistantModal } from './components/AIAssistantModal';
import {
  Music,
  Sliders,
  Compass,
  Radio,
  Layers,
  Sparkles,
  Info,
  Volume2,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const defaultPreset = PRESETS[0];

  const [mode, setMode] = useState<ViewMode>('amateur');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(defaultPreset.tempo);
  const [volume, setVolume] = useState<number>(0.8);
  const [tuning, setTuning] = useState<number>(440);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [rootNote, setRootNote] = useState<string>(defaultPreset.rootNote);
  const [scaleId, setScaleId] = useState<string>(defaultPreset.scaleId);
  const [notes, setNotes] = useState<StepNote[]>(defaultPreset.notes);
  const [drums, setDrums] = useState<DrumStep>(defaultPreset.drums);
  const [synth, setSynth] = useState<SynthSettings>(defaultPreset.synth);

  const [activeTab, setActiveTab] = useState<'pianoroll' | 'drums' | 'harmony' | 'synth'>('pianoroll');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References for playback loop
  const timerRef = useRef<any>(null);
  const notesRef = useRef<StepNote[]>(notes);
  const drumsRef = useRef<DrumStep>(drums);
  const currentStepRef = useRef<number>(currentStep);
  const bpmRef = useRef<number>(bpm);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    drumsRef.current = drums;
  }, [drums]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Sync volume & tuning with audio engine
  useEffect(() => {
    audioEngine.setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setBaseTuning(tuning);
  }, [tuning]);

  // Master Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentStep(0);
      return;
    }

    audioEngine.ensureContext();
    const intervalMs = (60 / bpmRef.current / 4) * 1000; // 16th note step interval

    timerRef.current = setInterval(() => {
      const step = currentStepRef.current;

      // 1. Trigger melody notes on this step
      const stepNotes = notesRef.current.filter((n) => n.step === step);
      stepNotes.forEach((n) => {
        const stepSec = 60 / bpmRef.current / 4;
        audioEngine.playNote(
          n.midi,
          (n.duration || 1) * stepSec * 0.95,
          n.velocity || 0.8,
          n.cents || 0
        );
      });

      // 2. Trigger drum hits on this step
      const d = drumsRef.current;
      if (d.kick[step]) audioEngine.playDrum('kick');
      if (d.snare[step]) audioEngine.playDrum('snare');
      if (d.hihat[step]) audioEngine.playDrum('hihat');
      if (d.clap[step]) audioEngine.playDrum('clap');

      // 3. Advance step
      setCurrentStep((prev) => (prev + 1) % 16);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm]);

  const togglePlay = () => {
    audioEngine.ensureContext();
    setIsPlaying((prev) => !prev);
  };

  const handleSelectPreset = (presetId: string) => {
    const p = PRESETS.find((preset) => preset.id === presetId);
    if (!p) return;
    setBpm(p.tempo);
    setRootNote(p.rootNote);
    setScaleId(p.scaleId);
    setNotes(p.notes);
    setDrums(p.drums);
    setSynth(p.synth);
    audioEngine.updateSettings(p.synth);
    showToast(`"${p.title}" şablonu yüklendi!`);
  };

  const handleResetProject = () => {
    if (confirm('Tüm projeyi temizlemek istediğinize emin misiniz?')) {
      setNotes([]);
      setDrums({
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        clap: Array(16).fill(false),
      });
      showToast('Proje sıfırlandı');
    }
  };

  // Record to WAV / WebM
  const handleToggleRecord = async () => {
    if (!isRecording) {
      audioEngine.startRecording();
      setIsRecording(true);
      showToast('Kayıt başladı... Çalmaya devam edin!');
    } else {
      const blob = await audioEngine.stopRecording();
      setIsRecording(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `harmonia-recording-${Date.now()}.webm`;
        a.click();
        showToast('Ses dosyası indirildi!');
      }
    }
  };

  // Export MIDI
  const handleExportMidi = () => {
    if (notes.length === 0) {
      alert('İndirmeden önce piyano rulosuna en az bir nota ekleyin.');
      return;
    }
    const blob = exportNotesToMidiBlob(notes, bpm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmonia-melody-${rootNote}-${scaleId}.mid`;
    a.click();
    showToast('Standart MIDI dosyası indirildi (Ableton / FL Studio uyumlu)');
  };

  // Add chord notes into piano roll
  const handleAddChordToRoll = (chord: ChordDefinition) => {
    const rootIdx = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(rootNote);
    const baseMidi = 60 + (rootIdx === -1 ? 0 : rootIdx);
    const newNotes: StepNote[] = [];

    // Place chord notes across 4 steps as arpeggio or block
    chord.intervals.forEach((interval, i) => {
      const midi = baseMidi + interval;
      newNotes.push({
        id: `chord-${midi}-${Date.now()}-${i}`,
        step: i * 2,
        pitch: `M${midi}`,
        midi,
        duration: 2,
        velocity: 0.85,
        cents: 0,
      });
    });

    setNotes((prev) => [...prev, ...newNotes]);
    showToast(`${chord.name} akoru piyano rulosuna eklendi!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentScaleObj = SCALES.find((s) => s.id === scaleId) || SCALES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        bpm={bpm}
        setBpm={setBpm}
        volume={volume}
        setVolume={setVolume}
        tuning={tuning}
        setTuning={setTuning}
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        onExportMidi={handleExportMidi}
        onSelectPreset={handleSelectPreset}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onResetProject={handleResetProject}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Real-time Oscilloscope & Spectrum Visualizer */}
        <Visualizer isPlaying={isPlaying} />

        {/* Persona Mode Banner */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-all ${
            mode === 'amateur'
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
              : 'bg-indigo-950/30 border-indigo-800/40 text-indigo-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`p-1.5 rounded-lg font-bold ${
                mode === 'amateur'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-indigo-500/20 text-indigo-300'
              }`}
            >
              {mode === 'amateur' ? 'SEZGİSEL & AMATÖR MOD' : 'ENTELEKTÜEL & USTA MOD'}
            </span>
            <span className="text-slate-300">
              {mode === 'amateur'
                ? 'Gam kilidi devrede (yanlış nota basamazsınız), 4 büyük ses kadranı ve hazır ritimler.'
                : 'Tam modal & makam teorisi, mikroakort (cents detune), beşliler çemberi ve tam DSP sentez motoru.'}
            </span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
            <span>Aktif Gam:</span>
            <span className="font-bold text-amber-300">
              {rootNote} {currentScaleObj.nameTr}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 rounded-2xl gap-2">
          <button
            onClick={() => setActiveTab('pianoroll')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pianoroll'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Nota Düzenleyici (Piyano Rulosu)</span>
          </button>

          <button
            onClick={() => setActiveTab('drums')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drums'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>808 Davul & Ritim Makinesi</span>
          </button>

          <button
            onClick={() => setActiveTab('harmony')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'harmony'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Armoni & Beşliler Çemberi</span>
          </button>

          <button
            onClick={() => setActiveTab('synth')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'synth'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Ses Sentezi & DSP Efektleri</span>
          </button>
        </div>

        {/* Tab Panes */}
        {activeTab === 'pianoroll' && (
          <PianoRoll
            notes={notes}
            setNotes={setNotes}
            currentStep={currentStep}
            mode={mode}
            rootNote={rootNote}
            scaleId={scaleId}
          />
        )}

        {activeTab === 'drums' && (
          <DrumsSequencer drums={drums} setDrums={setDrums} currentStep={currentStep} />
        )}

        {activeTab === 'harmony' && (
          <HarmonicStudio
            mode={mode}
            rootNote={rootNote}
            setRootNote={setRootNote}
            scaleId={scaleId}
            setScaleId={setScaleId}
            onAddChordToRoll={handleAddChordToRoll}
          />
        )}

        {activeTab === 'synth' && (
          <SynthRack
            mode={mode}
            synth={synth}
            setSynth={setSynth}
            onOpenAIDSP={() => setIsAIModalOpen(true)}
          />
        )}

        {/* Sticky Interactive Virtual Piano Keyboard */}
        <InteractiveKeyboard rootNote={rootNote} scaleId={scaleId} />
      </main>

      {/* AI Assistant Modal (Gemini 3.8 Flash) */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        mode={mode}
        currentScale={currentScaleObj.nameTr}
        rootNote={rootNote}
        bpm={bpm}
        existingNotes={notes}
        onApplyMelody={(newNotes) => {
          setNotes(newNotes);
          showToast('Yapay zeka melodisi piyano rulosuna aktarıldı!');
        }}
        onApplyDSPPreset={(newSynth) => {
          setSynth((prev) => ({ ...prev, ...newSynth }));
          audioEngine.updateSettings(newSynth);
          showToast('Yapay zeka DSP sentez ayarları uygulandı!');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-xl border border-indigo-400 text-xs font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
