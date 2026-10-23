import React from 'react';
import { ViewMode } from '../types/music';
import { PRESETS } from '../utils/presets';
import {
  Play,
  Square,
  Sparkles,
  Download,
  Disc,
  Volume2,
  Sliders,
  Music,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  tuning: number;
  setTuning: (t: number) => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  onExportMidi: () => void;
  onSelectPreset: (presetId: string) => void;
  onOpenAIModal: () => void;
  onResetProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  isPlaying,
  onTogglePlay,
  bpm,
  setBpm,
  volume,
  setVolume,
  tuning,
  setTuning,
  isRecording,
  onToggleRecord,
  onExportMidi,
  onSelectPreset,
  onOpenAIModal,
  onResetProject,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Harmonia
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DAW & Lab
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Akıllı Müzik Laboratuvarı & Sentez Stüdyosu
            </p>
          </div>
        </div>

        {/* Mode Selector (Dual Persona: Amatör vs Entelektüel) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('amateur')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'amateur'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Sıcak, sezgisel, hatasız gam kilidi ve hızlı beste araçları"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sezgisel & Amatör Mod</span>
          </button>
          <button
            onClick={() => setMode('intellectual')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'intellectual'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Derin müzik teorisi, modlar, makamlar, mikroakort ve profesyonel DSP"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Entelektüel & Usta Mod</span>
          </button>
        </div>

        {/* Transport & Playback Controls */}
        <div className="flex items-center space-x-2">
          {/* Play/Stop Button */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Oynat</span>
              </>
            )}
          </button>

          {/* Record to WAV */}
          <button
            onClick={onToggleRecord}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              isRecording
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Canlı oturumu stüdyo kalitesinde WAV/WebM formatında kaydet"
          >
            <Disc className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-400' : ''}`} />
            <span>{isRecording ? 'Kaydediliyor...' : 'WAV Kaydet'}</span>
          </button>

          {/* Export MIDI */}
          <button
            onClick={onExportMidi}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Standart MIDI (.mid) dosyası indir - Ableton, FL Studio, Logic ile açabilirsin"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">MIDI İndir</span>
          </button>
        </div>

        {/* Right Controls: Tempo, Volume, Tuning, Presets, AI */}
        <div className="flex items-center space-x-3">
          {/* BPM */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">BPM</span>
            <input
              type="number"
              min={50}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-12 bg-transparent text-sm font-semibold text-center text-white focus:outline-none"
            />
          </div>

          {/* Tuning 440 vs 432 Hz */}
          {mode === 'intellectual' && (
            <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px]">Akort:</span>
              <button
                onClick={() => setTuning(tuning === 440 ? 432 : 440)}
                className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                  tuning === 432 ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300'
                }`}
                title="432Hz (Verdi / Doğal Rezonans) ile 440Hz (Standart Konser) arasında geçiş yap"
              >
                {tuning} Hz
              </button>
            </div>
          )}

          {/* Volume */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => onSelectPreset(e.target.value)}
            defaultValue=""
            className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Şablon Yükle...
            </option>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* AI Partner Button */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-500/25 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yapay Zeka Müzik Danışmanı</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetProject}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
            title="Projeyi Temizle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
