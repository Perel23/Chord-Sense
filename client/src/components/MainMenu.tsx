type Props = {
  onSelectMode: (mode: 'practice' | 'explore') => void;
};

export default function MainMenu({ onSelectMode }: Props) {
  return (
    <div className="p-4">
      <h1>🎧 Welcome to Chord Sense</h1>
      <p>Select a mode to begin:</p>
      <button onClick={() => onSelectMode('practice')} style={{ margin: '1rem' }}>
        🎯 Practice Mode
      </button>
      <button onClick={() => onSelectMode('explore')} style={{ margin: '1rem' }}>
        🔍 Explore Mode
      </button>
    </div>
  );
}
