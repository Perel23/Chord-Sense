import * as Tone from 'tone';
import { useState, useRef, useEffect } from 'react';
import { getPracticeScaleDegrees, CHORD_INVERSIONS, getDroneNote, resolveActualKey } from '../constants/chords';
import type { ChordInversion } from '../constants/chords';
import Settings from './Settings';

interface PracticeModeProps {
  showSettings: boolean;
  selectedKey: string;
  onKeyChange: (key: string) => void;
  selectedInversions: ChordInversion[];
  onInversionsChange: (inversions: ChordInversion[]) => void;
  enabledDegrees: string[];
  onDegreesChange: (degrees: string[]) => void;
  onCloseSettings: () => void;
}

export default function PracticeMode({
  showSettings,
  selectedKey,
  onKeyChange,
  selectedInversions,
  onInversionsChange,
  enabledDegrees,
  onDegreesChange,
  onCloseSettings
}: PracticeModeProps) {
  const [dronePlaying, setDronePlaying] = useState(false);
  const [correctDegree, setCorrectDegree] = useState('');
  const [message, setMessage] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [currentChords, setCurrentChords] = useState<Record<string, string[]>>({});
  const [currentInversion, setCurrentInversion] = useState<ChordInversion>('root');
  const [currentDroneKey, setCurrentDroneKey] = useState('C'); // Track current drone key
  const droneSynthRef = useRef<Tone.Synth | null>(null);

  const chordSynth = useRef(new Tone.PolySynth(Tone.Synth, {
    envelope: {
      attack: 0.01,  // Very quick attack, no fade-in
      decay: 0.2,
      sustain: 0.8,
      release: 0.5   // Keep smooth fade-out
    },
    volume: -8  // Balanced with drone
  }).toDestination()).current;

  // Cleanup drone when component unmounts
  useEffect(() => {
    return () => {
      if (droneSynthRef.current) {
        droneSynthRef.current.triggerRelease();
        droneSynthRef.current = null;
        setDronePlaying(false);
      }
    };
  }, []);

  // Restart drone when key changes (if drone is currently playing)
  useEffect(() => {
    if (dronePlaying) {
      // Stop current drone
      if (droneSynthRef.current) {
        droneSynthRef.current.triggerRelease();
        droneSynthRef.current = null;
      }
      
      // Start new drone with new key
      const restartDrone = async () => {
        await Tone.start();
        const droneKey = selectedKey === 'Random' ? resolveActualKey(selectedKey) : selectedKey;
        setCurrentDroneKey(droneKey);
        
        const droneSynth = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { 
            sustain: 1, 
            attack: 0.5,
            release: 0.5
          },
          volume: -5,
        }).toDestination();

        droneSynthRef.current = droneSynth;
        const droneNote = getDroneNote(droneKey);
        droneSynth.triggerAttack(droneNote);
      };
      
      restartDrone();
    }
  }, [selectedKey]);

  // Update current chords when key changes (if in the middle of a practice round)
  useEffect(() => {
    if (correctDegree && Object.keys(currentChords).length > 0) {
      // We're in the middle of a practice round, need to update chords to new key
      const chordKey = dronePlaying ? currentDroneKey : (selectedKey === 'Random' ? resolveActualKey(selectedKey) : selectedKey);
      const { chords, currentInversion: roundInversion } = getPracticeScaleDegrees(
        chordKey,
        selectedInversions,
        enabledDegrees
      );
      setCurrentChords(chords);
      setCurrentInversion(roundInversion);
    }
  }, [selectedKey, currentDroneKey]);

  const toggleDrone = async () => {
    await Tone.start();

    if (!dronePlaying) {
      const droneSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { 
          sustain: 1, 
          attack: 0.5,   // Longer fade-in for smoother start
          release: 0.5   // Longer fade-out for smoother stop
        },
        volume: -5, // More prominent drone (was -10)
      }).toDestination();

      droneSynthRef.current = droneSynth;
      // Generate new random key each time drone starts (if Random is selected)
      const droneKey = selectedKey === 'Random' ? resolveActualKey(selectedKey) : selectedKey;
      setCurrentDroneKey(droneKey);
      const droneNote = getDroneNote(droneKey);
      droneSynth.triggerAttack(droneNote);
      setDronePlaying(true);
    } else {
      droneSynthRef.current?.triggerRelease();
      setDronePlaying(false);
    }
  };

  const playChord = async () => {
    await Tone.start();
    
    // Stop any currently playing notes to prevent overlap
    chordSynth.releaseAll();
    
    // Use current drone key if drone is playing, otherwise resolve new key
    const resolvedKey = dronePlaying ? currentDroneKey : (selectedKey === 'Random' ? resolveActualKey(selectedKey) : selectedKey);
    
    // Generate new chord set with consistent inversion for this round
    const { chords, currentInversion: roundInversion } = getPracticeScaleDegrees(
      resolvedKey, 
      selectedInversions, 
      enabledDegrees
    );
    
    // Store the chords and inversion for this round
    setCurrentChords(chords);
    setCurrentInversion(roundInversion);
    
    // Pick a random chord from available degrees
    const availableDegrees = Object.keys(chords);
    const random = availableDegrees[Math.floor(Math.random() * availableDegrees.length)];
    const chord = chords[random];
    
    if (chord) {
      // Add fade effects and balance with drone
      chordSynth.triggerAttackRelease(chord, '2n', undefined, 0.7);
      setCorrectDegree(random);
      setMessage('');
      setHasGuessed(false); // Reset guess state for new chord
    }
  };

  const repeatChord = async () => {
    if (correctDegree && currentChords[correctDegree]) {
      await Tone.start();
      
      // Stop any currently playing notes to prevent overlap
      chordSynth.releaseAll();
      
      // Use the stored chord from current round
      const chord = currentChords[correctDegree];
      
      // Add fade effects and balance with drone
      chordSynth.triggerAttackRelease(chord, '2n', undefined, 0.7);
    }
  };

  const handleGuess = async (guess: string) => {
    // Stop any currently playing notes to prevent overlap
    chordSynth.releaseAll();
    
    // Play the chord corresponding to the user's choice
    await Tone.start();
    
    // Use the stored chord from current round (same inversion as target)
    const chord = currentChords[guess];
    
    if (chord) {
      // Add fade effects and balance with drone
      chordSynth.triggerAttackRelease(chord, '2n', undefined, 0.7);
    }

    // Only update feedback if this is the first guess for this chord
    if (!hasGuessed && correctDegree) {
      setHasGuessed(true);
      if (guess === correctDegree) {
        setMessage('✅ Correct!');
      } else {
        setMessage(`❌ Nope, it was ${correctDegree}`);
      }
    }
  };

  return (
    <div className="p-4">
      <h2>🎵 Chord Sense – Ear Trainer</h2>
      <button onClick={toggleDrone}>
        {dronePlaying ? 'Stop Drone' : 'Play Drone'}
      </button>
      <button onClick={playChord} style={{ marginLeft: '1rem' }}>
        Next Chord
      </button>

      <div className="mt-4">
        {enabledDegrees.map((deg) => (
          <button key={deg} onClick={() => handleGuess(deg)} style={{ margin: '4px' }}>
            {deg}
          </button>
        ))}
      </div>
      
      {/* Reserve space for inversion display - shows after user answers if multiple inversions selected */}
      <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#666', textAlign: 'center', minHeight: '1.2rem' }}>
        {correctDegree && selectedInversions.length > 1 && hasGuessed && (
          <>Current inversion: <strong>{CHORD_INVERSIONS[currentInversion]}</strong></>
        )}
      </div>
      
      {/* Reserve space for feedback message */}
      <div style={{ marginTop: '1rem', minHeight: '1.5rem' }}>{message}</div>
      
      {correctDegree && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={repeatChord}>
            Repeat Chord
          </button>
        </div>
      )}
      
      {showSettings && (
        <Settings
          mode="practice"
          selectedKey={selectedKey}
          onKeyChange={onKeyChange}
          selectedInversions={selectedInversions}
          onInversionsChange={onInversionsChange}
          enabledDegrees={enabledDegrees}
          onDegreesChange={onDegreesChange}
          onClose={onCloseSettings}
        />
      )}
    </div>
  );
}
