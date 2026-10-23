import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Melody & Motif Generation
app.post('/api/ai/suggest-melody', async (req, res) => {
  try {
    const {
      genre = 'Synthwave',
      scale = 'C Minor (Do Minör)',
      tempo = 120,
      mode = 'both', // 'beginner' | 'intellectual' | 'both'
      mood = 'Energetic and Melancholic',
      existingNotes = [],
      prompt = '',
    } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an elite music composer, conservatory professor, and intuitive music educator.
Create a 16-step musical melody and chord progression with the following specs:
- Musical Scale / Key: ${scale}
- Genre / Aesthetic: ${genre}
- Mood / Character: ${mood}
- Tempo (BPM): ${tempo}
- Target Audience Level: ${mode === 'beginner' ? 'Beginner / Amateur (catchy, pentatonic/diatonic, easy rhythm, strong beats)' : mode === 'intellectual' ? 'Intellectual / Theorist (modal interchange, chromatic neighbor tones, rhythmic syncopation, sophisticated voice leading)' : 'Hybrid (approachable yet harmonically deep)'}
- Additional User Request: ${prompt || 'A captivating and memorable hook'}
- Existing Seed Notes (if any): ${JSON.stringify(existingNotes.slice(0, 8))}

The step grid is 16 steps (steps 0 to 15, representing a 4/4 bar with 16th notes or 2 bars of 8th notes).
Provide MIDI pitches appropriate for a lead instrument (e.g. C4 to B5, e.g. "C4", "Eb4", "G4", "Bb4", "D5").
MIDI pitch numbers: C4 is 60, D4 is 62, E4 is 64, F4 is 65, G4 is 67, A4 is 69, B4 is 71, C5 is 72, etc.

Return valid JSON adhering strictly to the response schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Creative title of the melody' },
            scaleDetected: { type: Type.STRING, description: 'The exact musical scale/mode used' },
            musicalRationale: {
              type: Type.STRING,
              description: 'In-depth music theory explanation in Turkish for the musical intellectual (voice leading, cadences, modal flavor, harmonic tension/release)',
            },
            beginnerTip: {
              type: Type.STRING,
              description: 'Friendly, simple 1-2 sentence tip in Turkish explaining why this melody sounds pleasing and how an amateur can play with it',
            },
            recommendedChords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chordName: { type: Type.STRING, description: 'e.g. Cm7, Abmaj7, G7alt, Fm9' },
                  romanNumeral: { type: Type.STRING, description: 'e.g. i7, VImaj7, V7, iv9' },
                  notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  function: { type: Type.STRING, description: 'Tonic, Subdominant, Dominant, Modal borrowing' },
                },
                required: ['chordName', 'romanNumeral', 'notes', 'function'],
              },
            },
            notes: {
              type: Type.ARRAY,
              description: 'Between 6 and 14 notes across the 16 steps (step 0 to 15)',
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER, description: 'Step index 0 to 15' },
                  pitch: { type: Type.STRING, description: 'Note name with octave e.g. C4, Eb4, G4' },
                  midi: { type: Type.INTEGER, description: 'MIDI note number 48-84' },
                  duration: { type: Type.NUMBER, description: 'Duration in steps, e.g. 1 or 2' },
                  velocity: { type: Type.NUMBER, description: 'Velocity between 0.5 and 1.0' },
                },
                required: ['step', 'pitch', 'midi', 'duration', 'velocity'],
              },
            },
          },
          required: ['title', 'scaleDetected', 'musicalRationale', 'beginnerTip', 'recommendedChords', 'notes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating melody:', error);
    return res.status(500).json({ success: false, error: error.message || 'Melodi önerisi oluşturulamadı' });
  }
});

// Endpoint: AI Music Theory & Composition Analysis
app.post('/api/ai/analyze-harmony', async (req, res) => {
  try {
    const { notes = [], scale = 'C Minor', chords = [] } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an academic musicologist and practical music mentor.
Analyze the user's current composition:
- Current Scale Selected: ${scale}
- Notes currently placed in the grid: ${JSON.stringify(notes)}
- Chords in use: ${JSON.stringify(chords)}

Provide a dual-layer analysis:
1. "Entelektüel Müzik Analizi": Form, voice leading (avoiding parallel octaves/fifths or utilizing deliberate parallels), harmonic tension points, modal ambiguity, cadential strength, rhythmic meter.
2. "Amatör / Başlangıç Tavsiyesi": Clear, actionable, encouraging feedback on rhythm, melody shape (ascending/descending curves), and how to make the hook stick in the listener's ear.
All text explanations should be in clear, eloquent Turkish.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            harmonicRating: { type: Type.NUMBER, description: 'Harmonic coherence rating 1 to 100' },
            melodicContour: { type: Type.STRING, description: 'Description of the melodic arc (e.g. Dalgalı, Yükselen Tepe, Arpej Temelli)' },
            intellectualAnalysis: {
              type: Type.OBJECT,
              properties: {
                tonalCenter: { type: Type.STRING },
                voiceLeadingInsight: { type: Type.STRING },
                modalCharacter: { type: Type.STRING },
                cadenceSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                academicCritique: { type: Type.STRING },
              },
              required: ['tonalCenter', 'voiceLeadingInsight', 'modalCharacter', 'cadenceSuggestions', 'academicCritique'],
            },
            amateurAdvice: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                easyNextStep: { type: Type.STRING },
                catchinessTip: { type: Type.STRING },
              },
              required: ['summary', 'easyNextStep', 'catchinessTip'],
            },
          },
          required: ['harmonicRating', 'melodicContour', 'intellectualAnalysis', 'amateurAdvice'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing harmony:', error);
    return res.status(500).json({ success: false, error: error.message || 'Armoni analizi yapılamadı' });
  }
});

// Endpoint: AI Synthesizer & DSP Sound Sculptor
app.post('/api/ai/dsp-preset', async (req, res) => {
  try {
    const { prompt = 'Warm vintage analog synth with tape flutter and lush space' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert audio engineer and analog synthesizer designer (Moog, Roland Juno, Prophet, Buchla).
Design sound synthesis and DSP effects parameters for the following acoustic description:
"${prompt}"

Output synth oscillator, filter, envelope, LFO, and FX parameters.
Provide both an intellectual acoustic engineering explanation and a beginner-friendly "how it feels" summary in Turkish.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            presetName: { type: Type.STRING },
            category: { type: Type.STRING, description: 'Bass, Lead, Pad, Pluck, Keys, FX' },
            acousticExplanation: { type: Type.STRING, description: 'Acoustic / DSP breakdown in Turkish' },
            simpleCharacter: { type: Type.STRING, description: 'Simple description for amateur in Turkish' },
            oscillator: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: 'sine, triangle, sawtooth, or square' },
                subOscLevel: { type: Type.NUMBER, description: '0 to 1' },
                detuneCents: { type: Type.NUMBER, description: '-50 to +50' },
              },
              required: ['type', 'subOscLevel', 'detuneCents'],
            },
            filter: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: 'lowpass, highpass, or bandpass' },
                cutoffHz: { type: Type.NUMBER, description: '80 to 18000' },
                resonanceQ: { type: Type.NUMBER, description: '0.5 to 15' },
              },
              required: ['type', 'cutoffHz', 'resonanceQ'],
            },
            envelope: {
              type: Type.OBJECT,
              properties: {
                attack: { type: Type.NUMBER, description: 'Seconds 0.005 to 2.5' },
                decay: { type: Type.NUMBER, description: 'Seconds 0.05 to 3.0' },
                sustain: { type: Type.NUMBER, description: 'Level 0.0 to 1.0' },
                release: { type: Type.NUMBER, description: 'Seconds 0.05 to 4.0' },
              },
              required: ['attack', 'decay', 'sustain', 'release'],
            },
            fx: {
              type: Type.OBJECT,
              properties: {
                distortionDrive: { type: Type.NUMBER, description: '0 to 1' },
                delayTime: { type: Type.NUMBER, description: '0.05 to 0.8 seconds' },
                delayFeedback: { type: Type.NUMBER, description: '0 to 0.85' },
                delayWet: { type: Type.NUMBER, description: '0 to 0.7' },
                reverbDecay: { type: Type.NUMBER, description: '0.5 to 6.0' },
                reverbWet: { type: Type.NUMBER, description: '0 to 0.8' },
              },
              required: ['distortionDrive', 'delayTime', 'delayFeedback', 'delayWet', 'reverbDecay', 'reverbWet'],
            },
            lfo: {
              type: Type.OBJECT,
              properties: {
                rateHz: { type: Type.NUMBER, description: '0.1 to 15' },
                depth: { type: Type.NUMBER, description: '0 to 1' },
                destination: { type: Type.STRING, description: 'filter, pitch, or amplitude' },
              },
              required: ['rateHz', 'depth', 'destination'],
            },
          },
          required: ['presetName', 'category', 'acousticExplanation', 'simpleCharacter', 'oscillator', 'filter', 'envelope', 'fx', 'lfo'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating DSP preset:', error);
    return res.status(500).json({ success: false, error: error.message || 'DSP ayarları oluşturulamadı' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Harmonia Music Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
