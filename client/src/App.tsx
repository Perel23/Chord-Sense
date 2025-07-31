import { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import ExploreMode from './components/ExploreMode';
import PracticeMode from './components/PracticeMode';
import Onboarding from './components/Onboarding';
import { ALL_DEGREE_NAMES } from './constants/chords';
import type { ChordInversion } from './constants/chords';
import './styles/globals.css';
import './styles/components.css';

function App() {
  const [mode, setMode] = useState<'menu' | 'practice' | 'explore'>('menu');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('chord-sense-onboarding-completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Smart beginner defaults - start with I, IV, V chords only
  const beginnerDegrees = ['I', 'IV', 'V'];
  
  // Practice Mode Settings
  const [practiceShowSettings, setPracticeShowSettings] = useState(false);
  const [practiceSelectedKey, setPracticeSelectedKey] = useState('C');
  const [practiceSelectedInversions, setPracticeSelectedInversions] = useState<ChordInversion[]>(['root']);
  const [practiceEnabledDegrees, setPracticeEnabledDegrees] = useState(beginnerDegrees);
  
  // Explore Mode Settings
  const [exploreShowSettings, setExploreShowSettings] = useState(false);
  const [exploreSelectedKey, setExploreSelectedKey] = useState('C');
  const [exploreSelectedInversions, setExploreSelectedInversions] = useState<ChordInversion[]>(['root']);
  const [exploreEnabledDegrees, setExploreEnabledDegrees] = useState(beginnerDegrees);

  const handleOnboardingComplete = () => {
    localStorage.setItem('chord-sense-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('chord-sense-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const showTutorial = () => {
    setShowOnboarding(true);
  };

  return (
    <div className="app-container">
      <div className="app-background"></div>
      
      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      
      {mode === 'menu' && <MainMenu onSelectMode={setMode} onShowTutorial={showTutorial} />}
      
      {mode === 'practice' && (
        <PracticeMode
          showSettings={practiceShowSettings}
          selectedKey={practiceSelectedKey}
          onKeyChange={setPracticeSelectedKey}
          selectedInversions={practiceSelectedInversions}
          onInversionsChange={setPracticeSelectedInversions}
          enabledDegrees={practiceEnabledDegrees}
          onDegreesChange={setPracticeEnabledDegrees}
          onCloseSettings={() => setPracticeShowSettings(false)}
        />
      )}
      
      {mode === 'explore' && (
        <ExploreMode
          showSettings={exploreShowSettings}
          selectedKey={exploreSelectedKey}
          onKeyChange={setExploreSelectedKey}
          selectedInversions={exploreSelectedInversions}
          onInversionsChange={setExploreSelectedInversions}
          enabledDegrees={exploreEnabledDegrees}
          onDegreesChange={setExploreEnabledDegrees}
          onCloseSettings={() => setExploreShowSettings(false)}
        />
      )}
      
      {mode !== 'menu' && (
        <div className="nav-controls">
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (mode === 'practice') setPracticeShowSettings(true);
              if (mode === 'explore') setExploreShowSettings(true);
            }}
          >
            ⚙️ SETTINGS
          </button>
          <button 
            className="btn"
            onClick={() => setMode('menu')}
          >
            ⬅️ BACK TO MENU
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
