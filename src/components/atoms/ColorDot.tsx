import React from 'react';

interface ColorDotProps {
  color: string;
  active?: boolean;
  onClick: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ColorDot: React.FC<ColorDotProps> = ({ 
  color, 
  active, 
  onClick, 
  size = 'md',
  className = '' 
}) => {
  const baseClass = 'color-dot-atom';
  const sizeClass = `color-dot-${size}`;
  const activeClass = active ? 'active' : '';

  return (
    <button
      className={`${baseClass} ${sizeClass} ${activeClass} ${className}`}
      style={{ backgroundColor: color }}
      onClick={() => onClick(color)}
      aria-label={`Select color ${color}`}
    />
  );
};

export default ColorDot;
