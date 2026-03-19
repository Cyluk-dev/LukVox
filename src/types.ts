export type Tool = 'select' | 'hand' | 'pencil' | 'eraser' | 'arrow' | 'text' | 'note' | 'image';

export type Point = {
  x: number;
  y: number;
  t?: number; // timestamp
  w?: number; // dynamic width
};

export type Stroke = {
  id: string;
  points: Point[];
  color: string;
  opacity?: number; // Added opacity
  width: number;
  thinning: number; // Individual pressure sensitivity
  type?: 'pencil' | 'arrow' | 'text'; // Drawing type
  text?: string; // For text elements
  fontSize?: number;
  scaleX?: number; // For text deformation
  scaleY?: number; // For text deformation
  isBold?: boolean;
  isItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right'; // Added alignment
  isMarkedForDeletion?: boolean;
  angle?: number; // rotation in radians
};
