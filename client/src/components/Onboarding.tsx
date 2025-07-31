import { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { getRootNote, getRandomInversionChord } from '../constants/chords';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rootNotePlaying, setRootNotePlaying] = useState(false);
  const [unlockedChords, setUnlockedChords] = useState<string[]>(['I']); // Start with I unlocked
  const [playingChord, setPlayingChord] = useState<string | null>(null);
  
  const rootSynthRef = useRef<Tone.Synth | null>(null);
  const chordSynthRef = useRef<Tone.PolySynth | null>(null);

  // Cleanup audio when component unmounts or tutorial ends
  useEffect(() => {
    return () => {
      rootSynthRef.current?.triggerRelease();
      chordSynthRef.current?.releaseAll();
    };
  }, []);

  // Stop audio when tutorial completes or is skipped
  const stopAllAudio = () => {
    rootSynthRef.current?.triggerRelease();
    chordSynthRef.current?.releaseAll();
    setRootNotePlaying(false);
    setPlayingChord(null);
  };

  const playRootNote = async () => {
    await Tone.start();
    
    if (rootNotePlaying) {
      rootSynthRef.current?.triggerRelease();
      setRootNotePlaying(false);
      return;
    }

    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1 },
      volume: -5
    }).toDestination();

    rootSynthRef.current = synth;
    const rootNote = getRootNote('C');
    synth.triggerAttack(rootNote);
    setRootNotePlaying(true);
  };

  const playChord = async (degree: string) => {
    if (playingChord === degree) {
      chordSynthRef.current?.releaseAll();
      setPlayingChord(null);
      return;
    }

    await Tone.start();
    
    // Stop any currently playing chord
    chordSynthRef.current?.releaseAll();
    
    // Start root note in background if not already playing
    if (!rootNotePlaying) {
      const rootSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1 },
        volume: -8 // Quieter background
      }).toDestination();

      rootSynthRef.current = rootSynth;
      const rootNote = getRootNote('C');
      rootSynth.triggerAttack(rootNote);
      setRootNotePlaying(true);
    }
    
    const polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 1 },
      volume: -5 // Louder than root note
    }).toDestination();

    chordSynthRef.current = polySynth;
    
    // Get chord notes for the degree in C major
    const chordNotes = getRandomInversionChord(degree, 'C', ['root']);
    console.log('Playing chord:', degree, 'Notes:', chordNotes); // Debug log
    
    if (chordNotes && chordNotes.length > 0) {
      polySynth.triggerAttack(chordNotes);
      setPlayingChord(degree);
      
      // Unlock next chord if this is the first time playing
      if (!unlockedChords.includes(degree)) {
        const newUnlocked = [...unlockedChords, degree];
        setUnlockedChords(newUnlocked);
      }
      
      // Auto-unlock next chord in sequence
      if (degree === 'I' && !unlockedChords.includes('IV')) {
        setTimeout(() => setUnlockedChords(prev => [...prev, 'IV']), 1000);
      } else if (degree === 'IV' && !unlockedChords.includes('V')) {
        setTimeout(() => setUnlockedChords(prev => [...prev, 'V']), 1000);
      }
      
      // Auto-release after 2 seconds for snappier feel
      setTimeout(() => {
        polySynth.releaseAll();
        setPlayingChord(null);
      }, 2000);
    } else {
      console.error('Failed to get chord notes for degree:', degree);
    }
  };

  const steps = [
    {
      title: "Welcome to Chord Sense! 🎵",
      content: (
        <div className="onboarding-content">
          <p>Learn to recognize chords by ear — the foundation of musical understanding.</p>
          <p>No prior music experience needed. We'll guide you through everything step by step.</p>
          <div className="onboarding-highlight">
            <strong>🎯 Your Goal:</strong> Train your ear to identify different chord sounds
          </div>
        </div>
      )
    },
    {
      title: "The Root Note 🎵",
      content: (
        <div className="onboarding-content">
          <p>You'll hear a steady background note called the <strong>root note</strong>.</p>
          <p>This note is your musical "home base" — it helps your ear stay oriented and understand how each chord relates to the key.</p>
          
          <div className="interactive-demo">
            <div className="demo-section">
              <p><strong>Try it now:</strong> Click to hear the root note</p>
              <button 
                className={`btn btn-circle drone-button ${rootNotePlaying ? 'active' : ''}`}
                onClick={playRootNote}
              >
                {rootNotePlaying ? '⏸️' : '🎵'}
              </button>
              <span className="demo-label">
                {rootNotePlaying ? 'Root Note Playing' : 'Play Root Note'}
              </span>
            </div>
          </div>
          
          <div className="onboarding-highlight">
            <strong>💡 Tip:</strong> The root note provides harmonic context, making it easier to distinguish between different chords.
          </div>
        </div>
      )
    },
    {
      title: "Understanding Chord Numbers 🎹",
      content: (
        <div className="onboarding-content">
          <p>Musicians use Roman numerals (I, ii, iii, IV, V, vi, vii°) to identify chords in any key.</p>
          <p>We'll start with the three most important chords. <strong>Click each one to hear how it sounds:</strong></p>
          
          <div className="chord-intro-grid">
            <div className="chord-intro-item">
              <button 
                className={`chord-button-demo ${playingChord === 'I' ? 'playing' : ''}`}
                onClick={() => playChord('I')}
              >
                I
              </button>
              <span><strong>I</strong> - Home Base</span>
              <small>The most stable, "at rest" feeling</small>
            </div>
            <div className="chord-intro-item">
              <button 
                className={`chord-button-demo ${playingChord === 'IV' ? 'playing' : ''} ${!unlockedChords.includes('IV') ? 'locked' : ''}`}
                onClick={() => playChord('IV')}
                disabled={!unlockedChords.includes('IV')}
              >
                IV
              </button>
              <span><strong>IV</strong> - Uplifting</span>
              <small>Bright and hopeful, wants to move</small>
            </div>
            <div className="chord-intro-item">
              <button 
                className={`chord-button-demo ${playingChord === 'V' ? 'playing' : ''} ${!unlockedChords.includes('V') ? 'locked' : ''}`}
                onClick={() => playChord('V')}
                disabled={!unlockedChords.includes('V')}
              >
                V
              </button>
              <span><strong>V</strong> - Tension</span>
              <small>Creates tension, wants to return to I</small>
            </div>
          </div>
          
          <p className="onboarding-note">
            {unlockedChords.length === 1 && unlockedChords.includes('I') && "👆 Start with the I chord to unlock the others!"}
            {unlockedChords.includes('I') && unlockedChords.includes('IV') && !unlockedChords.includes('V') && "Great! Now try the V chord to complete the sequence."}
            {unlockedChords.includes('V') && "Perfect! You've experienced the three fundamental chords that form the backbone of countless songs!"}
          </p>
        </div>
      )
    },
    {
      title: "Ready to Practice? 🤘",
      content: (
        <div className="onboarding-content">
          <p>You're all set! Here's how to practice:</p>
          
          <div className="practice-flow">
            <div className="flow-step">
              <span className="flow-icon">▶️</span>
              <strong>Play the root note</strong>
              <small>Get oriented with your musical home base</small>
            </div>
            <div className="flow-step">
              <span className="flow-icon">🎧</span>
              <strong>Listen to the chord</strong>
              <small>Focus on how it feels relative to the root</small>
            </div>
            <div className="flow-step">
              <span className="flow-icon">🎯</span>
              <strong>Choose the chord degree</strong>
              <small>Click the Roman numeral you think matches</small>
            </div>
            <div className="flow-step">
              <span className="flow-icon">✅</span>
              <strong>Get feedback and improve</strong>
              <small>Learn from each attempt and build your ear</small>
            </div>
          </div>
          
          <p>Remember: Every musician started here. Take your time and trust the process!</p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopAllAudio(); // Stop audio when completing tutorial
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    stopAllAudio(); // Stop audio when skipping tutorial
    onSkip();
  };

  // Stop audio when reaching final step
  useEffect(() => {
    if (currentStep === steps.length - 1) {
      stopAllAudio();
    }
  }, [currentStep]);

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h2>{steps[currentStep].title}</h2>
          <button className="onboarding-skip" onClick={handleSkip}>
            Skip Tutorial
          </button>
        </div>

        <div className="onboarding-body">
          {steps[currentStep].content}
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="onboarding-controls">
            {currentStep > 0 && (
              <button className="btn" onClick={prevStep}>
                ← Previous
              </button>
            )}
            <button className="btn btn-primary" onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Start Learning!" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
