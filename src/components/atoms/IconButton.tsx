import React from 'react';

interface IconButtonProps {
  onClick?: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, active, className = '', children, title }) => {
  return (
    <button 
      className={`tool-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
};

export default IconButton;
