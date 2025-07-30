import { useState } from 'react';
import MainMenu from './components/MainMenu';
import ExploreMode from './components/ExploreMode';
import PracticeMode from './components/PracticeMode';
import { ALL_DEGREE_NAMES } from './constants/chords';
import type { ChordInversion } from './constants/chords';

function App() {
  const [mode, setMode] = useState<'menu' | 'practice' | 'explore'>('menu');
  
  // Practice Mode Settings
  const [practiceShowSettings, setPracticeShowSettings] = useState(false);
  const [practiceSelectedKey, setPracticeSelectedKey] = useState('C');
  const [practiceSelectedInversions, setPracticeSelectedInversions] = useState<ChordInversion[]>(['root']);
  const [practiceEnabledDegrees, setPracticeEnabledDegrees] = useState(ALL_DEGREE_NAMES);
  
  // Explore Mode Settings
  const [exploreShowSettings, setExploreShowSettings] = useState(false);
  const [exploreSelectedKey, setExploreSelectedKey] = useState('C');
  const [exploreSelectedInversions, setExploreSelectedInversions] = useState<ChordInversion[]>(['root']);
  const [exploreEnabledDegrees, setExploreEnabledDegrees] = useState(ALL_DEGREE_NAMES);

  return (
    <div style={{ padding: '2rem' }}>
      {mode === 'menu' && <MainMenu onSelectMode={setMode} />}
      
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
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => {
              if (mode === 'practice') setPracticeShowSettings(true);
              if (mode === 'explore') setExploreShowSettings(true);
            }}
            style={{ marginRight: '1rem' }}
          >
            ⚙️ Settings
          </button>
          <button onClick={() => setMode('menu')}>
            ⬅️ Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
