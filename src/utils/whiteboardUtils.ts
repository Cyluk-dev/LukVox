import type { Point, Stroke } from '../types';

export const distanceToSegment = (p: Point, a: Point, b: Point) => {
  const l2 = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  if (l2 === 0) return Math.sqrt(Math.pow(p.x - a.x, 2) + Math.pow(p.y - a.y, 2));
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(Math.pow(p.x - (a.x + t * (b.x - a.x)), 2) + Math.pow(p.y - (a.y + t * (b.y - a.y)), 2));
};

export const checkStrokeHit = (pos: Point, stroke: Stroke, scale: number) => {
  const threshold = 10 / scale;

  if (stroke.type === 'text' && stroke.text && stroke.points.length > 0) {
    const box = getBoundingBox(stroke);
    if (!box) return false;

    const angle = stroke.angle || 0;
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    // Inverse rotation to check point in local axis-aligned space
    const s = Math.sin(-angle);
    const c = Math.cos(-angle);
    const px = pos.x - center.x;
    const py = pos.y - center.y;
    const rotatedX = px * c - py * s + center.x;
    const rotatedY = px * s + py * c + center.y;

    return (
      rotatedX >= box.x && 
      rotatedX <= box.x + box.width && 
      rotatedY >= box.y && 
      rotatedY <= box.y + box.height
    );
  }

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i];
    const p2 = stroke.points[i + 1];
    if (distanceToSegment(pos, p1, p2) < threshold) return true;
  }
  return false;
};

export const getBoundingBox = (stroke: Stroke) => {
  if (stroke.points.length === 0) return null;

  if (stroke.type === 'text' && stroke.text) {
    const start = stroke.points[0];
    const fontSize = stroke.fontSize || stroke.width * 12;
    const lines = stroke.text.split('\n');
    const maxChars = Math.max(...lines.map(l => l.length));
    
    // Use actual scales if available, otherwise estimate
    const sX = stroke.scaleX || 1;
    const sY = stroke.scaleY || 1;
    
    const width = maxChars * fontSize * 0.6 * sX;
    const height = lines.length * fontSize * 1.2 * sY;
    return { x: start.x, y: start.y, width, height };
  }

  let minX = stroke.points[0].x, maxX = stroke.points[0].x;
  let minY = stroke.points[0].y, maxY = stroke.points[0].y;
  stroke.points.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

export const getRotateHandlePos = (box: { x: number, y: number, width: number, height: number }, scale: number) => {
  return { x: box.x + box.width / 2, y: box.y - 30 / scale };
};

export const getHandleAt = (pos: Point, box: { x: number, y: number, width: number, height: number }, scale: number) => {
  const threshold = 10 / scale;
  const handles = [
    { id: 'nw', x: box.x, y: box.y },
    { id: 'ne', x: box.x + box.width, y: box.y },
    { id: 'sw', x: box.x, y: box.y + box.height },
    { id: 'se', x: box.x + box.width, y: box.y + box.height },
    { id: 'n', x: box.x + box.width / 2, y: box.y },
    { id: 's', x: box.x + box.width / 2, y: box.y + box.height },
    { id: 'e', x: box.x + box.width, y: box.y + box.height / 2 },
    { id: 'w', x: box.x, y: box.y + box.height / 2 }
  ];
  for (const h of handles) {
    const dist = Math.sqrt(Math.pow(pos.x - h.x, 2) + Math.pow(pos.y - h.y, 2));
    if (dist < threshold) return h.id;
  }
  return null;
};

export const rotatePoint = (p: Point, ang: number, cent: Point, xOffset = 0, yOffset = 0) => {
  if (ang === 0 && xOffset === 0 && yOffset === 0) return p;
  const s = Math.sin(ang);
  const c = Math.cos(ang);
  const px = (p.x + xOffset) - cent.x;
  const py = (p.y + yOffset) - cent.y;
  return {
    ...p,
    x: px * c - py * s + cent.x,
    y: px * s + py * c + cent.y
  };
};

export const getSvgPathFromPoints = (outlinePoints: number[][]) => {
  if (!outlinePoints.length) return '';
  
  const d = outlinePoints.reduce(
    (acc, [x, y], i) => {
      if (i === 0) acc.push(`M ${x} ${y}`);
      else acc.push(`L ${x} ${y}`);
      return acc;
    },
    [] as string[]
  );

  d.push('Z');
  return d.join(' ');
};

export const generateArrowPoints = (start: Point, end: Point, baseWidth: number) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const headLength = Math.min(length / 3, 20);
  const headAngle = Math.PI / 6; // 30 degrees

  // Main shaft points (with some intermediate points for smoothness)
  const shaftPoints: Point[] = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    shaftPoints.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
      w: baseWidth * 4 // Slightly thicker shaft
    });
  }

  // Arrow head points
  const tip1 = {
    x: end.x - headLength * Math.cos(angle - headAngle),
    y: end.y - headLength * Math.sin(angle - headAngle),
    w: baseWidth * 2
  };
  const tip2 = {
    x: end.x - headLength * Math.cos(angle + headAngle),
    y: end.y - headLength * Math.sin(angle + headAngle),
    w: baseWidth * 2
  };

  // Construct a single path for the stroke
  return [
    ...shaftPoints,
    { ...end, w: baseWidth * 4 },
    tip1,
    { ...end, w: baseWidth * 4 },
    tip2
  ];
};
