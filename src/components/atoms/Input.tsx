import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  inputSize = 'md',
  id, 
  ...props 
}) => {
  const baseClass = 'input-atom';
  const sizeClass = `input-atom-${inputSize}`;
  const errorClass = error ? 'input-atom-error' : '';

  return (
    <div className={`input-atom-wrapper ${className}`}>
      {label && <label htmlFor={id} className="input-atom-label">{label}</label>}
      <input
        id={id}
        className={`${baseClass} ${sizeClass} ${errorClass}`}
        {...props}
      />
      {error && <span className="input-atom-error-text">{error}</span>}
    </div>
  );
};

export default Input;
