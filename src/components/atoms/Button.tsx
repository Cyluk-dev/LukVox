import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  active, 
  fullWidth,
  className = '', 
  children, 
  ...props 
}) => {
  const baseClass = 'btn-atom';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const activeClass = active ? 'active' : '';
  const fullWidthClass = fullWidth ? 'full-width' : '';

  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${activeClass} ${fullWidthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
