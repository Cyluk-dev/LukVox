import React from 'react';

interface StylePanelProps {
  color: string;
  onColorChange: (color: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  fontSize: 'S' | 'M' | 'L' | 'XL';
  onFontSizeChange: (size: 'S' | 'M' | 'L' | 'XL') => void;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  onTextAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
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
  fontSize,
  onFontSizeChange,
  textAlign,
  onTextAlignChange
}) => {
  return (
    <div className="style-panel">
      <div className="color-grid">
        {colors.map(c => (
          <button
            key={c}
            className={`color-dot ${color === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => onColorChange(c)}
          />
        ))}
      </div>

      <div className="opacity-slider-container">
        <div className="opacity-track">
          <div 
            className="opacity-fill" 
            style={{ width: `${opacity * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="opacity-input"
          />
        </div>
      </div>

      <div className="divider" />

      <div className="font-size-row">
        {['S', 'M', 'L', 'XL'].map(size => (
          <button
            key={size}
            className={`size-btn ${fontSize === size ? 'active' : ''}`}
            onClick={() => onFontSizeChange(size as any)}
          >
            {size}
          </button>
        ))}
      </div>

      <div className="divider" />

      <div className="text-align-row">
        {[
          { id: 'left', icon: 'M3 12h18M3 6h18M3 18h12' },
          { id: 'center', icon: 'M3 12h18M3 6h18M3 18h18' },
          { id: 'right', icon: 'M3 12h18M3 6h18M9 18h12' },
          { id: 'justify', icon: 'M3 12h18M3 6h18M3 18h18' }
        ].map(align => (
          <button
            key={align.id}
            className={`align-btn ${textAlign === align.id ? 'active' : ''}`}
            onClick={() => onTextAlignChange(align.id as any)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={align.icon} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StylePanel;
