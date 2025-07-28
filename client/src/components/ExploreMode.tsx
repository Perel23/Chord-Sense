import * as Tone from 'tone';
import { useRef, useState, useEffect } from 'react';
import { getRandomInversionChord, ALL_DEGREE_NAMES } from '../constants/chords';
import type { ChordInversion } from '../constants/chords';
import Settings from './Settings';

interface ExploreModeProps {
  showSettings: boolean;
  onShowSettings: () => void;
  selectedKey: string;
  onKeyChange: (key: string) => void;
  selectedInversions: ChordInversion[];
  onInversionsChange: (inversions: ChordInversion[]) => void;
  enabledDegrees: string[];
  onDegreesChange: (degrees: string[]) => void;
  onCloseSettings: () => void;
}

export default function ExploreMode({
  showSettings,
  onShowSettings,
  selectedKey,
  onKeyChange,
  selectedInversions,
  onInversionsChange,
  enabledDegrees,
  onDegreesChange,
  onCloseSettings
}: ExploreModeProps) {
  const [dronePlaying, setDronePlaying] = useState(false);
  const droneSynth = useRef<Tone.Synth | null>(null);
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
      if (droneSynth.current) {
        droneSynth.current.triggerRelease();
        droneSynth.current = null;
        setDronePlaying(false);
      }
    };
  }, []);

  const startDrone = async () => {
    await Tone.start();
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.5,  // Longer fade-in for smoother start
        decay: 0.1,
        sustain: 1,   // sustain fully
        release: 0.5  // Longer fade-out for smoother stop
      },
      volume: -5  // More prominent drone (was -10)
    }).toDestination();
    synth.triggerAttack('C2'); // start drone
    droneSynth.current = synth;
    setDronePlaying(true);
  };

  const stopDrone = () => {
    droneSynth.current?.triggerRelease();
    droneSynth.current = null;
    setDronePlaying(false);
  };

  const toggleDrone = () => {
    dronePlaying ? stopDrone() : startDrone();
  };

  const playChord = async (degree: string) => {
    await Tone.start();
    
    // Stop any currently playing notes to prevent overlap
    chordSynth.releaseAll();
    
    // Get a chord with random inversion each time (for variety in Explore mode)
    const chord = getRandomInversionChord(degree, selectedKey, selectedInversions);
    
    if (chord) {
      // Add fade-in and fade-out for more pleasant sound
      chordSynth.triggerAttackRelease(chord, '2n', undefined, 0.7); // Slightly quieter to balance with drone
    }
  };

  return (
    <div className="p-4">
      <h2>🔍 Explore Mode</h2>
      <button onClick={toggleDrone}>
        {dronePlaying ? 'Stop Drone' : 'Start Drone'}
      </button>

      <div className="mt-4">
        {enabledDegrees.map((deg) => (
          <button key={deg} onClick={() => playChord(deg)} style={{ margin: '4px' }}>
            Play {deg}
          </button>
        ))}
      </div>
      
      {showSettings && (
        <Settings
          mode="explore"
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
