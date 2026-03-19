import React from 'react';

interface ZoomIndicatorProps {
  scale: number;
  onClick: () => void;
  onEditClick: (e: React.MouseEvent) => void;
  isEditing: boolean;
  zoomInput: string;
  onZoomInputChange: (value: string) => void;
  onZoomInputBlur: () => void;
  onZoomInputKeyDown: (e: React.KeyboardEvent) => void;
}

const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({ 
  scale, 
  onClick, 
  onEditClick, 
  isEditing, 
  zoomInput, 
  onZoomInputChange, 
  onZoomInputBlur, 
  onZoomInputKeyDown 
}) => {
  return (
    <div className="zoom-indicator-wrapper">
      <div className="zoom-indicator" onClick={onClick}>
        {isEditing ? (
          <input
            type="text"
            className="zoom-input"
            value={zoomInput}
            onChange={(e) => onZoomInputChange(e.target.value)}
            onBlur={onZoomInputBlur}
            onKeyDown={onZoomInputKeyDown}
            autoFocus
          />
        ) : (
          `${(scale * 100).toFixed(0)}%`
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
      <button className="zoom-edit-btn" onClick={onEditClick} title="Editar zoom">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      </button>
    </div>
  );
};

export default ZoomIndicator;
