import React, { useState } from 'react';
import { ViewMode, StepNote, AIMelodyResult, AIHarmonyAnalysis, SynthSettings } from '../types/music';
import { audioEngine } from '../audio/audioEngine';
import {
  Sparkles,
  X,
  Play,
  Check,
  Brain,
  Sliders,
  HelpCircle,
  Lightbulb,
  Music,
  RefreshCw,
  Award,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ViewMode;
  currentScale: string;
  rootNote: string;
  bpm: number;
  existingNotes: StepNote[];
  onApplyMelody: (notes: StepNote[]) => void;
  onApplyDSPPreset: (synth: Partial<SynthSettings>) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentScale,
  rootNote,
  bpm,
  existingNotes,
  onApplyMelody,
  onApplyDSPPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'melody' | 'analyze' | 'dsp'>('melody');

  // Melody State
  const [genre, setGenre] = useState<string>('Synthwave');
  const [mood, setMood] = useState<string>('Enerjik ve Melankolik');
  const [prompt, setPrompt] = useState<string>('');
  const [melodyLoading, setMelodyLoading] = useState<boolean>(false);
  const [melodyResult, setMelodyResult] = useState<AIMelodyResult | null>(null);
  const [melodyError, setMelodyError] = useState<string | null>(null);

  // Analysis State
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIHarmonyAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // DSP Preset State
  const [dspPrompt, setDspPrompt] = useState<string>('80ler nostaljik analog synthesizer, tape wow/flutter ve parlak mekan yankısı');
  const [dspLoading, setDspLoading] = useState<boolean>(false);
  const [dspResult, setDspResult] = useState<any | null>(null);
  const [dspError, setDspError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Generate Melody
  const handleGenerateMelody = async () => {
    setMelodyLoading(true);
    setMelodyError(null);
    try {
      const response = await fetch('/api/ai/suggest-melody', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          scale: `${rootNote} ${currentScale}`,
          tempo: bpm,
          mode,
          mood,
          prompt,
          existingNotes: existingNotes.map((n) => ({ pitch: n.pitch, step: n.step })),
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Hata oluştu');
      setMelodyResult(data.data);
    } catch (err: any) {
      setMelodyError(err.message || 'Melodi oluşturulamadı');
    } finally {
      setMelodyLoading(false);
    }
  };

  // Preview generated melody
  const previewAIMelody = () => {
    if (!melodyResult || !melodyResult.notes) return;
    audioEngine.ensureContext();
    const stepDuration = 60 / bpm / 4; // 16th note duration
    melodyResult.notes.forEach((n) => {
      setTimeout(() => {
        audioEngine.playNote(n.midi, (n.duration || 1) * stepDuration * 0.9, n.velocity || 0.85);
      }, n.step * stepDuration * 1000);
    });
  };

  // Apply to project
  const applyMelodyToProject = () => {
    if (!melodyResult) return;
    const newNotes: StepNote[] = melodyResult.notes.map((n, i) => ({
      id: `ai-${n.step}-${n.midi}-${Date.now()}-${i}`,
      step: n.step,
      pitch: n.pitch,
      midi: n.midi,
      duration: n.duration || 1,
      velocity: n.velocity || 0.85,
      cents: 0,
    }));
    onApplyMelody(newNotes);
    onClose();
  };

  // 2. Analyze Current Harmony
  const handleAnalyzeHarmony = async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const response = await fetch('/api/ai/analyze-harmony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: existingNotes.map((n) => ({ pitch: n.pitch, step: n.step, midi: n.midi })),
          scale: `${rootNote} ${currentScale}`,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Hata oluştu');
      setAnalysisResult(data.data);
    } catch (err: any) {
      setAnalysisError(err.message || 'Armoni analizi yapılamadı');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 3. DSP Sound Generator
  const handleGenerateDSP = async () => {
    setDspLoading(true);
    setDspError(null);
    try {
      const response = await fetch('/api/ai/dsp-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: dspPrompt }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Hata oluştu');
      setDspResult(data.data);
    } catch (err: any) {
      setDspError(err.message || 'DSP ayarları oluşturulamadı');
    } finally {
      setDspLoading(false);
    }
  };

  const applyDSPToSynth = () => {
    if (!dspResult) return;
    const newSynth: Partial<SynthSettings> = {
      oscType: dspResult.oscillator?.type || 'sawtooth',
      subOscLevel: dspResult.oscillator?.subOscLevel ?? 0.3,
      detuneCents: dspResult.oscillator?.detuneCents ?? 5,
      filterType: dspResult.filter?.type || 'lowpass',
      filterCutoff: dspResult.filter?.cutoffHz || 3000,
      filterResonance: dspResult.filter?.resonanceQ || 2,
      attack: dspResult.envelope?.attack || 0.02,
      decay: dspResult.envelope?.decay || 0.3,
      sustain: dspResult.envelope?.sustain || 0.6,
      release: dspResult.envelope?.release || 0.4,
      distortion: dspResult.fx?.distortionDrive || 0.1,
      delayTime: dspResult.fx?.delayTime || 0.25,
      delayFeedback: dspResult.fx?.delayFeedback || 0.3,
      delayMix: dspResult.fx?.delayWet || 0.2,
      reverbDecay: dspResult.fx?.reverbDecay || 2.0,
      reverbMix: dspResult.fx?.reverbWet || 0.25,
      lfoRate: dspResult.lfo?.rateHz || 3,
      lfoDepth: dspResult.lfo?.depth || 0.2,
      lfoDestination: dspResult.lfo?.destination || 'filter',
    };
    onApplyDSPPreset(newSynth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Yapay Zeka Müzik Danışmanı</h2>
              <p className="text-xs text-slate-400">
                Gemini 3.8 Flash tabanlı kompozisyon, armoni teorisi ve ses tasarımı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6">
          <button
            onClick={() => setActiveTab('melody')}
            className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'melody'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Melodi & Motif Üret</span>
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'analyze'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Müzik Teorisi & Armoni Analizi</span>
          </button>
          <button
            onClick={() => setActiveTab('dsp')}
            className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'dsp'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Akıllı Ses Tasarımcısı (DSP)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: MELODY GENERATOR */}
          {activeTab === 'melody' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Müzik Tarzı (Tür):</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Synthwave / Cyberpunk">Synthwave / Retro 80ler</option>
                    <option value="Klasik Türk Müziği & Makam">Klasik Türk Müziği & Makam</option>
                    <option value="Lo-Fi & Chillhop">Lo-Fi Hip-Hop / Chillhop</option>
                    <option value="Barok Kontrpuan (J.S. Bach)">Barok Kontrpuan (J.S. Bach)</option>
                    <option value="Caz & Bebop">Caz & Bebop Modal</option>
                    <option value="Pop & Dans">Modern Pop & Dans</option>
                    <option value="Sinematik & Ambient">Sinematik & Epik Ambient</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Duygu & Karakter:</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Enerjik ve Melankolik">Enerjik ve Melankolik</option>
                    <option value="Hüzünlü, Derin ve Düşünceli">Hüzünlü, Derin ve Düşünceli</option>
                    <option value="Masalsı, Büyülü ve Gizemli">Masalsı, Büyülü ve Gizemli</option>
                    <option value="Neşeli, Aydınlık ve Coşkulu">Neşeli, Aydınlık ve Coşkulu</option>
                    <option value="Karanlık, Gerilim Dolu ve Asit">Karanlık, Gerilim Dolu ve Asit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Özel İstek / İlham Notu (İsteğe bağlı):
                </label>
                <input
                  type="text"
                  placeholder="Örn: Nakarat için akılda kalıcı bir yükseliş ve ardından yumuşak bir iniş olsun..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400">
                  Hedef Ton: <span className="font-mono text-indigo-400 font-bold">{rootNote} {currentScale}</span> | {bpm} BPM
                </div>

                <button
                  onClick={handleGenerateMelody}
                  disabled={melodyLoading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {melodyLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Melodi Besteleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Melodi Oluştur</span>
                    </>
                  )}
                </button>
              </div>

              {melodyError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300">
                  {melodyError}
                </div>
              )}

              {/* Melody Results Display */}
              {melodyResult && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white">{melodyResult.title}</h3>
                      <span className="text-[10px] text-indigo-400 font-mono">
                        {melodyResult.scaleDetected} ({melodyResult.notes.length} Nota)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={previewAIMelody}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Dinle</span>
                      </button>

                      <button
                        onClick={applyMelodyToProject}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Projeye Aktar</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Insights: Amateur & Intellectual */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Beginner Box */}
                    <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-300 mb-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Amatörler İçin Pratik İpucu</span>
                      </div>
                      <p className="text-[11px] text-teal-200/90 leading-relaxed">
                        {melodyResult.beginnerTip}
                      </p>
                    </div>

                    {/* Intellectual Box */}
                    <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300 mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Entelektüel Müzik Teorisi Analizi</span>
                      </div>
                      <p className="text-[11px] text-indigo-200/90 leading-relaxed font-mono">
                        {melodyResult.musicalRationale}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Chords */}
                  {melodyResult.recommendedChords && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Önerilen Eşlik Akorları (Armoni Dizilimi):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                        {melodyResult.recommendedChords.map((c, i) => (
                          <div
                            key={i}
                            className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center"
                          >
                            <div className="text-xs font-bold text-indigo-300 font-mono">
                              {c.chordName}
                            </div>
                            <div className="text-[10px] text-amber-400 font-mono">
                              {c.romanNumeral}
                            </div>
                            <div className="text-[9px] text-slate-500 truncate">{c.function}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HARMONY ANALYSIS */}
          {activeTab === 'analyze' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Mevcut Besteyi İncele
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Piyano rulosundaki {existingNotes.length} notayı konservatuar ve müzikoloji gözüyle denetler
                  </p>
                </div>

                <button
                  onClick={handleAnalyzeHarmony}
                  disabled={analysisLoading || existingNotes.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all shadow-md"
                >
                  {analysisLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analiz Ediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-3.5 h-3.5" />
                      <span>Bestemi Analiz Et</span>
                    </>
                  )}
                </button>
              </div>

              {existingNotes.length === 0 && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300">
                  Henüz piyano rulosuna hiç nota eklemediniz. Lütfen birkaç nota ekleyin veya bir şablon yükleyin.
                </div>
              )}

              {analysisError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300">
                  {analysisError}
                </div>
              )}

              {analysisResult && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Rating & Melodic Arc */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        Harmonik Uyum Puanı
                      </span>
                      <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
                        {analysisResult.harmonicRating}/100
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        Melodik Kontur (Yay)
                      </span>
                      <div className="text-sm font-bold text-slate-200 mt-1">
                        {analysisResult.melodicContour}
                      </div>
                    </div>
                  </div>

                  {/* Deep Intellectual Section */}
                  <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Award className="w-4 h-4" />
                      <span>Entelektüel Müzikoloji & Partitür Eleştirisi</span>
                    </div>

                    <p className="text-xs text-indigo-100/90 leading-relaxed font-mono">
                      {analysisResult.intellectualAnalysis.academicCritique}
                    </p>

                    <div className="pt-2 text-[11px] text-indigo-200 space-y-1">
                      <div>
                        <strong className="text-slate-400">Ses İletimi (Voice Leading):</strong>{' '}
                        {analysisResult.intellectualAnalysis.voiceLeadingInsight}
                      </div>
                      <div>
                        <strong className="text-slate-400">Modal Karakter:</strong>{' '}
                        {analysisResult.intellectualAnalysis.modalCharacter}
                      </div>
                    </div>

                    {analysisResult.intellectualAnalysis.cadenceSuggestions && (
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          Kadans & Çözülme Önerileri:
                        </span>
                        <ul className="list-disc list-inside text-xs text-indigo-300 mt-1 space-y-0.5">
                          {analysisResult.intellectualAnalysis.cadenceSuggestions.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Beginner Advice */}
                  <div className="p-4 bg-teal-950/30 border border-teal-800/40 rounded-2xl space-y-1.5">
                    <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>Yeni Başlayanlar İçin Dostça Tavsiye</span>
                    </div>
                    <p className="text-xs text-teal-100/90 leading-relaxed">
                      {analysisResult.amateurAdvice.summary}
                    </p>
                    <div className="text-xs text-teal-300 pt-1">
                      <strong>Sonraki Kolay Adım:</strong> {analysisResult.amateurAdvice.easyNextStep}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DSP SOUND DESIGNER */}
          {activeTab === 'dsp' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  İstediğin Sesi Doğal Dille Tarif Et:
                </label>
                <textarea
                  rows={3}
                  value={dspPrompt}
                  onChange={(e) => setDspPrompt(e.target.value)}
                  placeholder="Örn: 90'lar analog rave synthesizer, rezonant asit filtre, hafif kaset distorsiyonu ve derin uzay delay..."
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateDSP}
                  disabled={dspLoading || !dspPrompt}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-500/25 disabled:opacity-50 transition-all"
                >
                  {dspLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ses Modelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5" />
                      <span>DSP Sentez Ayarlarını Üret</span>
                    </>
                  )}
                </button>
              </div>

              {dspError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300">
                  {dspError}
                </div>
              )}

              {dspResult && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white">{dspResult.presetName}</h3>
                      <span className="text-[10px] text-pink-400 font-mono">
                        Kategori: {dspResult.category}
                      </span>
                    </div>

                    <button
                      onClick={applyDSPToSynth}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Synthesizer'a Uygula</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">{dspResult.simpleCharacter}</p>

                  <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-[11px] text-purple-200/90 font-mono leading-relaxed">
                    <strong className="text-purple-300">Akustik Sentez Gerekçesi:</strong>{' '}
                    {dspResult.acousticExplanation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
