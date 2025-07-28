import { SCALES, CHORD_INVERSIONS, ALL_DEGREE_NAMES } from '../constants/chords';
import type { ChordInversion } from '../constants/chords';

interface SettingsProps {
  mode: 'practice' | 'explore';
  selectedKey: string;
  onKeyChange: (key: string) => void;
  selectedInversions: ChordInversion[];
  onInversionsChange: (inversions: ChordInversion[]) => void;
  enabledDegrees: string[];
  onDegreesChange: (degrees: string[]) => void;
  onClose: () => void;
}

export default function Settings({
  mode,
  selectedKey,
  onKeyChange,
  selectedInversions,
  onInversionsChange,
  enabledDegrees,
  onDegreesChange,
  onClose
}: SettingsProps) {
  const handleInversionToggle = (inversion: ChordInversion) => {
    const newInversions = selectedInversions.includes(inversion)
      ? selectedInversions.filter(inv => inv !== inversion)
      : [...selectedInversions, inversion];
    
    // Ensure at least one inversion is selected
    if (newInversions.length > 0) {
      onInversionsChange(newInversions);
    }
  };

  const handleDegreeToggle = (degree: string) => {
    const newDegrees = enabledDegrees.includes(degree)
      ? enabledDegrees.filter(deg => deg !== degree)
      : [...enabledDegrees, degree];
    
    // Ensure at least one degree is selected
    if (newDegrees.length > 0) {
      onDegreesChange(newDegrees);
    }
  };

  const selectAllDegrees = () => {
    onDegreesChange([...ALL_DEGREE_NAMES]);
  };

  const selectCommonProgression = () => {
    onDegreesChange(['I', 'IV', 'V']);
  };

  return (
    <div className="settings-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="settings-modal" style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3>⚙️ {mode === 'practice' ? 'Practice' : 'Explore'} Mode Settings</h3>
        
        {/* Scale/Key Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Choose scale:
          </label>
          <select 
            value={selectedKey} 
            onChange={(e) => onKeyChange(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem', width: '100%' }}
          >
            {SCALES.map(scale => (
              <option key={scale.key} value={scale.key}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chord Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Select chords to practice:
          </label>
          <div style={{ marginBottom: '0.5rem' }}>
            <button onClick={selectAllDegrees} style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>
              Select All
            </button>
            <button onClick={selectCommonProgression} style={{ fontSize: '0.8rem' }}>
              I-IV-V Only
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {ALL_DEGREE_NAMES.map(degree => (
              <label key={degree} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enabledDegrees.includes(degree)}
                  onChange={() => handleDegreeToggle(degree)}
                  style={{ marginRight: '0.5rem' }}
                />
                {degree}
              </label>
            ))}
          </div>
        </div>

        {/* Chord Inversions */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Chord inversions:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(CHORD_INVERSIONS).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedInversions.includes(key as ChordInversion)}
                  onChange={() => handleInversionToggle(key as ChordInversion)}
                  style={{ marginRight: '0.5rem' }}
                />
                {label}
              </label>
            ))}
          </div>
          
          {/* Informational message for multiple inversions */}
          {selectedInversions.length >= 2 && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: mode === 'explore' ? '#e7f3ff' : '#f0f8e7',
              border: `1px solid ${mode === 'explore' ? '#b3d9ff' : '#c3e6c3'}`,
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: mode === 'explore' ? '#0066cc' : '#2d5f2d'
            }}>
              <strong>ℹ️ {mode === 'practice' ? 'Practice' : 'Explore'} Mode:</strong>{' '}
              {mode === 'explore' 
                ? 'When multiple inversions are selected, a random inversion will be chosen each time you play a chord.'
                : 'When multiple inversions are selected, one inversion will be chosen for each round. All chords in that round (target and your guesses) will use the same inversion for fair comparison.'
              }
            </div>
          )}
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '0.75rem 2rem', 
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
