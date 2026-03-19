import React, { useState } from 'react';
import Checkbox from '../atoms/Checkbox';
import Badge from '../atoms/Badge';
import PopupOption from '../molecules/PopupOption';

interface OnboardingPopupProps {
  onClose: (selectedShapes: ('rectangle' | 'circle' | 'triangle')[]) => void;
}

const OnboardingPopup: React.FC<OnboardingPopupProps> = ({ onClose }) => {
  const [selectedShapes, setSelectedShapes] = useState<('rectangle' | 'circle' | 'triangle')[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [useAccepted, setUseAccepted] = useState(false);

  const toggleShape = (shape: 'rectangle' | 'circle' | 'triangle') => {
    setSelectedShapes(prev => 
      prev.includes(shape) 
        ? prev.filter(s => s !== shape) 
        : [...prev, shape]
    );
  };

  const canConfirm = selectedShapes.length > 0 && termsAccepted && useAccepted;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>¿Qué figuras usarás para hacer tu boceto?</h2>
        
        <div className="popup-options">
          <PopupOption 
            label="Rectángulo"
            selected={selectedShapes.includes('rectangle')}
            onClick={() => toggleShape('rectangle')}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </PopupOption>

          <PopupOption 
            label="Círculo"
            selected={selectedShapes.includes('circle')}
            onClick={() => toggleShape('circle')}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </PopupOption>

          <PopupOption 
            label="Triángulo"
            selected={selectedShapes.includes('triangle')}
            onClick={() => toggleShape('triangle')}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 21H22L12 3Z"/>
            </svg>
          </PopupOption>
        </div>

        <div className="selected-info">
          <p>Has seleccionado:</p>
          <div className="selected-badges">
            {selectedShapes.length > 0 ? (
              selectedShapes.map(shape => (
                <Badge key={shape}>
                  {shape === 'rectangle' ? 'Rectángulo' : shape === 'circle' ? 'Círculo' : 'Triángulo'}
                </Badge>
              ))
            ) : (
              <Badge empty>Ninguna figura seleccionada</Badge>
            )}
          </div>
        </div>

        <div className="terms-section">
          <Checkbox 
            label="Acepto los términos de servicio"
            checked={termsAccepted}
            onChange={setTermsAccepted}
          />
          <Checkbox 
            label="Acepto los términos de uso"
            checked={useAccepted}
            onChange={setUseAccepted}
          />
        </div>

        <button 
          className="popup-confirm-btn" 
          disabled={!canConfirm}
          onClick={() => onClose(selectedShapes)}
        >
          Confirmar figuras a usar
        </button>
      </div>
    </div>
  );
};

export default OnboardingPopup;
