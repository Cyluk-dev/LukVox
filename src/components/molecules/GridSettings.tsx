import React from 'react';
import Slider from '../atoms/Slider';

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
      <Slider
        label="Cuadrícula"
        min={5}
        max={100}
        value={baseGridSize}
        onChange={setBaseGridSize}
        showValue
      />
    </div>
  );
};

export default GridSettings;
