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

  if ((stroke.type === 'text' || stroke.type === 'note' || stroke.type === 'image') && stroke.points.length > 0) {
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

  if (stroke.type === 'note') {
    const start = stroke.points[0];
    const size = 180; // Fixed size for sticky notes
    return { x: start.x - size / 2, y: start.y - size / 2, width: size, height: size };
  }

  if (stroke.type === 'image' && stroke.imageUrl) {
    const start = stroke.points[0];
    const width = stroke.imageWidth || 200;
    const height = stroke.imageHeight || 200;
    return { x: start.x - width / 2, y: start.y - height / 2, width, height };
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

export const detectRectangle = (points: Point[], threshold = 0.6) => {
  if (points.length < 10) return null;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 10 || height < 10) return null;

  // Check for square-ness
  const ratio = width / height;
  let finalMinX = minX, finalMaxX = maxX, finalMinY = minY, finalMaxY = maxY;
  
  if (ratio > 0.85 && ratio < 1.15) {
    const side = (width + height) / 2;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    finalMinX = centerX - side / 2;
    finalMaxX = centerX + side / 2;
    finalMinY = centerY - side / 2;
    finalMaxY = centerY + side / 2;
  }

  const sides = [
    { a: { x: finalMinX, y: finalMinY }, b: { x: finalMaxX, y: finalMinY } },
    { a: { x: finalMaxX, y: finalMinY }, b: { x: finalMaxX, y: finalMaxY } },
    { a: { x: finalMaxX, y: finalMaxY }, b: { x: finalMinX, y: finalMaxY } },
    { a: { x: finalMinX, y: finalMaxY }, b: { x: finalMinX, y: finalMinY } }
  ];

  let totalDistance = 0;
  points.forEach(p => {
    let minSideDist = Infinity;
    sides.forEach(side => {
      minSideDist = Math.min(minSideDist, distanceToSegment(p, side.a, side.b));
    });
    totalDistance += minSideDist;
  });

  const avgDistance = totalDistance / points.length;
  const diagonal = Math.sqrt(width * width + height * height);
  // Improved similarity calculation: use a smaller denominator for stricter detection
  const similarity = Math.max(0, 1 - (avgDistance / (diagonal * 0.12)));

  if (similarity >= threshold) {
    return [
      { x: finalMinX, y: finalMinY },
      { x: finalMaxX, y: finalMinY },
      { x: finalMaxX, y: finalMaxY },
      { x: finalMinX, y: finalMaxY },
      { x: finalMinX, y: finalMinY }
    ];
  }
  return null;
};

export const detectCircle = (points: Point[], threshold = 0.6) => {
  if (points.length < 10) return null;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  
  // A circle should have a width/height ratio close to 1
  const ratio = width / height;
  if (ratio < 0.7 || ratio > 1.3) return null;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const radius = (width + height) / 4;

  if (radius < 5) return null;

  let totalDistErr = 0;
  points.forEach(p => {
    const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    totalDistErr += Math.abs(dist - radius);
  });

  const avgDistErr = totalDistErr / points.length;
  // Use a stricter error denominator (radius * 0.4 instead of 0.5)
  const similarity = Math.max(0, 1 - (avgDistErr / (radius * 0.4)));

  if (similarity >= threshold) {
    // Return 2 points: center and a point on the circumference
    // To help with grid alignment, we'll return a point on the right
    return [
      { x: centerX, y: centerY },
      { x: centerX + radius, y: centerY }
    ];
  }
  return null;
};

export const detectTriangle = (points: Point[], threshold = 0.6) => {
  if (points.length < 10) return null;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 10 || height < 10) return null;

  // We'll try to detect a triangle that fits the bounding box
  // To make it more robust, we look at the first and last points to guess orientation
  const first = points[0];
  const last = points[points.length - 1];
  
  // Default: Upward pointing triangle
  let p1 = { x: minX + width / 2, y: minY };
  let p2 = { x: maxX, y: maxY };
  let p3 = { x: minX, y: maxY };

  // If the user seems to have drawn it in a different orientation, we could adjust
  // but for now, we stick to the most common "upright" triangle for simplicity.

  const sides = [
    { a: p1, b: p2 },
    { a: p2, b: p3 },
    { a: p3, b: p1 }
  ];

  let totalDistance = 0;
  points.forEach(p => {
    let minSideDist = Infinity;
    sides.forEach(side => {
      minSideDist = Math.min(minSideDist, distanceToSegment(p, side.a, side.b));
    });
    totalDistance += minSideDist;
  });

  const avgDistance = totalDistance / points.length;
  const diagonal = Math.sqrt(width * width + height * height);
  // Stricter denominator for triangle
  const similarity = Math.max(0, 1 - (avgDistance / (diagonal * 0.15)));

  if (similarity >= threshold) {
    return [p1, p2, p3, p1];
  }
  return null;
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
