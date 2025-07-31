import * as Tone from 'tone';
import { useRef, useState, useEffect } from 'react';
import { getRandomInversionChord, getRootNote, resolveActualKey } from '../constants/chords';
import type { ChordInversion } from '../constants/chords';
import Settings from './Settings';

interface ExploreModeProps {
  showSettings: boolean;
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
  selectedKey,
  onKeyChange,
  selectedInversions,
  onInversionsChange,
  enabledDegrees,
  onDegreesChange,
  onCloseSettings
}: ExploreModeProps) {
  const [dronePlaying, setDronePlaying] = useState(false);
  const [currentResolvedKey, setCurrentResolvedKey] = useState('C'); // Track resolved key for current session
  const [currentDroneKey, setCurrentDroneKey] = useState('C'); // Track current drone key
  const droneSynth = useRef<Tone.Synth | null>(null);

  // Resolve key when selectedKey changes (handles Random) and restart drone if playing
  useEffect(() => {
    const resolvedKey = resolveActualKey(selectedKey);
    setCurrentResolvedKey(resolvedKey);
    
    // If drone is playing, restart it with new key
    if (dronePlaying) {
      // Stop current drone
      if (droneSynth.current) {
        droneSynth.current.triggerRelease();
        droneSynth.current = null;
      }
      
      // Start new drone with new key
      const restartDrone = async () => {
        await Tone.start();
        const droneKey = selectedKey === 'Random' ? resolveActualKey(selectedKey) : selectedKey;
        setCurrentDroneKey(droneKey);
        
        const synth = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.5,
            decay: 0.1,
            sustain: 1,
            release: 0.5
          },
          volume: -5
        }).toDestination();
        
        synth.triggerAttack(getRootNote(droneKey));
        droneSynth.current = synth;
      };
      
      restartDrone();
    }
  }, [selectedKey, dronePlaying]);
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
    // Generate new random key each time drone starts (if Random is selected)
    const droneKey = selectedKey === 'Random' ? resolveActualKey(selectedKey) : selectedKey;
    setCurrentDroneKey(droneKey);
    synth.triggerAttack(getRootNote(droneKey)); // start drone
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
    // Use current drone key if drone is playing, otherwise use session resolved key
    const chordKey = dronePlaying ? currentDroneKey : currentResolvedKey;
    const chord = getRandomInversionChord(degree, chordKey, selectedInversions);
    
    if (chord) {
      // Add fade-in and fade-out for more pleasant sound
      chordSynth.triggerAttackRelease(chord, '2n', undefined, 0.7); // Slightly quieter to balance with drone
    }
  };

  return (
    <div className="mode-container">
      <div className="mode-header">
        <div className="mode-title">
          <span className="mode-icon">🔍</span>
          <h2 className="text-gradient">Explore Mode</h2>
        </div>
        <p className="text-muted">Freely explore chord progressions and scales</p>
      </div>

      <div className="control-panel">
        <div className="drone-controls">
          <button 
            className={`btn btn-circle drone-button ${dronePlaying ? 'active' : ''}`}
            onClick={toggleDrone}
          >
            {dronePlaying ? '⏸️' : '🎵'}
          </button>
          <span className="text-secondary">
            {dronePlaying ? 'Root Note Playing' : 'Start Root Note'}
          </span>
        </div>
      </div>

      <div className="chord-grid">
        {enabledDegrees.map((deg) => (
          <button 
            key={deg} 
            className="btn chord-button"
            onClick={() => playChord(deg)}
          >
            {deg}
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
