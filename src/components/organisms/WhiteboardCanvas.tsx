import React, { useEffect, useRef } from 'react';
import type { Point, Stroke } from '../../types';
import { getStroke } from 'perfect-freehand';
import { getBoundingBox, getRotateHandlePos, rotatePoint } from '../../utils/whiteboardUtils';

interface WhiteboardCanvasProps {
  strokes: Stroke[];
  currentStroke: Point[] | null;
  offset: { x: number; y: number };
  scale: number;
  selectedStrokeId: string | null;
  isDraggingStroke: boolean;
  dragOffset: { x: number; y: number };
  baseStrokeWidth: number;
  thinning: number;
  activeTool: string;
  activeColor: string;
  activeOpacity: number;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  strokes,
  currentStroke,
  offset,
  scale,
  selectedStrokeId,
  isDraggingStroke,
  dragOffset,
  baseStrokeWidth,
  thinning,
  activeTool,
  activeColor,
  activeOpacity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Re-get context after resize just in case
    const currentCtx = canvas.getContext('2d');
    if (!currentCtx) return;

    currentCtx.clearRect(0, 0, canvas.width, canvas.height);
    currentCtx.lineCap = 'round';
    currentCtx.lineJoin = 'round';

    const drawPoints = (stroke: Stroke, points: Point[], color: string, strokeWidth: number, strokeThinning: number, xOffset = 0, yOffset = 0, angle = 0, box: any = null) => {
      if (points.length < 1) return;
      
      currentCtx.save();
      
      // Apply global alpha for strokes
      currentCtx.globalAlpha = stroke.opacity !== undefined ? stroke.opacity : 1;
      
      const center = box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : { x: 0, y: 0 };

      // Generate the stroke outline using perfect-freehand
      const strokePoints = points.map(p => {
        const rotated = rotatePoint(p, angle, center, xOffset, yOffset);
        // Map pressure: p.w ranges from strokeWidth to strokeWidth * 5
        // We want 0.1 to 1.0 (inverted because higher velocity = smaller w = higher pressure in our current w logic?)
        // Wait, currently: higher velocity = smaller w. Smaller w should mean smaller pressure (thinner).
        // So (p.w - strokeWidth) / (strokeWidth * 4) gives 0 at high velocity, 1 at low velocity.
        const pressure = p.w ? Math.max(0.1, Math.min(1, (p.w - strokeWidth) / (strokeWidth * 4))) : 0.5;
        return [rotated.x, rotated.y, pressure];
      });

      const outlinePoints = getStroke(strokePoints, {
        size: strokeWidth * 4,
        thinning: strokeThinning, // Use passed thinning
        smoothing: 0.95,
        streamline: 0.6,
        easing: (t) => t * (2 - t),
        start: { taper: 15, cap: true },
        end: { taper: 15, cap: true },
        simulatePressure: points.every(p => p.w === undefined),
      });

      if (outlinePoints.length < 2) return;

      currentCtx.beginPath();
      currentCtx.fillStyle = color;
      
      // Draw with quadratic curves for smoothness
      const first = outlinePoints[0];
      currentCtx.moveTo(first[0] * scale + offset.x, first[1] * scale + offset.y);

      for (let i = 1; i < outlinePoints.length; i++) {
        const p0 = outlinePoints[i - 1];
        const p1 = outlinePoints[i];
        const midX = (p0[0] + p1[0]) / 2;
        const midY = (p0[1] + p1[1]) / 2;
        currentCtx.quadraticCurveTo(
          p0[0] * scale + offset.x,
          p0[1] * scale + offset.y,
          midX * scale + offset.x,
          midY * scale + offset.y
        );
      }

      currentCtx.closePath();
      currentCtx.fill();
      currentCtx.restore();
    };

    const drawArrow = (stroke: Stroke, xOffset = 0, yOffset = 0, angle = 0, box: any = null) => {
      const points = stroke.points;
      if (points.length < 2) return;
      
      const start = points[0];
      const end = points[1];
      
      const center = box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : { x: 0, y: 0 };
      
      const pStart = rotatePoint(start, angle, center, xOffset, yOffset);
      const pEnd = rotatePoint(end, angle, center, xOffset, yOffset);

      const arrowAngle = Math.atan2(pEnd.y - pStart.y, pEnd.x - pStart.x);
      const headLength = Math.max(stroke.width * 5, 12);
      const headAngle = Math.PI / 6; // 30 degrees

      currentCtx.save();
      currentCtx.globalAlpha = stroke.opacity !== undefined ? stroke.opacity : 1;
      
      currentCtx.beginPath();
      currentCtx.strokeStyle = stroke.isMarkedForDeletion ? '#e0e0e0' : stroke.color;
      currentCtx.lineWidth = stroke.width * 1.5; // Slightly thinner line for elegance
      currentCtx.lineCap = 'round';
      currentCtx.lineJoin = 'round';

      // Draw Main Shaft
      currentCtx.moveTo(pStart.x * scale + offset.x, pStart.y * scale + offset.y);
      currentCtx.lineTo(pEnd.x * scale + offset.x, pEnd.y * scale + offset.y);
      
      // Draw Arrow Head (Open style)
      currentCtx.moveTo(
        (pEnd.x - headLength * Math.cos(arrowAngle - headAngle)) * scale + offset.x,
        (pEnd.y - headLength * Math.sin(arrowAngle - headAngle)) * scale + offset.y
      );
      currentCtx.lineTo(pEnd.x * scale + offset.x, pEnd.y * scale + offset.y);
      currentCtx.lineTo(
        (pEnd.x - headLength * Math.cos(arrowAngle + headAngle)) * scale + offset.x,
        (pEnd.y - headLength * Math.sin(arrowAngle + headAngle)) * scale + offset.y
      );
      
      currentCtx.stroke();
      currentCtx.restore();
    };

    const drawText = (stroke: Stroke, xOffset = 0, yOffset = 0, angle = 0, box: any = null) => {
      if (!stroke.text || stroke.points.length === 0) return;
      
      const pos = stroke.points[0];
      const center = box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : { x: 0, y: 0 };
      const pPos = rotatePoint(pos, angle, center, xOffset, yOffset);

      currentCtx.save();
      currentCtx.translate(pPos.x * scale + offset.x, pPos.y * scale + offset.y);
      currentCtx.rotate(angle);
      
      // Apply opacity
      currentCtx.globalAlpha = stroke.opacity !== undefined ? stroke.opacity : 1;
      
      // Apply deformation scales
      const sX = stroke.scaleX || 1;
      const sY = stroke.scaleY || 1;
      currentCtx.scale(sX, sY);
      
      const fontSize = stroke.fontSize || (stroke.width * 12);
      const scaledFontSize = fontSize * scale;
      const fontWeight = stroke.isBold ? 'bold' : 'normal';
      const fontStyle = stroke.isItalic ? 'italic' : 'normal';
      
      currentCtx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px "Shantell Sans", cursive`;
      currentCtx.fillStyle = stroke.isMarkedForDeletion ? '#e0e0e0' : stroke.color;
      
      // Alignment mapping
      const align = stroke.textAlign || 'left';
      currentCtx.textAlign = align === 'justify' ? 'left' : align;
      currentCtx.textBaseline = 'top';
      
      // Handle multi-line text
      const lines = stroke.text.split('\n');
      lines.forEach((line, i) => {
        currentCtx.fillText(line, 0, i * scaledFontSize * 1.2);
      });
      
      currentCtx.restore();
    };

    // Draw saved strokes
    strokes.forEach(s => {
      const isBeingDragged = s.id === selectedStrokeId && isDraggingStroke;
      const color = s.isMarkedForDeletion ? '#e0e0e0' : (isBeingDragged ? 'rgba(0,0,0,0.2)' : s.color);
      const box = getBoundingBox(s);

      if (s.type === 'arrow') {
        drawArrow(s, 0, 0, s.angle || 0, box);
        if (isBeingDragged) {
          drawArrow({ ...s, color: '#cccccc' }, dragOffset.x, dragOffset.y, s.angle || 0, box);
        }
      } else if (s.type === 'text') {
        drawText(s, 0, 0, s.angle || 0, box);
        if (isBeingDragged) {
          drawText({ ...s, color: '#cccccc' }, dragOffset.x, dragOffset.y, s.angle || 0, box);
        }
      } else {
        // Use stroke's individual width and thinning (default to a stable 0.8 if missing)
        drawPoints(s, s.points, color, s.width, s.thinning !== undefined ? s.thinning : 0.8, 0, 0, s.angle || 0, box);
        
        // If this is the selected stroke being dragged, draw its ghost
        if (isBeingDragged) {
          drawPoints(s, s.points, '#cccccc', s.width, s.thinning !== undefined ? s.thinning : 0.8, dragOffset.x, dragOffset.y, s.angle || 0, box);
        }
      }
    });
    
    // Draw selection bounding box
    if (selectedStrokeId) {
      const selectedStroke = strokes.find(s => s.id === selectedStrokeId);
      if (selectedStroke) {
        const box = getBoundingBox(selectedStroke);
        if (box) {
          const angle = selectedStroke.angle || 0;
          const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
          
          currentCtx.save();
          currentCtx.translate(center.x * scale + offset.x, center.y * scale + offset.y);
          currentCtx.rotate(angle);
          currentCtx.translate(-(center.x * scale + offset.x), -(center.y * scale + offset.y));

          currentCtx.beginPath();
          currentCtx.strokeStyle = '#3b82f6';
          currentCtx.lineWidth = 1;
          currentCtx.setLineDash([5, 5]);
          currentCtx.rect(
            box.x * scale + offset.x - 5,
            box.y * scale + offset.y - 5,
            box.width * scale + 10,
            box.height * scale + 10
          );
          currentCtx.stroke();
          currentCtx.setLineDash([]);

          // Draw handles
          const handleSize = 6;
          currentCtx.fillStyle = 'white';
          currentCtx.strokeStyle = '#3b82f6';
          const handlePoints = [
            { id: 'nw', x: box.x, y: box.y },
            { id: 'ne', x: box.x + box.width, y: box.y },
            { id: 'sw', x: box.x, y: box.y + box.height },
            { id: 'se', x: box.x + box.width, y: box.y + box.height },
            { id: 'n', x: box.x + box.width / 2, y: box.y },
            { id: 's', x: box.x + box.width / 2, y: box.y + box.height },
            { id: 'e', x: box.x + box.width, y: box.y + box.height / 2 },
            { id: 'w', x: box.x, y: box.y + box.height / 2 }
          ];
          handlePoints.forEach(c => {
            currentCtx.beginPath();
            currentCtx.setLineDash([]);
            currentCtx.rect(
              c.x * scale + offset.x - handleSize/2,
              c.y * scale + offset.y - handleSize/2,
              handleSize,
              handleSize
            );
            currentCtx.fill();
            currentCtx.stroke();
          });

          // Draw rotate handle
          const rotPos = getRotateHandlePos(box, scale);
          currentCtx.beginPath();
          currentCtx.arc(rotPos.x * scale + offset.x, rotPos.y * scale + offset.y, 12, 0, Math.PI * 2);
          currentCtx.fillStyle = 'white';
          currentCtx.fill();
          currentCtx.stroke();

          // Draw the rotate icon
          currentCtx.translate(rotPos.x * scale + offset.x - 8, rotPos.y * scale + offset.y - 8);
          currentCtx.scale(0.7, 0.7);
          currentCtx.lineWidth = 2;
          currentCtx.strokeStyle = '#000000';
          currentCtx.beginPath();
          currentCtx.arc(12, 12, 10, 0, Math.PI * 2);
          currentCtx.stroke();
          currentCtx.beginPath();
          currentCtx.arc(12, 12, 1, 0, Math.PI * 2);
          currentCtx.stroke();
          currentCtx.restore();
        }
      }
    }
    
    // Draw current stroke
    if (currentStroke) {
      if (activeTool === 'arrow') {
        drawArrow({ points: currentStroke, color: activeColor, width: baseStrokeWidth, opacity: activeOpacity } as any, 0, 0, 0);
      } else if (activeTool === 'text') {
        // Text is handled by overlay input
      } else {
        drawPoints({ color: activeColor, opacity: activeOpacity } as any, currentStroke, activeColor, baseStrokeWidth, thinning);
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [strokes, currentStroke, offset, scale, selectedStrokeId, isDraggingStroke, dragOffset, activeTool, activeColor, activeOpacity]);

  return <canvas ref={canvasRef} className="whiteboard-canvas" />;
};

export default WhiteboardCanvas;
