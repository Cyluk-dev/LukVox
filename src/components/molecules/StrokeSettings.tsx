import React, { useState } from 'react';
import Slider from '../atoms/Slider';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

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
  enabledShapes: ('rectangle' | 'circle' | 'triangle')[];
  shapeThresholds: {
    rectangle: number;
    circle: number;
    triangle: number;
  };
  onThresholdChange: (shape: 'rectangle' | 'circle' | 'triangle', value: number) => void;
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
  enabledShapes,
  shapeThresholds,
  onThresholdChange,
  presets,
  onSavePreset,
  onResetToDefaults,
  onApplyPreset,
}) => {
  const [editingWidth, setEditingWidth] = useState(false);
  const [editingThinning, setEditingThinning] = useState(false);
  
  const [editingThreshold, setEditingThreshold] = useState<'rectangle' | 'circle' | 'triangle' | null>(null);
  
  const [tempWidth, setTempWidth] = useState(baseStrokeWidth.toString());
  const [tempThinning, setTempThinning] = useState(thinning.toString());
  const [tempThreshold, setTempThreshold] = useState('');

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

  const handleThresholdSubmit = () => {
    if (!editingThreshold) return;
    let val = parseFloat(tempThreshold);
    if (!isNaN(val)) {
      onThresholdChange(editingThreshold, Math.max(0, Math.min(100, val)) / 100);
    }
    setEditingThreshold(null);
  };

  const PencilIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', cursor: 'pointer', opacity: 0.6 }}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  );

  return (
    <div 
      className="stroke-settings-panel"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="settings-group">
        <div className="settings-header">
          <div className="grid-settings-label">Grosor</div>
          <div onClick={() => { setEditingWidth(true); setTempWidth(baseStrokeWidth.toString()); }}>
            <PencilIcon />
          </div>
        </div>
        <Slider 
          min={0} 
          max={10} 
          step={0.1}
          value={baseStrokeWidth > 10 ? 10 : baseStrokeWidth} 
          onChange={setBaseStrokeWidth}
        />
        <div className="grid-settings-value">
          {editingWidth ? (
            <Input 
              inputSize="sm"
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
        <Slider 
          min={0} 
          max={3} 
          step={0.05}
          value={thinning > 3 ? 3 : thinning} 
          onChange={setThinning}
        />
        <div className="grid-settings-value">
          {editingThinning ? (
            <Input 
              inputSize="sm"
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

      {enabledShapes.includes('rectangle') && (
        <div className="settings-group">
          <div className="settings-header">
            <div className="grid-settings-label">Similitud Rectángulo</div>
            <div onClick={() => { setEditingThreshold('rectangle'); setTempThreshold((shapeThresholds.rectangle * 100).toFixed(0)); }}>
              <PencilIcon />
            </div>
          </div>
          <Slider 
            min={0} 
            max={1} 
            step={0.01}
            value={shapeThresholds.rectangle} 
            onChange={(v) => onThresholdChange('rectangle', v)}
          />
          <div className="grid-settings-value">
            {editingThreshold === 'rectangle' ? (
              <Input 
                inputSize="sm"
                value={tempThreshold}
                autoFocus
                onChange={(e) => setTempThreshold(e.target.value)}
                onBlur={handleThresholdSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleThresholdSubmit()}
              />
            ) : (
              `${(shapeThresholds.rectangle * 100).toFixed(0)}%`
            )}
          </div>
        </div>
      )}

      {enabledShapes.includes('circle') && (
        <div className="settings-group">
          <div className="settings-header">
            <div className="grid-settings-label">Similitud Círculo</div>
            <div onClick={() => { setEditingThreshold('circle'); setTempThreshold((shapeThresholds.circle * 100).toFixed(0)); }}>
              <PencilIcon />
            </div>
          </div>
          <Slider 
            min={0} 
            max={1} 
            step={0.01}
            value={shapeThresholds.circle} 
            onChange={(v) => onThresholdChange('circle', v)}
          />
          <div className="grid-settings-value">
            {editingThreshold === 'circle' ? (
              <Input 
                inputSize="sm"
                value={tempThreshold}
                autoFocus
                onChange={(e) => setTempThreshold(e.target.value)}
                onBlur={handleThresholdSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleThresholdSubmit()}
              />
            ) : (
              `${(shapeThresholds.circle * 100).toFixed(0)}%`
            )}
          </div>
        </div>
      )}

      {enabledShapes.includes('triangle') && (
        <div className="settings-group">
          <div className="settings-header">
            <div className="grid-settings-label">Similitud Triángulo</div>
            <div onClick={() => { setEditingThreshold('triangle'); setTempThreshold((shapeThresholds.triangle * 100).toFixed(0)); }}>
              <PencilIcon />
            </div>
          </div>
          <Slider 
            min={0} 
            max={1} 
            step={0.01}
            value={shapeThresholds.triangle} 
            onChange={(v) => onThresholdChange('triangle', v)}
          />
          <div className="grid-settings-value">
            {editingThreshold === 'triangle' ? (
              <Input 
                inputSize="sm"
                value={tempThreshold}
                autoFocus
                onChange={(e) => setTempThreshold(e.target.value)}
                onBlur={handleThresholdSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleThresholdSubmit()}
              />
            ) : (
              `${(shapeThresholds.triangle * 100).toFixed(0)}%`
            )}
          </div>
        </div>
      )}

      <div className="settings-actions">
        <Button variant="primary" onClick={onSavePreset} disabled={presets.length >= 20} fullWidth>
          Guardar ajuste {presets.length + 1}
        </Button>
        <Button variant="secondary" onClick={onResetToDefaults} fullWidth>
          Volver a predeterminados
        </Button>
      </div>

      {presets.length > 0 && (
        <div className="presets-grid">
          {presets.map((preset, index) => (
            <Button 
              key={preset.id} 
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset(preset)}
              title={`Grosor: ${preset.width}, Presión: ${preset.thinning}`}
              className="preset-tag-override"
            >
              #{index + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrokeSettings;
