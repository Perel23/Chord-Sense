type Props = {
  onSelectMode: (mode: 'practice' | 'explore') => void;
  onShowTutorial: () => void;
};

export default function MainMenu({ onSelectMode, onShowTutorial }: Props) {
  return (
    <div className="main-menu">
      <div className="mode-header">
        <h1 className="app-title geometric-title">CHORD SENSE</h1>
        <p className="app-subtitle">MASTER YOUR MUSICAL EAR WITH INTERACTIVE CHORD TRAINING</p>
      </div>
      
      <div className="menu-buttons">
        <button 
          className="menu-button"
          onClick={() => onSelectMode('practice')}
        >
          <span className="mode-icon">🎯</span>
          PRACTICE MODE
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Structured learning with feedback
          </div>
        </button>
        
        <button 
          className="menu-button"
          onClick={() => onSelectMode('explore')}
        >
          <span className="mode-icon">🔍</span>
          EXPLORE MODE
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Free play and experimentation
          </div>
        </button>

        <button 
          className="menu-button tutorial-button"
          onClick={onShowTutorial}
        >
          <span className="mode-icon">📚</span>
          SHOW TUTORIAL
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Learn the basics step by step
          </div>
        </button>
      </div>
    </div>
  );
}
