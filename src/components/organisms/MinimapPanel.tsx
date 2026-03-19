import React from 'react';
import GridSettings from '../molecules/GridSettings';
import type { Stroke } from '../../types';
import { getBoundingBox } from '../../utils/whiteboardUtils';

interface MinimapPanelProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  baseGridSize: number;
  setBaseGridSize: (size: number) => void;
  onClose: () => void;
  strokes: Stroke[];
  offset: { x: number; y: number };
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

const MinimapPanel: React.FC<MinimapPanelProps> = ({ 
  scale, 
  setScale, 
  baseGridSize, 
  setBaseGridSize, 
  onClose,
  strokes,
  offset,
  setOffset
}) => {
  // Map dimensions
  const mapW = 200;
  const mapH = 140;
  
  // Calculate project bounds to center everything in the minimap
  // Default to screen size if no strokes
  let minX = -window.innerWidth / 2, maxX = window.innerWidth / 2;
  let minY = -window.innerHeight / 2, maxY = window.innerHeight / 2;

  if (strokes.length > 0) {
    minX = Infinity; maxX = -Infinity;
    minY = Infinity; maxY = -Infinity;
    strokes.forEach(s => {
      const box = getBoundingBox(s);
      if (box) {
        minX = Math.min(minX, box.x);
        maxX = Math.max(maxX, box.x + box.width);
        minY = Math.min(minY, box.y);
        maxY = Math.max(maxY, box.y + box.height);
      }
    });
    // Add some margin to the project bounds
    const margin = 200;
    minX -= margin; maxX += margin;
    minY -= margin; maxY += margin;
  }

  const projectW = maxX - minX;
  const projectH = maxY - minY;
  
  const mapScale = Math.min(mapW / projectW, mapH / projectH);
  
  const centerX = minX + projectW / 2;
  const centerY = minY + projectH / 2;

  // Function to convert world coords to map coords
  const toMap = (x: number, y: number) => ({
    x: (x - centerX) * mapScale + mapW / 2,
    y: (y - centerY) * mapScale + mapH / 2
  });

  // Current view rectangle in map coordinates
  const viewTopLeft = toMap(-offset.x / scale, -offset.y / scale);
  const viewBottomRight = toMap((window.innerWidth - offset.x) / scale, (window.innerHeight - offset.y) / scale);
  
  const viewW = viewBottomRight.x - viewTopLeft.x;
  const viewH = viewBottomRight.y - viewTopLeft.y;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert map click back to world coordinates
    const worldX = (clickX - mapW / 2) / mapScale + centerX;
    const worldY = (clickY - mapH / 2) / mapScale + centerY;

    // Center the viewport on this world position
    setOffset({
      x: window.innerWidth / 2 - worldX * scale,
      y: window.innerHeight / 2 - worldY * scale
    });
  };

  return (
    <div className="minimap-panel" onMouseDown={(e) => e.stopPropagation()}>
      <div className="minimap-header">
        <span className="minimap-zoom">Navegación</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="minimap-btn" onClick={() => setScale(s => s * 0.9)} title="Alejar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
          </button>
          <span className="minimap-zoom-val">{(scale * 100).toFixed(0)}%</span>
          <button className="minimap-btn" onClick={() => setScale(s => s * 1.1)} title="Acercar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button className="minimap-btn toggle active" onClick={onClose} title="Cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div className="minimap-view" onClick={handleMapClick} style={{ cursor: 'crosshair' }}>
        <div className="minimap-content">
          {/* Viewport Indicator */}
          <div 
            className="minimap-viewport"
            style={{
              left: `${viewTopLeft.x}px`,
              top: `${viewTopLeft.y}px`,
              width: `${Math.max(4, viewW)}px`,
              height: `${Math.max(4, viewH)}px`
            }}
          />
          
          {/* All elements as "gray boxes" */}
          {strokes.map(s => {
            const box = getBoundingBox(s);
            if (!box) return null;
            const pos = toMap(box.x, box.y);
            const w = box.width * mapScale;
            const h = box.height * mapScale;
            
            return (
              <div 
                key={s.id}
                className="minimap-item"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${Math.max(2, w)}px`,
                  height: `${Math.max(2, h)}px`,
                  backgroundColor: '#cbd5e1', // Neutral gray
                  opacity: 0.8
                }}
              />
            );
          })}
        </div>
      </div>
      <GridSettings 
        baseGridSize={baseGridSize}
        setBaseGridSize={setBaseGridSize}
      />
    </div>
  );
};

export default MinimapPanel;
