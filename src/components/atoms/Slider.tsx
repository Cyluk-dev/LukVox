import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  showValue?: boolean;
}

const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min = 0, 
  max = 1, 
  step = 0.01, 
  onChange, 
  className = '', 
  showValue = false 
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`slider-atom-container ${className}`}>
      {label && (
        <div className="slider-atom-header">
          <span className="slider-atom-label">{label}</span>
          {showValue && <span className="slider-atom-value">{value.toFixed(2)}</span>}
        </div>
      )}
      <div className="slider-atom-track-wrapper">
        <div className="slider-atom-track">
          <div 
            className="slider-atom-fill" 
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="slider-atom-input"
          />
        </div>
      </div>
    </div>
  );
};

export default Slider;
