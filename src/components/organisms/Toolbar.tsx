import React from 'react';
import IconButton from '../atoms/IconButton';
import Separator from '../atoms/Separator';
import ShapesMenu from './ShapesMenu';
import type { Tool } from '../../types';

interface ToolbarProps {
  showShapes: boolean;
  setShowShapes: (show: boolean) => void;
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  isSmartShapeEnabled: boolean;
  setIsSmartShapeEnabled: (enabled: boolean) => void;
  enabledShapes: ('rectangle' | 'circle' | 'triangle')[];
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  showShapes, 
  setShowShapes, 
  activeTool, 
  setActiveTool,
  isSmartShapeEnabled,
  setIsSmartShapeEnabled,
  enabledShapes
}) => {
  return (
    <div 
      className="toolbar-container"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Upper Floating Toolbar */}
      <div className="toolbar-upper">
        <IconButton><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></IconButton>
        <IconButton><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></IconButton>
        <Separator />
        <IconButton><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></IconButton>
        <IconButton><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></IconButton>
        <Separator />
        <IconButton><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></IconButton>
      </div>

      {/* Main Floating Toolbar */}
      <div className="toolbar-main">
        {showShapes && (
          <ShapesMenu 
            enabledShapes={enabledShapes} 
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
        )}

        {/* 1. Cursor */}
        <IconButton 
          active={activeTool === 'select'} 
          onClick={() => setActiveTool('select')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path fillRule="evenodd" clipRule="evenodd" d="M19.5027 9.96958C20.7073 10.4588 20.6154 12.1941 19.3658 12.5533L13.0605 14.3658L10.1807 20.2606C9.60996 21.4288 7.88499 21.218 7.6124 19.9468L4.67677 6.25646C4.44638 5.18204 5.5121 4.2878 6.53019 4.70126L19.5027 9.96958Z" stroke="currentColor" strokeWidth="1.5"></path>
          </svg>
        </IconButton>
        
        {/* 2. Hand */}
        <IconButton 
          active={activeTool === 'hand'} 
          onClick={() => setActiveTool('hand')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
        </IconButton>
        
        {/* 3. Pencil */}
        <IconButton 
          active={activeTool === 'pencil'} 
          onClick={() => setActiveTool('pencil')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </IconButton>
        
        {/* 4. Eraser */}
        <IconButton 
          active={activeTool === 'eraser'} 
          onClick={() => setActiveTool('eraser')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21L9 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M15.889 14.8891L8.46436 7.46448" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M2.8934 12.6066L12.0858 3.41421C12.8668 2.63317 14.1332 2.63317 14.9142 3.41421L19.864 8.36396C20.645 9.14501 20.645 10.4113 19.864 11.1924L10.6213 20.435C10.2596 20.7968 9.76894 21 9.25736 21C8.74577 21 8.25514 20.7968 7.8934 20.435L2.8934 15.435C2.11235 14.654 2.11235 13.3877 2.8934 12.6066Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </IconButton>
        
        {/* 5. Arrow */}
        <IconButton 
          active={activeTool === 'arrow'} 
          onClick={() => setActiveTool('arrow')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </IconButton>
        
        {/* 6. Text */}
        <IconButton 
          active={activeTool === 'text'} 
          onClick={() => setActiveTool('text')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7H20M4 12H17.5C18.8807 12 20 13.1193 20 14.5V14.5C20 15.8807 18.8807 17 17.5 17H12.5M15 15.5L12.5 17L15 18.5V15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </IconButton>
        
        {/* 7. Note */}
        <IconButton 
          active={activeTool === 'note'} 
          onClick={() => setActiveTool('note')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 14L16 14M8 10L10 10M8 18L12 18M10 3H6C4.89543 3 4 3.89543 4 5V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V5C20 3.89543 19.1046 3 18 3H14.5M10 3V1M10 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </IconButton>
        
        {/* 8. Image Upload */}
        <IconButton 
          active={activeTool === 'image'} 
          onClick={() => setActiveTool('image')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M12 4L15.5 7.5M12 4L8.5 7.5" />
            <path d="M6 20L18 20" />
          </svg>
        </IconButton>
        
        <IconButton 
          active={showShapes}
          onClick={() => setShowShapes(!showShapes)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </IconButton>

        <Separator />
        
        <IconButton 
          active={isSmartShapeEnabled}
          onClick={() => setIsSmartShapeEnabled(!isSmartShapeEnabled)}
          title="Auto-reconocimiento de formas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </IconButton>
      </div>
    </div>
  );
};

export default Toolbar;
