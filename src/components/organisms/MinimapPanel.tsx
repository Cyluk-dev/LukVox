import React from 'react';
import GridSettings from '../molecules/GridSettings';

interface MinimapPanelProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  baseGridSize: number;
  setBaseGridSize: (size: number) => void;
  onClose: () => void;
}

const MinimapPanel: React.FC<MinimapPanelProps> = ({ 
  scale, 
  setScale, 
  baseGridSize, 
  setBaseGridSize, 
  onClose 
}) => {
  return (
    <div className="minimap-panel">
      <div className="minimap-header">
        <button className="minimap-btn" onClick={() => setScale(s => s * 0.9)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
        </button>
        <span className="minimap-zoom">{(scale * 100).toFixed(0)}%</span>
        <button className="minimap-btn" onClick={() => setScale(s => s * 1.1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button className="minimap-btn toggle" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      <div className="minimap-view">
        <div className="minimap-content">
          <div className="minimap-shape shape-1"></div>
          <div className="minimap-shape shape-2"></div>
        </div>
      </div>
      <GridSettings 
        baseGridSize={baseGridSize}
        setBaseGridSize={setBaseGridSize}
      />
    </div>
  );
};

export default MinimapPanel;
