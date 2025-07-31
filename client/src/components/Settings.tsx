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
    <div className="settings-panel">
      <div className="settings-content">
        <div className="settings-header">
          <h2 className="text-gradient">Settings</h2>
          <button 
            className="btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="settings-section">
          <h3>🎼 Scale Selection</h3>
          <div className="form-group">
            <label className="form-label">
              Choose scale:
              <span className="form-help" title="The scale determines which chords you'll practice. Start with C Major (no sharps or flats) for the easiest experience.">ℹ️</span>
            </label>
            <select 
              className="form-select"
              value={selectedKey} 
              onChange={(e) => onKeyChange(e.target.value)}
            >
              {SCALES.map(scale => (
                <option key={scale.key} value={scale.key}>
                  {scale.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        
        <div className="settings-section">
          <h3>🎵 Chord Selection</h3>
          <div className="form-group">
            <label className="form-label">
              Select chords to practice:
              <span className="form-help" title="Roman numerals (I, ii, iii, etc.) are the standard way musicians identify chords. Start with I, IV, V - the most common chords in music!">ℹ️</span>
            </label>
            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button 
                className="btn"
                onClick={selectAllDegrees}
              >
                Select All
              </button>
              <button 
                className="btn"
                onClick={selectCommonProgression}
              >
                I-IV-V Only
              </button>
            </div>
            <div className="checkbox-group">
              {ALL_DEGREE_NAMES.map(degree => (
                <label key={degree} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={enabledDegrees.includes(degree)}
                    onChange={() => handleDegreeToggle(degree)}
                  />
                  <span>{degree}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        
        <div className="settings-section">
          <h3>🔄 Chord Variations</h3>
          <div className="form-group">
            <label className="form-label">
              Chord inversions:
              <span className="form-help" title="Inversions change which note is played lowest in the chord. Start with 'Root Position' only for the simplest experience.">ℹ️</span>
            </label>
            <div className="checkbox-group">
              {Object.entries(CHORD_INVERSIONS).map(([key, label]) => (
                <label key={key} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedInversions.includes(key as ChordInversion)}
                    onChange={() => handleInversionToggle(key as ChordInversion)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            
            {/* Informational message for multiple inversions */}
            {selectedInversions.length >= 2 && (
              <div className="settings-info-panel">
                <strong>ℹ️ {mode === 'practice' ? 'Practice' : 'Explore'} Mode:</strong>{' '}
                {mode === 'explore' 
                  ? 'When multiple inversions are selected, a random inversion will be chosen each time you play a chord.'
                  : 'When multiple inversions are selected, one inversion will be chosen for each round. All chords in that round (target and your guesses) will use the same inversion for fair comparison.'
                }
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
          <button 
            className="btn btn-primary btn-large"
            onClick={onClose}
          >
            ✓ Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
