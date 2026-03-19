import React from 'react';
import TextArea from '../atoms/TextArea';
import Button from '../atoms/Button';

interface TextEditorPopupProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  color: string;
  fontSize: number;
  isBold: boolean;
  onBoldChange: (isBold: boolean) => void;
  isItalic: boolean;
  onItalicChange: (isItalic: boolean) => void;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  onTextAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
  activeFontSize: 'S' | 'M' | 'L' | 'XL';
  onFontSizeChange: (size: 'S' | 'M' | 'L' | 'XL') => void;
  type?: 'text' | 'note';
}

const TextEditorPopup: React.FC<TextEditorPopupProps> = ({
  value,
  onChange,
  onConfirm,
  onCancel,
  color,
  fontSize,
  isBold,
  onBoldChange,
  isItalic,
  onItalicChange,
  textAlign,
  onTextAlignChange,
  activeFontSize,
  onFontSizeChange,
  type = 'text',
}) => {
  const isNote = type === 'note';

  return (
    <div 
      className="text-editor-popup-overlay"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="text-editor-popup-content">
        <div className="text-editor-popup-header">
          {isNote ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 14L16 14M8 10L10 10M8 18L12 18M10 3H6C4.89543 3 4 3.89543 4 5V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V5C20 3.89543 19.1046 3 18 3H14.5M10 3V1M10 3V5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 7H20M4 17H9M4 12H17.5C18.8807 12 20 13.1193 20 14.5V14.5C20 15.8807 18.8807 17 17.5 17H12.5M15 15.5L12.5 17L15 18.5V15.5Z" />
            </svg>
          )}
          {isNote ? 'Editar Nota' : 'Editar Texto'}
        </div>

        {!isNote && (
          <div className="text-editor-controls">
            <div className="control-group">
              {(['S', 'M', 'L', 'XL'] as const).map(size => (
                <Button
                  key={size}
                  variant="ghost"
                  size="sm"
                  active={activeFontSize === size}
                  onClick={() => onFontSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
            </div>

            <div className="divider-v" />

            <div className="control-group">
              <Button
                variant="ghost"
                size="sm"
                active={isBold}
                onClick={() => onBoldChange(!isBold)}
                title="Negrita"
              >
                <b>B</b>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                active={isItalic}
                onClick={() => onItalicChange(!isItalic)}
                title="Cursiva"
              >
                <i>I</i>
              </Button>
            </div>

            <div className="divider-v" />

            <div className="control-group">
              {[
                { id: 'left', icon: 'M3 12h18M3 6h18M3 18h12' },
                { id: 'center', icon: 'M3 12h18M3 6h18M3 18h18' },
                { id: 'right', icon: 'M3 12h18M3 6h18M9 18h12' },
                { id: 'justify', icon: 'M3 12h18M3 6h18M3 18h18' }
              ].map(align => (
                <Button
                  key={align.id}
                  variant="ghost"
                  size="sm"
                  active={textAlign === align.id}
                  onClick={() => onTextAlignChange(align.id as any)}
                  title={`Alinear ${align.id}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d={align.icon} />
                  </svg>
                </Button>
              ))}
            </div>
          </div>
        )}

        <TextArea
          autoFocus
          className="text-editor-textarea-override"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onConfirm();
            }
          }}
          placeholder={isNote ? "Escribe tu nota aquí..." : "Escribe aquí..."}
          style={{
            color: isNote ? '#333' : color,
            fontSize: `${Math.max(fontSize, 16)}px`,
            fontWeight: isNote ? 'normal' : (isBold ? 'bold' : 'normal'),
            fontStyle: isNote ? 'normal' : (isItalic ? 'italic' : 'normal'),
            textAlign: isNote ? 'center' : textAlign,
            minHeight: '120px',
            minWidth: '400px',
          }}
          fullWidth
        />
        <div className="text-editor-popup-actions">
          <Button variant="secondary" onClick={onCancel} style={{ minWidth: '100px' }}>Cancelar</Button>
          <Button variant="primary" onClick={onConfirm} style={{ minWidth: '100px' }}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorPopup;
