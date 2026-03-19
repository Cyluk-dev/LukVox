import React from 'react';

interface TextEditorProps {
  x: number;
  y: number;
  value: string;
  isEditing: boolean;
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  scale: number;
  offset: { x: number; y: number };
  onValueChange: (value: string) => void;
  onEditingChange: (isEditing: boolean) => void;
  onFontSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onBoldChange: (isBold: boolean) => void;
  onItalicChange: (isItalic: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  x,
  y,
  value,
  isEditing,
  fontSize,
  color,
  isBold,
  isItalic,
  scale,
  offset,
  onValueChange,
  onEditingChange,
  onFontSizeChange,
  onColorChange,
  onBoldChange,
  onItalicChange,
  onConfirm,
  onCancel,
}) => {
  return (
    <div 
      className="whiteboard-text-editor-container"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: x * scale + offset.x,
        top: y * scale + offset.y,
        zIndex: 1001,
      }}
    >
      {!isEditing && !value ? (
        <div 
          className="text-placeholder"
          onClick={() => onEditingChange(true)}
          style={{
            fontFamily: '"Shantell Sans", cursive',
            fontSize: `${fontSize * scale}px`,
            color: '#aaa',
            cursor: 'text',
            padding: '4px',
            border: '1px dashed #3b82f6',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.8)'
          }}
        >
          toca para escribir...
        </div>
      ) : (
        <div className="text-editor-box">
          <textarea
            className="whiteboard-text-input"
            autoFocus
            value={value}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onCancel();
              }
            }}
            style={{
              fontSize: `${fontSize * scale}px`,
              color: color,
              fontFamily: '"Shantell Sans", cursive',
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              minWidth: '100px',
            }}
          />
          <div className="text-toolbar">
            <div className="toolbar-section">
              <button 
                className={`tool-btn ${isBold ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); onBoldChange(!isBold); }}
              >
                <b>B</b>
              </button>
              <button 
                className={`tool-btn ${isItalic ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); onItalicChange(!isItalic); }}
              >
                <i>I</i>
              </button>
            </div>
            <div className="toolbar-section">
              <input 
                type="number" 
                className="size-input"
                value={Math.round(fontSize)}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="toolbar-section">
              <input 
                type="color" 
                className="color-input"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <button className="confirm-btn" onMouseDown={(e) => { e.preventDefault(); onConfirm(); }}>✓</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
