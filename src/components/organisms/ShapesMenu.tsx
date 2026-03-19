import React from 'react';
import type { Tool } from '../../types';

interface ShapesMenuProps {
  enabledShapes: ('rectangle' | 'circle' | 'triangle')[];
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const ShapesMenu: React.FC<ShapesMenuProps> = ({ enabledShapes, activeTool, setActiveTool }) => {
  if (enabledShapes.length === 0) return null;

  return (
    <div className="shapes-menu">
      <div className={`shapes-grid ${enabledShapes.length === 1 ? 'single-item' : ''}`}>
        {enabledShapes.includes('rectangle') && (
          <button 
            className={`shape-btn ${activeTool === 'rectangle' ? 'active' : ''}`}
            title="Rectángulo"
            onClick={() => setActiveTool('rectangle')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </button>
        )}
        {enabledShapes.includes('circle') && (
          <button 
            className={`shape-btn ${activeTool === 'circle' ? 'active' : ''}`}
            title="Círculo"
            onClick={() => setActiveTool('circle')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </button>
        )}
        {enabledShapes.includes('triangle') && (
          <button 
            className={`shape-btn ${activeTool === 'triangle' ? 'active' : ''}`}
            title="Triángulo"
            onClick={() => setActiveTool('triangle')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 21H22L12 3Z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShapesMenu;
