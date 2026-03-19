import React, { useState } from 'react';

interface GridSettingsProps {
  baseGridSize: number;
  setBaseGridSize: (size: number) => void;
}

const GridSettings: React.FC<GridSettingsProps> = ({ 
  baseGridSize, 
  setBaseGridSize
}) => {
  return (
    <div className="grid-settings">
      <div className="settings-group">
        <div className="grid-settings-label">Cuadrícula</div>
        <input 
          type="range" 
          min="5" 
          max="100" 
          value={baseGridSize} 
          onChange={(e) => setBaseGridSize(Number(e.target.value))}
          className="grid-size-slider"
        />
        <div className="grid-settings-value">{baseGridSize}px</div>
      </div>
    </div>
  );
};

export default GridSettings;
