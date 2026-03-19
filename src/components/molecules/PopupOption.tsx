import React from 'react';

interface PopupOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const PopupOption: React.FC<PopupOptionProps> = ({ label, selected, onClick, children }) => {
  return (
    <button 
      className={`popup-option-btn ${selected ? 'selected' : ''}`} 
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
};

export default PopupOption;
