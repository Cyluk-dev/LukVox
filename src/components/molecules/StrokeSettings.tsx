import React, { useState } from 'react';

interface StrokePreset {
  id: string;
  width: number;
  thinning: number;
}

interface StrokeSettingsProps {
  baseStrokeWidth: number;
  setBaseStrokeWidth: (width: number) => void;
  thinning: number;
  setThinning: (thinning: number) => void;
  presets: StrokePreset[];
  onSavePreset: () => void;
  onResetToDefaults: () => void;
  onApplyPreset: (preset: StrokePreset) => void;
}

const StrokeSettings: React.FC<StrokeSettingsProps> = ({
  baseStrokeWidth,
  setBaseStrokeWidth,
  thinning,
  setThinning,
  presets,
  onSavePreset,
  onResetToDefaults,
  onApplyPreset,
}) => {
  const [editingWidth, setEditingWidth] = useState(false);
  const [editingThinning, setEditingThinning] = useState(false);
  const [tempWidth, setTempWidth] = useState(baseStrokeWidth.toString());
  const [tempThinning, setTempThinning] = useState(thinning.toString());

  const handleWidthSubmit = () => {
    let val = parseFloat(tempWidth);
    if (!isNaN(val)) {
      val = Math.round(val * 1000) / 1000;
      setBaseStrokeWidth(val);
    }
    setEditingWidth(false);
  };

  const handleThinningSubmit = () => {
    let val = parseFloat(tempThinning);
    if (!isNaN(val)) {
      val = Math.round(val * 1000) / 1000;
      setThinning(val);
    }
    setEditingThinning(false);
  };

  const PencilIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', cursor: 'pointer', opacity: 0.6 }}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  );

  return (
    <div className="stroke-settings-panel">
      <div className="settings-group">
        <div className="settings-header">
          <div className="grid-settings-label">Grosor</div>
          <div onClick={() => { setEditingWidth(true); setTempWidth(baseStrokeWidth.toString()); }}>
            <PencilIcon />
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="10" 
          step="0.1"
          value={baseStrokeWidth > 10 ? 10 : baseStrokeWidth} 
          onChange={(e) => setBaseStrokeWidth(Number(e.target.value))}
          className="grid-size-slider"
        />
        <div className="grid-settings-value">
          {editingWidth ? (
            <input 
              className="settings-input"
              value={tempWidth}
              autoFocus
              onChange={(e) => setTempWidth(e.target.value)}
              onBlur={handleWidthSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleWidthSubmit()}
            />
          ) : (
            baseStrokeWidth
          )}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-header">
          <div className="grid-settings-label">Presión</div>
          <div onClick={() => { setEditingThinning(true); setTempThinning(thinning.toString()); }}>
            <PencilIcon />
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="3" 
          step="0.05"
          value={thinning > 3 ? 3 : thinning} 
          onChange={(e) => setThinning(Number(e.target.value))}
          className="grid-size-slider"
        />
        <div className="grid-settings-value">
          {editingThinning ? (
            <input 
              className="settings-input"
              value={tempThinning}
              autoFocus
              onChange={(e) => setTempThinning(e.target.value)}
              onBlur={handleThinningSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleThinningSubmit()}
            />
          ) : (
            thinning.toFixed(3).replace(/\.?0+$/, '')
          )}
        </div>
      </div>

      <div className="settings-actions">
        <button className="settings-action-btn primary" onClick={onSavePreset} disabled={presets.length >= 20}>
          Guardar ajuste {presets.length + 1}
        </button>
        <button className="settings-action-btn secondary" onClick={onResetToDefaults}>
          Volver a predeterminados
        </button>
      </div>

      {presets.length > 0 && (
        <div className="presets-grid">
          {presets.map((preset, index) => (
            <button 
              key={preset.id} 
              className="preset-tag" 
              onClick={() => onApplyPreset(preset)}
              title={`Grosor: ${preset.width}, Presión: ${preset.thinning}`}
            >
              #{index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrokeSettings;
