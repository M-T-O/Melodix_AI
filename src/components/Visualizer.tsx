import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { Activity, BarChart3, Radio } from 'lucide-react';

export const Visualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'wave' | 'spectrum'>('both');

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = audioEngine.getVisualizerData();
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid line in middle
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (data) {
        // Draw Spectrum Bars
        if (viewMode === 'both' || viewMode === 'spectrum') {
          const bufferLength = data.spectrum.length;
          const barCount = 48;
          const barWidth = width / barCount;

          for (let i = 0; i < barCount; i++) {
            const index = Math.floor((i / barCount) * (bufferLength * 0.75));
            const value = data.spectrum[index] || 0;
            const percent = value / 255;
            const barHeight = percent * (height * 0.7);

            // Gradient: indigo -> purple -> cyan
            const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
            grad.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
            grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0.9)');

            ctx.fillStyle = grad;
            ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight);
          }
        }

        // Draw Oscilloscope Waveform
        if (viewMode === 'both' || viewMode === 'wave') {
          const waveform = data.waveform;
          const sliceWidth = width / waveform.length;

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = isPlaying ? 8 : 2;

          ctx.beginPath();
          let x = 0;
          for (let i = 0; i < waveform.length; i++) {
            const v = waveform[i] / 128.0; // 0 to 2, 1 is center
            const y = (v * height) / 2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [viewMode, isPlaying]);

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      <div className="absolute top-2 left-3 flex items-center space-x-2 z-10">
        <span className="flex h-2 w-2 relative">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isPlaying ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isPlaying ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          ></span>
        </span>
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
          Akustik Spektrum & Osiloskop
        </span>
      </div>

      {/* Mode Buttons */}
      <div className="absolute top-2 right-3 flex items-center space-x-1 z-10 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 backdrop-blur-sm">
        <button
          onClick={() => setViewMode('both')}
          className={`px-2 py-0.5 text-[10px] rounded transition-all ${
            viewMode === 'both' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          İkili
        </button>
        <button
          onClick={() => setViewMode('wave')}
          className={`px-2 py-0.5 text-[10px] rounded transition-all ${
            viewMode === 'wave' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dalga
        </button>
        <button
          onClick={() => setViewMode('spectrum')}
          className={`px-2 py-0.5 text-[10px] rounded transition-all ${
            viewMode === 'spectrum' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Spektrum
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={90}
        className="w-full h-20 block cursor-crosshair"
      />
    </div>
  );
};
