// All available scales/keys
export const SCALES = [
  { key: 'C', name: 'C Major' },
  { key: 'Db', name: 'Db Major' },
  { key: 'D', name: 'D Major' },
  { key: 'Eb', name: 'Eb Major' },
  { key: 'E', name: 'E Major' },
  { key: 'F', name: 'F Major' },
  { key: 'Gb', name: 'Gb Major' },
  { key: 'G', name: 'G Major' },
  { key: 'Ab', name: 'Ab Major' },
  { key: 'A', name: 'A Major' },
  { key: 'Bb', name: 'Bb Major' },
  { key: 'B', name: 'B Major' },
  { key: 'Random', name: 'Random' }
];

// Semitone offsets for each key from C
export const KEY_OFFSETS: Record<string, number> = {
  'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5,
  'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11
};

// Helper function to resolve actual key (handles Random selection)
export function resolveActualKey(selectedKey: string): string {
  if (selectedKey === 'Random') {
    const availableKeys = Object.keys(KEY_OFFSETS);
    return availableKeys[Math.floor(Math.random() * availableKeys.length)];
  }
  return selectedKey;
}

// Base chord degrees in C major
export const BASE_SCALE_DEGREES = {
  I: ['C4', 'E4', 'G4'],
  ii: ['D4', 'F4', 'A4'],
  iii: ['E4', 'G4', 'B4'],
  IV: ['F4', 'A4', 'C5'],
  V: ['G4', 'B4', 'D5'],
  vi: ['A4', 'C5', 'E5'],
  vii: ['B4', 'D5', 'F5'],
};

// Chord inversions
export type ChordInversion = 'root' | 'first' | 'second';

export const CHORD_INVERSIONS: Record<ChordInversion, string> = {
  root: 'Root Position',
  first: 'First Inversion',
  second: 'Second Inversion'
};

// Function to transpose a note by semitones
function transposeNote(note: string, semitones: number): string {
  const noteMatch = note.match(/([A-G]#?)(\d+)/);
  if (!noteMatch) return note;
  
  const [, noteName, octave] = noteMatch;
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = noteNames.indexOf(noteName);
  
  let newNoteIndex = (noteIndex + semitones) % 12;
  if (newNoteIndex < 0) newNoteIndex += 12;
  
  let newOctave = parseInt(octave);
  if (noteIndex + semitones >= 12) newOctave++;
  if (noteIndex + semitones < 0) newOctave--;
  
  return noteNames[newNoteIndex] + newOctave;
}

// Function to apply inversion to a chord
function applyInversion(chord: string[], inversion: ChordInversion): string[] {
  const result = [...chord];
  
  switch (inversion) {
    case 'first':
      // Move root note up an octave
      result[0] = transposeNote(result[0], 12);
      return [result[1], result[2], result[0]];
    case 'second':
      // Move root and third up an octave
      result[0] = transposeNote(result[0], 12);
      result[1] = transposeNote(result[1], 12);
      return [result[2], result[0], result[1]];
    default:
      return result;
  }
}

// Function to get the drone note for a given key
export function getDroneNote(selectedKey: string): string {
  const offset = KEY_OFFSETS[selectedKey] || 0;
  
  // Start with C2 and transpose to the selected key
  return transposeNote('C2', offset);
}

// Function to get scale degrees for Practice Mode (consistent inversion per round)
export function getPracticeScaleDegrees(
  selectedKey: string,
  selectedInversions: ChordInversion[],
  enabledDegrees: string[]
): { chords: Record<string, string[]>, currentInversion: ChordInversion } {
  const result: Record<string, string[]> = {};
  
  const offset = KEY_OFFSETS[selectedKey] || 0;
  
  // Choose ONE random inversion for this entire round
  const currentInversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
  
  enabledDegrees.forEach(degree => {
    const baseChord = BASE_SCALE_DEGREES[degree as keyof typeof BASE_SCALE_DEGREES];
    if (!baseChord) return;
    
    // Transpose to the selected key
    const transposedChord = baseChord.map(note => transposeNote(note, offset));
    
    // Apply the SAME inversion to all chords in this round
    result[degree] = applyInversion(transposedChord, currentInversion);
  });
  
  return { chords: result, currentInversion };
}

// Function to get scale degrees for a specific key and inversions
export function getScaleDegrees(
  selectedKey: string,
  selectedInversions: ChordInversion[],
  enabledDegrees: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  
  const offset = KEY_OFFSETS[selectedKey] || 0;
  
  enabledDegrees.forEach(degree => {
    const baseChord = BASE_SCALE_DEGREES[degree as keyof typeof BASE_SCALE_DEGREES];
    if (!baseChord) return;
    
    // Transpose to the selected key
    const transposedChord = baseChord.map(note => transposeNote(note, offset));
    
    // Apply random inversion from selected inversions
    const randomInversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
    result[degree] = applyInversion(transposedChord, randomInversion);
  });
  
  return result;
}

// Function to get a single chord with random inversion (for Explore mode)
export function getRandomInversionChord(
  degree: string,
  selectedKey: string,
  selectedInversions: ChordInversion[]
): string[] | null {
  const baseChord = BASE_SCALE_DEGREES[degree as keyof typeof BASE_SCALE_DEGREES];
  if (!baseChord) return null;
  
  const offset = KEY_OFFSETS[selectedKey] || 0;
  
  // Transpose to the selected key
  const transposedChord = baseChord.map(note => transposeNote(note, offset));
  
  // Apply random inversion from selected inversions
  const randomInversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
  return applyInversion(transposedChord, randomInversion);
}

export const ALL_DEGREE_NAMES = Object.keys(BASE_SCALE_DEGREES);
