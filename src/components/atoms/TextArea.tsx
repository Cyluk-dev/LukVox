import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  fullWidth?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ 
  label, 
  error, 
  className = '', 
  fullWidth = false,
  id, 
  ...props 
}, ref) => {
  const baseClass = 'textarea-atom';
  const fullWidthClass = fullWidth ? 'full-width' : '';
  const errorClass = error ? 'textarea-atom-error' : '';

  return (
    <div className={`textarea-atom-wrapper ${fullWidthClass}`}>
      {label && <label htmlFor={id} className="textarea-atom-label">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        className={`${baseClass} ${errorClass} ${fullWidthClass} ${className}`}
        {...props}
      />
      {error && <span className="textarea-atom-error-text">{error}</span>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
