import React from 'react';
import ColorDot from '../atoms/ColorDot';
import Slider from '../atoms/Slider';
import Button from '../atoms/Button';

interface StylePanelProps {
  color: string;
  onColorChange: (color: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

const colors = [
  '#1e1e1e', '#94a3b8', '#e879f9', '#a855f7',
  '#3b82f6', '#60a5fa', '#f59e0b', '#f97316',
  '#10b981', '#4ade80', '#f87171', '#ef4444'
];

const StylePanel: React.FC<StylePanelProps> = ({
  color,
  onColorChange,
  opacity,
  onOpacityChange,
}) => {
  return (
    <div 
      className="style-panel"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="color-grid">
        {colors.map(c => (
          <ColorDot
            key={c}
            color={c}
            active={color === c}
            onClick={onColorChange}
          />
        ))}
      </div>

      <Slider
        value={opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={onOpacityChange}
        className="opacity-slider-wrapper"
      />
    </div>
  );
};

export default StylePanel;
