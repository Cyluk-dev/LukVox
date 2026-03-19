import React, { useState } from 'react';
import Checkbox from '../atoms/Checkbox';
import Badge from '../atoms/Badge';
import PopupOption from '../molecules/PopupOption';

interface OnboardingPopupProps {
  onClose: () => void;
}

const OnboardingPopup: React.FC<OnboardingPopupProps> = ({ onClose }) => {
  const [isRectangleSelected, setIsRectangleSelected] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [useAccepted, setUseAccepted] = useState(false);

  const canConfirm = isRectangleSelected && termsAccepted && useAccepted;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>¿Qué figuras usarás para hacer tu boceto?</h2>
        
        <div className="popup-options">
          <PopupOption 
            label="Rectángulo"
            selected={isRectangleSelected}
            onClick={() => setIsRectangleSelected(!isRectangleSelected)}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
          </PopupOption>
        </div>

        <div className="selected-info">
          <p>Has seleccionado:</p>
          <div className="selected-badges">
            {isRectangleSelected ? (
              <Badge>Rectángulo</Badge>
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
          onClick={onClose}
        >
          Confirmar figuras a usar
        </button>
      </div>
    </div>
  );
};

export default OnboardingPopup;
