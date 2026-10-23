import { ScaleDefinition, ChordDefinition, NotePitch, StepNote } from '../types/music';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_TR = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    nameTr: 'Doğal Majör (İyonik)',
    category: 'major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Klasik batı müziğinin ve pop şarkılarının temel parlak, dengeli ve neşeli gamı.',
    intellectualNote: 'Tüm aralıklar majör ve tamdır (1, 2, 3, 4, 5, 6, 7). 7. derece (yeden nota / leading tone) toniğe güçlü bir çekim kuvveti uygular.',
    amateurVibe: 'Pozitif, aydınlık, neşeli ve hatasız çalması en kolay gam.',
  },
  {
    id: 'natural_minor',
    name: 'Natural Minor (Aeolian)',
    nameTr: 'Doğal Minör (Eolyen)',
    category: 'minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Duygusal, içe dönük, melankolik ve epik tınıların vazgeçilmezi.',
    intellectualNote: 'Majör gamın 6. derecesinden türetilir. Küçük üçlü, küçük altılı ve küçük yedili içerir (1, 2, b3, 4, 5, b6, b7). Subtonik (b7) yeden nota özelliği göstermez.',
    amateurVibe: 'Duygusal, biraz hüzünlü ve etkileyici film müziği hissi.',
  },
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    nameTr: 'Armonik Minör',
    category: 'minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Klasik batı armonisinin dominant (V7) gerilimini sağlayan egzotik minör gam.',
    intellectualNote: 'Doğal minörün 7. derecesi yarım ton tizleştirilir (1, 2, b3, 4, 5, b6, 7). b6 ile 7 arasındaki artık ikili (augmented second) Orta Doğu ve Neoklasik tınısı yaratır.',
    amateurVibe: 'Dramatik, gizemli ve Orta Doğu / Neoklasik esintili.',
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    nameTr: 'Doryen Modu',
    category: 'modal',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Minörün hüznü ile majör 6. derecenin asil ışığını birleştiren mistik mod.',
    intellectualNote: 'Minör gamın doğal 6. dereceye (natürel 6) sahip halidir (1, 2, b3, 4, 5, 6, b7). Miles Davis (So What), Pink Floyd ve Daft Punk (Get Lucky) klasiğidir.',
    amateurVibe: 'Havalı, fütüristik synthwave ve caz tınısı.',
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    nameTr: 'Frigyen Modu',
    category: 'modal',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Karanlık, tutkulu, flamenko ve metal müzikte sıkça kullanılan sert mod.',
    intellectualNote: 'Toniğin hemen üstündeki küçük ikili (b2) aralığı derin bir karanlık ve gerilim yaratır (1, b2, b3, 4, 5, b6, b7). Neapolitan akorunun mod kaynağıdır.',
    amateurVibe: 'Karanlık, gerilim dolu ve İspanyol/Flamenko hissi.',
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    nameTr: 'Lidyen Modu',
    category: 'modal',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Uzaysal, rüya gibi, havada süzülen film ve bilim kurgu temaları için ideal mod.',
    intellectualNote: 'Artık dörtlü (tritone / #4) içeren tek diyatonik moddur (1, 2, 3, #4, 5, 6, 7). Yerçekimsiz, mistik ve akustik rezonansı en yüksek tınıdır.',
    amateurVibe: 'Uzayda süzülme hissi, masalsı ve sihirli melodiler.',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    nameTr: 'Miksolidyen Modu',
    category: 'modal',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Blues, Rock ve Funk müziğin omurgası olan enerjik ve özgür majör mod.',
    intellectualNote: 'Majör gamın küçük yediliye (b7) sahip halidir (1, 2, 3, 4, 5, 6, b7). Dominant 7li akorunun doğduğu doğal harmonik kaynaktır.',
    amateurVibe: 'Blues & Rock havası, ritmik ve canlı.',
  },
  {
    id: 'pentatonic_major',
    name: 'Major Pentatonic',
    nameTr: 'Majör Pentatonik',
    category: 'major',
    intervals: [0, 2, 4, 7, 9],
    description: 'Hiçbir uyumsuz (dissonant) nota içermeyen 5 notalı evrensel müzik gamı.',
    intellectualNote: '4. (fa) ve 7. (si) dereceler çıkarılarak tritone gerilimi yok edilmiştir. Çin, Kelt, Anadolu ve Amerikan folk müziğinin ortak paydasıdır.',
    amateurVibe: 'Hata yapması imkansız! Hangi notaya bassan kulağa harika gelir.',
  },
  {
    id: 'pentatonic_minor',
    name: 'Minor Pentatonic & Blues',
    nameTr: 'Minör Pentatonik & Blues',
    category: 'minor',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Rock, blues, R&B ve pop sololarının vazgeçilmez 6 notalı güç kaynağı.',
    intellectualNote: 'Minör pentatoniğe tritone mavi nota (b5 / diminished fifth) eklenerek hüzünlü ve agresif blues karakteri elde edilir (1, b3, 4, b5, 5, b7).',
    amateurVibe: 'Efsanevi gitar soloları ve akılda kalıcı nakaratlar için birebir.',
  },
  {
    id: 'hicaz',
    name: 'Hicaz Makamı',
    nameTr: 'Hicaz Makamı',
    category: 'makam',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    description: 'Geleneksel Türk Sanat ve Halk Müziğinin en etkileyici, tutkulu makamlarından biri.',
    intellectualNote: 'Dügâh perdesinde Hicaz dörtlüsü (1, b2, 3, 4) ve Neva perdesinde Rast veya Buselik beşlisinden oluşur. Artık ikili adımı derin bir lirizm taşır.',
    amateurVibe: 'Doğu ezgileri, nostaljik ve kalbe dokunan Türk müziği ruhu.',
  },
  {
    id: 'nihavend',
    name: 'Nihavend Makamı',
    nameTr: 'Nihavend Makamı',
    category: 'makam',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Batı müziğindeki armonik minöre en yakın, asil ve zarif Türk müziği makamı.',
    intellectualNote: 'Rast perdesinde Buselik beşlisi ve Kürdi veya Hicaz dörtlüsü ile genişler. Klasik Türk bestecilerinin en sevdiği melodik geçiş alanıdır.',
    amateurVibe: 'Zarif, asil, hüzünlü ve akıcı melodi yapısı.',
  },
  {
    id: 'whole_tone',
    name: 'Whole Tone (Debussy)',
    nameTr: 'Tam Ses Gamı (Empresyonizm)',
    category: 'world',
    intervals: [0, 2, 4, 6, 8, 10],
    description: 'Tonal merkezi olmayan, rüya ve su altı hissi veren simetrik empresyonist gam.',
    intellectualNote: 'Sadece tam ton adımlarından oluşur. Tonal çekim, yeden nota veya tonik hissi barındırmaz. Claude Debussy ve Thelonious Monk tarafından ustalıkla kullanılmıştır.',
    amateurVibe: 'Zamanın durduğu, rüyalar alemi ve film geçiş efektleri.',
  },
  {
    id: 'japanese_insen',
    name: 'Japanese Insen',
    nameTr: 'Japon İn-sen Gamı',
    category: 'world',
    intervals: [0, 1, 5, 7, 10],
    description: 'Koto ve Shakuhachi enstrümanlarında yankılanan kadim Japon pentatoniği.',
    intellectualNote: '1, b2, 4, 5, b7 aralıklarıyla Frigyen modunun pentatonik özünü yansıtır. Zen sadeliği ve meditasyonel derinlik sunar.',
    amateurVibe: 'Samuray ve anime sahnelerini andıran zen esintisi.',
  },
];

// Calculate frequency in Hz with base tuning (default 440Hz, or 432Hz)
export function getMidiFrequency(midi: number, baseA4Hz: number = 440, centsOffset: number = 0): number {
  const tunedMidi = midi + centsOffset / 100;
  return baseA4Hz * Math.pow(2, (tunedMidi - 69) / 12);
}

// Generate chromatic notes for range (e.g. C3 to B5, midi 48 to 83)
export function generateNoteRange(minMidi: number = 48, maxMidi: number = 83, baseA4Hz: number = 440): NotePitch[] {
  const notes: NotePitch[] = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    const noteIndex = m % 12;
    const baseName = NOTE_NAMES[noteIndex];
    const octave = Math.floor(m / 12) - 1;
    const note = `${baseName}${octave}`;
    const accidental = baseName.includes('#') ? '#' : '';
    const cleanBase = baseName.replace('#', '');
    notes.push({
      note,
      frequency: getMidiFrequency(m, baseA4Hz),
      midi: m,
      octave,
      baseNote: cleanBase,
      accidental: accidental as '#' | '',
    });
  }
  return notes;
}

// Get notes belonging to a specific scale
export function getScaleMidiNotes(rootMidiNote: number, scaleId: string, minMidi: number = 48, maxMidi: number = 83): number[] {
  const scale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
  const rootPitchClass = rootMidiNote % 12;
  const scalePitchClasses = new Set(scale.intervals.map((i) => (rootPitchClass + i) % 12));

  const validMidis: number[] = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    if (scalePitchClasses.has(m % 12)) {
      validMidis.push(m);
    }
  }
  return validMidis;
}

// Diatonic Chords for a given scale & root
export function getChordsForScale(rootName: string, scaleId: string): ChordDefinition[] {
  const rootIndex = NOTE_NAMES.indexOf(rootName);
  const actualRoot = rootIndex === -1 ? 0 : rootIndex;
  const scale = SCALES.find((s) => s.id === scaleId) || SCALES[0];

  const chords: ChordDefinition[] = [];
  const degrees = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  if (scale.category === 'major' || scale.id === 'major') {
    return [
      { name: `${NOTE_NAMES[actualRoot]}maj7`, romanNumeral: 'Imaj7', function: 'Tonik (Huzurlu)', intervals: [0, 4, 7, 11], color: '#38bdf8' },
      { name: `${NOTE_NAMES[(actualRoot + 2) % 12]}m7`, romanNumeral: 'ii7', function: 'Subdominant Hazırlık', intervals: [2, 5, 9, 12], color: '#818cf8' },
      { name: `${NOTE_NAMES[(actualRoot + 4) % 12]}m7`, romanNumeral: 'iii7', function: 'Tonik Uzantısı', intervals: [4, 7, 11, 14], color: '#a78bfa' },
      { name: `${NOTE_NAMES[(actualRoot + 5) % 12]}maj7`, romanNumeral: 'IVmaj7', function: 'Subdominant (Açılım)', intervals: [5, 9, 12, 16], color: '#34d399' },
      { name: `${NOTE_NAMES[(actualRoot + 7) % 12]}7`, romanNumeral: 'V7', function: 'Dominant (Güçlü Çözülme)', intervals: [7, 11, 14, 17], color: '#f59e0b' },
      { name: `${NOTE_NAMES[(actualRoot + 9) % 12]}m7`, romanNumeral: 'vi7', function: 'Göreceli Minör (Melankoli)', intervals: [9, 12, 16, 19], color: '#ec4899' },
      { name: `${NOTE_NAMES[(actualRoot + 11) % 12]}m7b5`, romanNumeral: 'viiø7', function: 'Yarı Eksilmiş Gerilim', intervals: [11, 14, 17, 21], color: '#ef4444' },
    ];
  } else if (scale.id === 'natural_minor' || scale.id === 'harmonic_minor') {
    return [
      { name: `${NOTE_NAMES[actualRoot]}m7`, romanNumeral: 'i7', function: 'Tonik Minör (Merkez)', intervals: [0, 3, 7, 10], color: '#818cf8' },
      { name: `${NOTE_NAMES[(actualRoot + 2) % 12]}m7b5`, romanNumeral: 'iiø7', function: 'Subdominant Gerilim', intervals: [2, 5, 8, 12], color: '#ef4444' },
      { name: `${NOTE_NAMES[(actualRoot + 3) % 12]}maj7`, romanNumeral: 'bIIImaj7', function: 'Göreceli Majör (Işık)', intervals: [3, 7, 10, 14], color: '#38bdf8' },
      { name: `${NOTE_NAMES[(actualRoot + 5) % 12]}m7`, romanNumeral: 'iv7', function: 'Subdominant Minör', intervals: [5, 8, 12, 15], color: '#34d399' },
      { name: `${NOTE_NAMES[(actualRoot + 7) % 12]}7`, romanNumeral: 'V7', function: 'Dominant Çözücü', intervals: [7, 11, 14, 17], color: '#f59e0b' },
      { name: `${NOTE_NAMES[(actualRoot + 8) % 12]}maj7`, romanNumeral: 'bVImaj7', function: 'Epik Kadans Katmanı', intervals: [8, 12, 15, 19], color: '#ec4899' },
      { name: `${NOTE_NAMES[(actualRoot + 10) % 12]}7`, romanNumeral: 'bVII7', function: 'Modal Geçiş (Mixolydian)', intervals: [10, 14, 17, 21], color: '#a78bfa' },
    ];
  }

  // Fallback modal chords
  return [
    { name: `${NOTE_NAMES[actualRoot]}m9`, romanNumeral: 'i9', function: 'Modal Merkez', intervals: [0, 3, 7, 10, 14], color: '#818cf8' },
    { name: `${NOTE_NAMES[(actualRoot + 5) % 12]}maj7`, romanNumeral: 'IV', function: 'Modal Renk', intervals: [5, 9, 12, 16], color: '#34d399' },
    { name: `${NOTE_NAMES[(actualRoot + 7) % 12]}m7`, romanNumeral: 'v7', function: 'Yumuşak Akış', intervals: [7, 10, 14, 17], color: '#f59e0b' },
    { name: `${NOTE_NAMES[(actualRoot + 10) % 12]}maj7`, romanNumeral: 'bVII', function: 'Epik Yükseliş', intervals: [10, 14, 17, 21], color: '#38bdf8' },
  ];
}

// Circle of Fifths Data
export interface CircleKey {
  major: string;
  minor: string;
  accidentals: number; // positive = sharps, negative = flats
  angle: number; // in degrees around clock
}

export const CIRCLE_OF_FIFTHS: CircleKey[] = [
  { major: 'C', minor: 'Am', accidentals: 0, angle: 0 },
  { major: 'G', minor: 'Em', accidentals: 1, angle: 30 },
  { major: 'D', minor: 'Bm', accidentals: 2, angle: 60 },
  { major: 'A', minor: 'F#m', accidentals: 3, angle: 90 },
  { major: 'E', minor: 'C#m', accidentals: 4, angle: 120 },
  { major: 'B', minor: 'G#m', accidentals: 5, angle: 150 },
  { major: 'F#', minor: 'D#m', accidentals: 6, angle: 180 },
  { major: 'Db', minor: 'Bbm', accidentals: -5, angle: 210 },
  { major: 'Ab', minor: 'Fm', accidentals: -4, angle: 240 },
  { major: 'Eb', minor: 'Cm', accidentals: -3, angle: 270 },
  { major: 'Bb', minor: 'Gm', accidentals: -2, angle: 300 },
  { major: 'F', minor: 'Dm', accidentals: -1, angle: 330 },
];

// Helper to write standard MIDI file (SMF format 0 or 1)
export function exportNotesToMidiBlob(notes: StepNote[], bpm: number = 120): Blob {
  // PPQ (pulses per quarter note) = 96
  const ppq = 96;
  const stepTicks = ppq / 4; // each 16th step is 24 ticks

  // Sort notes by step
  const sorted = [...notes].sort((a, b) => a.step - b.step);

  // Build MIDI events
  interface MidiEvent {
    tick: number;
    type: 'on' | 'off';
    pitch: number;
    velocity: number;
  }

  const events: MidiEvent[] = [];
  sorted.forEach((n) => {
    const onTick = n.step * stepTicks;
    const offTick = (n.step + (n.duration || 1)) * stepTicks;
    events.push({
      tick: onTick,
      type: 'on',
      pitch: n.midi,
      velocity: Math.floor((n.velocity || 0.8) * 127),
    });
    events.push({
      tick: offTick,
      type: 'off',
      pitch: n.midi,
      velocity: 0,
    });
  });

  // Sort by tick
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    // note off before note on at same tick
    return a.type === 'off' ? -1 : 1;
  });

  const trackBytes: number[] = [];

  // Track Name meta event
  trackBytes.push(0x00, 0xff, 0x03, 0x08, ...Array.from('Harmonia').map((c) => c.charCodeAt(0)));

  // Tempo meta event (microsec per quarter = 60,000,000 / bpm)
  const mpqn = Math.floor(60000000 / bpm);
  trackBytes.push(0x00, 0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);

  let lastTick = 0;
  events.forEach((ev) => {
    const delta = ev.tick - lastTick;
    lastTick = ev.tick;

    // write variable length delta
    let buffer = delta & 0x7f;
    let tempDelta = delta;
    const bytes: number[] = [];
    while ((tempDelta >>= 7)) {
      buffer <<= 8;
      buffer |= (tempDelta & 0x7f) | 0x80;
    }
    while (true) {
      bytes.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
    trackBytes.push(...bytes);

    if (ev.type === 'on') {
      trackBytes.push(0x90, ev.pitch, ev.velocity);
    } else {
      trackBytes.push(0x80, ev.pitch, 0x00);
    }
  });

  // End of Track
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // File Header: MThd, length 6, format 0, 1 track, division 96
  const header = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length 6
    0x00, 0x00, // format 0
    0x00, 0x01, // 1 track
    (ppq >> 8) & 0xff, ppq & 0xff, // division
  ];

  // Track Header: MTrk, length
  const trackLen = trackBytes.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLen >> 24) & 0xff,
    (trackLen >> 16) & 0xff,
    (trackLen >> 8) & 0xff,
    trackLen & 0xff,
  ];

  const fullFile = new Uint8Array([...header, ...trackHeader, ...trackBytes]);
  return new Blob([fullFile], { type: 'audio/midi' });
}
