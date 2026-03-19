import { useState, useRef, useEffect } from 'react'
import './App.css'
import ZoomIndicator from './components/molecules/ZoomIndicator'
import MinimapPanel from './components/organisms/MinimapPanel'
import Toolbar from './components/organisms/Toolbar'
import OnboardingPopup from './components/organisms/OnboardingPopup'
import WhiteboardCanvas from './components/organisms/WhiteboardCanvas'
import GridSettings from './components/molecules/GridSettings'
import StrokeSettings from './components/molecules/StrokeSettings'
import StylePanel from './components/molecules/StylePanel'
import TextEditorPopup from './components/molecules/TextEditorPopup'
import { type Point, type Stroke, type Tool } from './types'
import { 
  checkStrokeHit, 
  getBoundingBox, 
  getRotateHandlePos, 
  getHandleAt,
  detectRectangle,
  detectCircle,
  detectTriangle,
  generateArrowPoints
} from './utils/whiteboardUtils'

interface StrokePreset {
  id: string;
  width: number;
  thinning: number;
}

const sizeMap = { S: 14, M: 20, L: 32, XL: 48 };

function App() {
  console.log('App rendering...');
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [baseGridSize, setBaseGridSize] = useState(20)
  const [baseStrokeWidth, setBaseStrokeWidth] = useState(2)
  const [thinning, setThinning] = useState(0.8)
  const [presets, setPresets] = useState<StrokePreset[]>([])
  const [showStrokeSettings, setShowStrokeSettings] = useState(false)
  const [isSmartShapeEnabled, setIsSmartShapeEnabled] = useState(false)
  const [enabledShapes, setEnabledShapes] = useState<('rectangle' | 'circle' | 'triangle')[]>([])
  const [shapeThresholds, setShapeThresholds] = useState({
    rectangle: 0.6,
    circle: 0.6,
    triangle: 0.6
  })
  
  // New style states
  const [activeColor, setActiveColor] = useState('#1e1e1e')
  const [activeOpacity, setActiveOpacity] = useState(1)
  const [activeFontSize, setActiveFontSize] = useState<'S' | 'M' | 'L' | 'XL'>('M')
  const [activeTextAlign, setActiveTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left')
  const [isDragging, setIsDragging] = useState(false)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[] | null>(null)
  
  const [showShapes, setShowShapes] = useState(false)
  const [showMinimap, setShowMinimap] = useState(false)
  const [showPopup, setShowPopup] = useState(true)
  const [isEditingZoom, setIsEditingZoom] = useState(false)
  const [zoomInput, setZoomInput] = useState('')
  
  // Selection and transformation state
  const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDraggingStroke, setIsDraggingStroke] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null)
  const [isResizingStroke, setIsResizingStroke] = useState(false)
  const [resizingHandle, setResizingHandle] = useState<string | null>(null)
  const [initialResizingBox, setInitialResizingBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null)
  const [initialStrokePoints, setInitialStrokePoints] = useState<Point[] | null>(null)
  
  const [isRotatingStroke, setIsRotatingStroke] = useState(false)
  const [initialRotationAngle, setInitialRotationAngle] = useState(0)
  const [initialMouseAngle, setInitialMouseAngle] = useState(0)
  
  const [arrowStart, setArrowStart] = useState<Point | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  
  const [showProjectMenu, setShowProjectMenu] = useState(false)

  const [textInput, setTextInput] = useState<{ 
     x: number, 
     y: number, 
     value: string, 
     isEditing: boolean,
     fontSize: number,
     color: string,
     isBold: boolean,
     isItalic: boolean,
     textAlign?: string,
     opacity?: number,
     editingId?: string,
     angle?: number,
     scaleX?: number,
     scaleY?: number,
     type?: 'text' | 'note'
   } | null>(null)

  const lastMousePos = useRef({ x: 0, y: 0 })

  // Convert screen coordinates to whiteboard coordinates
  const toWorld = (x: number, y: number) => ({
    x: (x - offset.x) / scale,
    y: (y - offset.y) / scale
  })

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const center = toWorld(window.innerWidth / 2, window.innerHeight / 2)
        const id = Math.random().toString(36).substr(2, 9)
        const maxWidth = 400
        const scale = img.width > maxWidth ? maxWidth / img.width : 1
        
        setStrokes(prev => [...prev, {
          id,
          type: 'image',
          points: [center],
          imageUrl: url,
          imageWidth: img.width * scale,
          imageHeight: img.height * scale,
          color: '#000000',
          width: 1,
          thinning: 0,
          opacity: 1,
          angle: 0
        }])
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const createStickyNoteAtCenter = () => {
     const center = toWorld(window.innerWidth / 2, window.innerHeight / 2)
     const id = Math.random().toString(36).substr(2, 9)
     
     setStrokes(prev => [...prev, {
       id,
       type: 'note',
       points: [center],
       text: 'Nota...',
       color: '#ff9d00', // Orange color
       width: 1,
       thinning: 0,
       opacity: 1,
       angle: 0,
       scaleX: 1,
       scaleY: 1
     }])
   }
 
   const handleExportLukvox = () => {
     const projectData = {
       strokes,
       baseGridSize,
       enabledShapes,
       shapeThresholds,
       version: '1.0.0'
     };
     const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `project-${new Date().toISOString().split('T')[0]}.lukvox`;
     a.click();
     URL.revokeObjectURL(url);
     setShowProjectMenu(false);
   };

   const triggerImportLukvox = () => {
     if (importInputRef.current) {
       importInputRef.current.click();
     }
     setShowProjectMenu(false);
   };

   const handleImportLukvox = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     const reader = new FileReader();
     reader.onload = (event) => {
       try {
         const data = JSON.parse(event.target?.result as string);
         if (data.strokes) setStrokes(data.strokes);
         if (data.baseGridSize) setBaseGridSize(data.baseGridSize);
         if (data.enabledShapes) setEnabledShapes(data.enabledShapes);
         if (data.shapeThresholds) setShapeThresholds(data.shapeThresholds);
       } catch (err) {
         console.error('Error al importar el archivo .lukvox', err);
         alert('Error al importar el archivo .lukvox');
       }
     };
     reader.readAsText(file);
   };

   const handleMouseDown = (e: React.MouseEvent) => {
    const isMiddleClick = e.button === 1
    const isLeftClick = e.button === 0
    const worldPos = toWorld(e.clientX, e.clientY)

    if (isMiddleClick || (activeTool === 'hand' && isLeftClick)) {
      e.preventDefault()
      setIsDragging(true)
      lastMousePos.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (isLeftClick) {
      if (activeTool === 'select') {
        // Double click detection
        const now = Date.now();
        const lastClick = (window as any).lastClickTime || 0;
        (window as any).lastClickTime = now;
        const isDoubleClick = now - lastClick < 300;

        // First check if clicking on a resize handle or rotate handle
        if (selectedStrokeId) {
          const selectedStroke = strokes.find(s => s.id === selectedStrokeId)
          if (selectedStroke) {
            const box = getBoundingBox(selectedStroke)
            if (box) {
              // Check rotation handle
              const rotHandle = getRotateHandlePos(box, scale)
              const distToRot = Math.sqrt(Math.pow(worldPos.x - rotHandle.x, 2) + Math.pow(worldPos.y - rotHandle.y, 2))
              if (distToRot < 15 / scale) {
                setIsRotatingStroke(true)
                const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
                setInitialMouseAngle(Math.atan2(worldPos.y - center.y, worldPos.x - center.x))
                setInitialRotationAngle(selectedStroke.angle || 0)
                return
              }

              // Check resize handles
              const handle = getHandleAt(worldPos, box, scale)
              if (handle && selectedStroke.type !== 'note') {
                setIsResizingStroke(true)
                setResizingHandle(handle)
                setDragStartPos(worldPos)
                setInitialResizingBox(box)
                // Capture initial scales for precise deformation
                setInitialStrokePoints(selectedStroke.points.map(p => ({
                  ...p,
                  scaleX: selectedStroke.scaleX || 1,
                  scaleY: selectedStroke.scaleY || 1
                } as any)))
                return
              }
            }
          }
        }

        // Then check if clicking on the currently selected stroke for dragging
        if (selectedStrokeId) {
          const selectedStroke = strokes.find(s => s.id === selectedStrokeId)
          if (selectedStroke) {
            const hit = checkStrokeHit(worldPos, selectedStroke, scale)
            if (hit) {
              if (isDoubleClick && (selectedStroke.type === 'text' || selectedStroke.type === 'note')) {
            setTextInput({
              x: selectedStroke.points[0].x,
              y: selectedStroke.points[0].y,
              value: selectedStroke.text || '',
              isEditing: true,
              fontSize: selectedStroke.fontSize || (selectedStroke.width * 12),
              color: selectedStroke.color,
              isBold: !!selectedStroke.isBold,
              isItalic: !!selectedStroke.isItalic,
              textAlign: selectedStroke.textAlign,
              opacity: selectedStroke.opacity,
              editingId: selectedStroke.id,
              angle: selectedStroke.angle || 0,
              scaleX: selectedStroke.scaleX || 1,
              scaleY: selectedStroke.scaleY || 1,
              type: selectedStroke.type as 'text' | 'note'
            })
            setSelectedStrokeId(null)
            return
          }
              setIsDraggingStroke(true)
              setDragStartPos(worldPos)
              setDragOffset({ x: 0, y: 0 })
              return
            }
          }
        }

        // Otherwise check all strokes to select a new one
        const hitStroke = [...strokes].reverse().find(stroke => checkStrokeHit(worldPos, stroke, scale))
        if (hitStroke) {
          if (isDoubleClick && (hitStroke.type === 'text' || hitStroke.type === 'note')) {
            setTextInput({
              x: hitStroke.points[0].x,
              y: hitStroke.points[0].y,
              value: hitStroke.text || '',
              isEditing: true,
              fontSize: hitStroke.fontSize || (hitStroke.width * 12),
              color: hitStroke.color,
              isBold: !!hitStroke.isBold,
              isItalic: !!hitStroke.isItalic,
              textAlign: hitStroke.textAlign,
              opacity: hitStroke.opacity,
              editingId: hitStroke.id,
              angle: hitStroke.angle || 0,
              scaleX: hitStroke.scaleX || 1,
              scaleY: hitStroke.scaleY || 1,
              type: hitStroke.type as 'text' | 'note'
            })
            setSelectedStrokeId(null)
            return
          }
          setSelectedStrokeId(hitStroke.id)
          setIsDraggingStroke(true)
          setDragStartPos(worldPos)
          setDragOffset({ x: 0, y: 0 })
        } else {
          setSelectedStrokeId(null)
        }
      } else if (activeTool === 'pencil') {
        setCurrentStroke([{ ...worldPos, t: Date.now(), w: baseStrokeWidth * 4 }])
      } else if (activeTool === 'arrow' || activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle') {
        setArrowStart(worldPos)
        setCurrentStroke([{ ...worldPos }, { ...worldPos }])
      } else if (activeTool === 'text') {
        // If already editing, submit first
        if (textInput) {
          handleTextSubmit();
        }
        // Set new input immediately
        setTextInput({ 
          x: worldPos.x, 
          y: worldPos.y, 
          value: '', 
          isEditing: true,
          fontSize: sizeMap[activeFontSize as keyof typeof sizeMap],
          color: activeColor,
          isBold: false,
          isItalic: false,
          textAlign: activeTextAlign,
          opacity: activeOpacity,
          scaleX: 1,
          scaleY: 1,
          angle: 0
        })
      } else if (activeTool === 'eraser') {
        eraseStrokeAt(worldPos)
      }
    }
  }

  const eraseStrokeAt = (pos: Point) => {
    setStrokes(prev => prev.map(stroke => {
      if (checkStrokeHit(pos, stroke, scale)) {
        return { ...stroke, isMarkedForDeletion: true }
      }
      return stroke
    }))
  }

  const snapToGrid = (val: number) => Math.round(val / baseGridSize) * baseGridSize;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastMousePos.current.x
        const dy = e.clientY - lastMousePos.current.y
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        lastMousePos.current = { x: e.clientX, y: e.clientY }
        return
      }

      const worldPos = toWorld(e.clientX, e.clientY)

      if (isDraggingStroke && dragStartPos) {
        setDragOffset({
          x: worldPos.x - dragStartPos.x,
          y: worldPos.y - dragStartPos.y
        })
        return
      }

      if (isResizingStroke && dragStartPos && initialResizingBox && selectedStrokeId && initialStrokePoints) {
        const dx = worldPos.x - dragStartPos.x
        const dy = worldPos.y - dragStartPos.y
        
        setStrokes(prev => prev.map(s => {
          if (s.id === selectedStrokeId) {
            let newBox = { ...initialResizingBox }
            
            if (resizingHandle?.includes('e')) newBox.width += dx
            if (resizingHandle?.includes('w')) {
              newBox.x += dx
              newBox.width -= dx
            }
            if (resizingHandle?.includes('s')) newBox.height += dy
            if (resizingHandle?.includes('n')) {
              newBox.y += dy
              newBox.height -= dy
            }

            if (newBox.width < 5) newBox.width = 5
            if (newBox.height < 5) newBox.height = 5

            const scaleX = newBox.width / initialResizingBox.width
            const scaleY = newBox.height / initialResizingBox.height

            if (s.type === 'text') {
              return {
                ...s,
                points: [{ x: newBox.x, y: newBox.y }],
                scaleX: (initialStrokePoints[0] as any).scaleX ? (initialStrokePoints[0] as any).scaleX * scaleX : scaleX,
                scaleY: (initialStrokePoints[0] as any).scaleY ? (initialStrokePoints[0] as any).scaleY * scaleY : scaleY
              }
            }

            return {
              ...s,
              points: initialStrokePoints.map(p => ({
                ...p,
                x: newBox.x + (p.x - initialResizingBox.x) * scaleX,
                y: newBox.y + (p.y - initialResizingBox.y) * scaleY
              }))
            }
          }
          return s
        }))
        return
      }

      if (isRotatingStroke && selectedStrokeId) {
        const selectedStroke = strokes.find(s => s.id === selectedStrokeId)
        if (selectedStroke) {
          const box = getBoundingBox(selectedStroke)
          if (box) {
            const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
            const currentMouseAngle = Math.atan2(worldPos.y - center.y, worldPos.x - center.x)
            const angleDiff = currentMouseAngle - initialMouseAngle
            
            setStrokes(prev => prev.map(s => {
              if (s.id === selectedStrokeId) {
                return { ...s, angle: initialRotationAngle + angleDiff }
              }
              return s
            }))
          }
        }
        return
      }

      if (currentStroke && activeTool === 'pencil') {
        const lastPoint = currentStroke[currentStroke.length - 1]
        const t = Date.now()
        const dist = Math.sqrt(Math.pow(worldPos.x - lastPoint.x, 2) + Math.pow(worldPos.y - lastPoint.y, 2))
        
        // Add point only if it moved enough (avoiding micro-jitter)
        if (dist > 1.5) {
          const dt = t - (lastPoint.t || t)
          const velocity = dt > 0 ? dist / dt : 0
          
          // Dynamic width based on velocity (thinner when faster - ink behavior)
          const baseW = baseStrokeWidth * 5 // Thicker when slow, relative to base
          const targetW = Math.max(baseStrokeWidth, Math.min(baseW, baseW - velocity * 4))
          
          // Responsive width transition
          const w = lastPoint.w ? lastPoint.w + (targetW - lastPoint.w) * 0.4 : targetW
          
          setCurrentStroke(prev => prev ? [...prev, { ...worldPos, t, w }] : [{ ...worldPos, t, w }])
        }
      } else if ((activeTool === 'arrow' || activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle') && arrowStart) {
        setCurrentStroke([arrowStart, worldPos])
      } else if (activeTool === 'eraser' && (e.buttons & 1)) {
        eraseStrokeAt(worldPos)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || activeTool === 'hand') {
        setIsDragging(false)
      }
      
      if (isDraggingStroke && selectedStrokeId && (dragOffset.x !== 0 || dragOffset.y !== 0)) {
        setStrokes(prev => prev.map(s => {
          if (s.id === selectedStrokeId) {
            return {
              ...s,
              points: s.points.map(p => ({
                ...p,
                x: p.x + dragOffset.x,
                y: p.y + dragOffset.y
              }))
            }
          }
          return s
        }))
      }
      
      setIsDraggingStroke(false)
      setDragStartPos(null)
      setDragOffset({ x: 0, y: 0 })
      
      if (currentStroke) {
        if (activeTool === 'pencil' || activeTool === 'arrow' || activeTool === 'text' || activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle') {
          let pointsToSave = currentStroke;
          let typeToSave: 'pencil' | 'arrow' | 'text' | 'rectangle' | 'circle' | 'triangle' = activeTool as any;

          if (activeTool === 'pencil' && isSmartShapeEnabled) {
            const detectedRect = enabledShapes.includes('rectangle') ? detectRectangle(currentStroke, shapeThresholds.rectangle) : null;
            const detectedCircle = enabledShapes.includes('circle') ? detectCircle(currentStroke, shapeThresholds.circle) : null;
            const detectedTriangle = enabledShapes.includes('triangle') ? detectTriangle(currentStroke, shapeThresholds.triangle) : null;

            if (detectedRect) {
              typeToSave = 'rectangle';
              pointsToSave = detectedRect.map(p => ({ x: snapToGrid(p.x), y: snapToGrid(p.y) }));
            } else if (detectedCircle) {
              typeToSave = 'circle';
              const snappedCenter = { x: snapToGrid(detectedCircle[0].x), y: snapToGrid(detectedCircle[0].y) };
              const rawRadius = Math.sqrt(Math.pow(detectedCircle[1].x - detectedCircle[0].x, 2) + Math.pow(detectedCircle[1].y - detectedCircle[0].y, 2));
              const snappedRadius = Math.max(baseGridSize, snapToGrid(rawRadius));
              pointsToSave = [
                snappedCenter,
                { x: snappedCenter.x + snappedRadius, y: snappedCenter.y }
              ];
            } else if (detectedTriangle) {
              typeToSave = 'triangle';
              pointsToSave = detectedTriangle.map(p => ({ x: snapToGrid(p.x), y: snapToGrid(p.y) }));
            }
          } else if (activeTool === 'rectangle' && arrowStart) {
            const start = { x: snapToGrid(arrowStart.x), y: snapToGrid(arrowStart.y) };
            const end = { x: snapToGrid(currentStroke[1].x), y: snapToGrid(currentStroke[1].y) };
            pointsToSave = [
              { x: start.x, y: start.y },
              { x: end.x, y: start.y },
              { x: end.x, y: end.y },
              { x: start.x, y: end.y },
              { x: start.x, y: start.y }
            ];
          } else if (activeTool === 'circle' && arrowStart) {
            const center = { x: snapToGrid(arrowStart.x), y: snapToGrid(arrowStart.y) };
            const radiusPoint = { x: snapToGrid(currentStroke[1].x), y: snapToGrid(currentStroke[1].y) };
            const radius = Math.sqrt(Math.pow(radiusPoint.x - center.x, 2) + Math.pow(radiusPoint.y - center.y, 2));
            pointsToSave = [
              center,
              { x: center.x + radius, y: center.y }
            ];
          } else if (activeTool === 'triangle' && arrowStart) {
            const start = { x: snapToGrid(arrowStart.x), y: snapToGrid(arrowStart.y) };
            const end = { x: snapToGrid(currentStroke[1].x), y: snapToGrid(currentStroke[1].y) };
            pointsToSave = [
              { x: start.x + (end.x - start.x) / 2, y: start.y },
              { x: end.x, y: end.y },
              { x: start.x, y: end.y },
              { x: start.x + (end.x - start.x) / 2, y: start.y }
            ];
          } else if (activeTool === 'arrow' && arrowStart) {
            pointsToSave = [
              { x: snapToGrid(arrowStart.x), y: snapToGrid(arrowStart.y) },
              { x: snapToGrid(currentStroke[1].x), y: snapToGrid(currentStroke[1].y) }
            ];
            pointsToSave = generateArrowPoints(pointsToSave[0], pointsToSave[1], baseStrokeWidth);
          }

          setStrokes(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            points: pointsToSave,
            color: activeColor,
            opacity: activeOpacity,
            width: baseStrokeWidth,
            thinning: thinning,
            type: typeToSave,
            text: activeTool === 'text' ? (textInput?.value || '') : undefined,
            fontSize: activeTool === 'text' ? (textInput?.fontSize || sizeMap[activeFontSize as keyof typeof sizeMap]) : undefined,
            isBold: textInput?.isBold,
            isItalic: textInput?.isItalic,
            textAlign: activeTextAlign as any,
            scaleX: textInput?.scaleX || 1,
            scaleY: textInput?.scaleY || 1,
            angle: textInput?.angle || 0
          }])
          setCurrentStroke(null)
          setArrowStart(null)
          setTextInput(null)
        }
      }

      if (activeTool === 'eraser') {
        setStrokes(prev => prev.filter(stroke => !stroke.isMarkedForDeletion))
      }

      if (isResizingStroke) {
        setIsResizingStroke(false)
        setResizingHandle(null)
        setInitialResizingBox(null)
        setInitialStrokePoints(null)
      }

      if (isRotatingStroke) {
        setIsRotatingStroke(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, currentStroke, activeTool, offset, scale, isDraggingStroke, dragOffset, selectedStrokeId, isResizingStroke, resizingHandle, initialResizingBox, initialStrokePoints, isRotatingStroke, initialRotationAngle, initialMouseAngle, textInput, activeColor, activeOpacity, activeFontSize, activeTextAlign, baseStrokeWidth, thinning, arrowStart, isSmartShapeEnabled, baseGridSize])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomSpeed = 0.001
      const delta = -e.deltaY
      const newScale = scale * Math.exp(delta * zoomSpeed)
      const mouseX = e.clientX
      const mouseY = e.clientY
      const zoomFactor = newScale / scale
      
      setOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * zoomFactor,
        y: mouseY - (mouseY - prev.y) * zoomFactor
      }))
      
      setScale(newScale)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [scale])

  const handleSavePreset = () => {
    if (presets.length < 20) {
      setPresets(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        width: baseStrokeWidth,
        thinning: thinning
      }])
    }
  }

  const handleResetToDefaults = () => {
    setBaseStrokeWidth(2)
    setThinning(0.8)
  }

  const handleApplyPreset = (preset: StrokePreset) => {
    setBaseStrokeWidth(preset.width)
    setThinning(preset.thinning)
  }

  const handleTextSubmit = () => {
    if (textInput && textInput.value.trim()) {
      if (textInput.editingId) {
        // Update existing
        setStrokes(prev => prev.map(s => s.id === textInput.editingId ? {
          ...s,
          points: [{ x: textInput.x, y: textInput.y }],
          color: textInput.color,
          text: textInput.value,
          fontSize: textInput.fontSize,
          isBold: textInput.isBold,
          isItalic: textInput.isItalic,
          textAlign: textInput.textAlign as any || activeTextAlign,
          opacity: textInput.opacity !== undefined ? textInput.opacity : activeOpacity,
          // Use scales from textInput if available (preserving deformation)
          scaleX: textInput.scaleX !== undefined ? textInput.scaleX : (s.scaleX || 1),
          scaleY: textInput.scaleY !== undefined ? textInput.scaleY : (s.scaleY || 1),
          angle: textInput.angle !== undefined ? textInput.angle : (s.angle || 0)
        } : s))
      } else {
        // Create new
        setStrokes(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          points: [{ x: textInput.x, y: textInput.y }],
          color: textInput.color,
          width: baseStrokeWidth,
          thinning: thinning,
          type: textInput.type || 'text',
          text: textInput.value,
          fontSize: textInput.fontSize,
          isBold: textInput.isBold,
          isItalic: textInput.isItalic,
          textAlign: textInput.textAlign as any || activeTextAlign,
          opacity: textInput.opacity !== undefined ? textInput.opacity : activeOpacity,
          scaleX: 1,
          scaleY: 1,
          angle: 0
        }])
      }
    }
    setTextInput(null)
  }

  const handleColorChange = (newColor: string) => {
    setActiveColor(newColor);
    if (textInput) {
      setTextInput({ ...textInput, color: newColor });
    }
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId ? { ...s, color: newColor } : s));
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setActiveOpacity(newOpacity);
    if (textInput) {
      setTextInput({ ...textInput, opacity: newOpacity });
    }
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId ? { ...s, opacity: newOpacity } : s));
    }
  };

  const handleFontSizeChange = (newSize: 'S' | 'M' | 'L' | 'XL') => {
    setActiveFontSize(newSize);
    const sizeMap = { S: 14, M: 20, L: 32, XL: 48 };
    if (textInput) {
      setTextInput({ ...textInput, fontSize: sizeMap[newSize] });
    }
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId && s.type === 'text' ? { ...s, fontSize: sizeMap[newSize] } : s));
    }
  };

  const handleTextAlignChange = (newAlign: 'left' | 'center' | 'right' | 'justify') => {
    setActiveTextAlign(newAlign);
    if (textInput) {
      setTextInput({ ...textInput, textAlign: newAlign });
    }
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId && s.type === 'text' ? { ...s, textAlign: newAlign } : s));
    }
  };

  const handleThresholdChange = (shape: 'rectangle' | 'circle' | 'triangle', value: number) => {
    setShapeThresholds(prev => ({ ...prev, [shape]: value }));
  };

  const currentGridSize = (baseGridSize || 20) * (scale || 1)
  const isGridHidden = currentGridSize <= 4

  const handleZoomEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingZoom(true)
    setZoomInput((scale * 100).toFixed(0))
  }

  const handleZoomInputBlur = () => {
    setIsEditingZoom(false)
    const newScale = parseFloat(zoomInput) / 100
    if (!isNaN(newScale) && newScale > 0) {
      setScale(newScale)
    }
  }

  const handleZoomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleZoomInputBlur()
    } else if (e.key === 'Escape') {
      setIsEditingZoom(false)
    }
  }

  const selectedStroke = strokes.find(s => s.id === selectedStrokeId);
  const isTextSelected = activeTool === 'text' || (selectedStroke?.type === 'text');

  // Update active style states when selected stroke changes
  useEffect(() => {
    if (selectedStroke) {
      if (selectedStroke.color) setActiveColor(selectedStroke.color);
      if (selectedStroke.opacity !== undefined) setActiveOpacity(selectedStroke.opacity);
      if (selectedStroke.type === 'text' && selectedStroke.fontSize) {
        // Find closest size in sizeMap
        const sizeEntry = (Object.entries(sizeMap) as [keyof typeof sizeMap, number][]).find(
          ([_, val]) => val === selectedStroke.fontSize
        );
        if (sizeEntry) setActiveFontSize(sizeEntry[0]);
        if (selectedStroke.textAlign) setActiveTextAlign(selectedStroke.textAlign as any);
      }
    }
  }, [selectedStrokeId]);

  return (
    <div 
      className="whiteboard" 
      onMouseDown={handleMouseDown}
      style={{ 
        backgroundPosition: `${offset.x}px ${offset.y}px`,
        '--grid-size': `${currentGridSize}px`,
        '--grid-opacity': isGridHidden ? 0 : 1,
        cursor: isDragging ? 'grabbing' : (activeTool === 'pencil' || activeTool === 'arrow') ? 'crosshair' : activeTool === 'text' ? 'text' : activeTool === 'eraser' ? 'cell' : 'default'
      } as React.CSSProperties}
    >
      <div className="project-header" onMouseDown={(e) => e.stopPropagation()}>
        <div className="brand">LukVox</div>
        <div className="project-menu-container">
          <button 
            className={`project-menu-trigger ${showProjectMenu ? 'active' : ''}`}
            onClick={() => setShowProjectMenu(!showProjectMenu)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {showProjectMenu && (
            <div className="project-menu">
              <div className="menu-item" onClick={triggerImportLukvox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Abrir archivo .lukvox
              </div>
              <div className="menu-item" onClick={handleExportLukvox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Guardar como .lukvox
              </div>
              <div className="menu-divider" />
              <div className="menu-item" onClick={handleExportLukvox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Exportar proyecto
              </div>
            </div>
          )}
        </div>
      </div>

      <WhiteboardCanvas 
        strokes={strokes.filter(s => s.id !== textInput?.editingId)}
        currentStroke={currentStroke}
        offset={offset}
        scale={scale}
        selectedStrokeId={selectedStrokeId}
        isDraggingStroke={isDraggingStroke}
        dragOffset={dragOffset}
        baseStrokeWidth={baseStrokeWidth}
        thinning={thinning}
        activeTool={activeTool}
        activeColor={activeColor}
        activeOpacity={activeOpacity}
      />

      {/* Zoom / Project Map Container Bottom-Left */}
      <div className="zoom-left-container">
        {showMinimap ? (
          <MinimapPanel 
            scale={scale} 
            setScale={setScale} 
            baseGridSize={baseGridSize}
            setBaseGridSize={setBaseGridSize}
            onClose={() => setShowMinimap(false)} 
            strokes={strokes}
            offset={offset}
            setOffset={setOffset}
          />
        ) : (
          <ZoomIndicator 
            scale={scale} 
            onClick={() => setShowMinimap(true)} 
            onEditClick={handleZoomEditClick}
            isEditing={isEditingZoom}
            zoomInput={zoomInput}
            onZoomInputChange={setZoomInput}
            onZoomInputBlur={handleZoomInputBlur}
            onZoomInputKeyDown={handleZoomInputKeyDown}
          />
        )}
      </div>

      {/* Settings Container Bottom-Right */}
      <div className="settings-right-container">
        {showStrokeSettings && (
          <div className="settings-popup-wrapper">
            <div className="settings-popup-header">
              <span>Ajustes</span>
              <button className="close-btn" onClick={() => setShowStrokeSettings(false)}>×</button>
            </div>
            <StrokeSettings 
              baseStrokeWidth={baseStrokeWidth}
              setBaseStrokeWidth={setBaseStrokeWidth}
              thinning={thinning}
              setThinning={setThinning}
              enabledShapes={enabledShapes}
              shapeThresholds={shapeThresholds}
              onThresholdChange={handleThresholdChange}
              presets={presets}
              onSavePreset={handleSavePreset}
              onResetToDefaults={handleResetToDefaults}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        )}
        <button 
          className={`settings-toggle-btn ${showStrokeSettings ? 'active' : ''}`}
          onClick={() => setShowStrokeSettings(!showStrokeSettings)}
        >
          Ajustes
        </button>
      </div>

      {textInput && (
        <TextEditorPopup
          value={textInput.value}
          onChange={(val) => setTextInput({ ...textInput, value: val, isEditing: true })}
          onConfirm={() => {
            handleTextSubmit();
            setActiveTool('select');
          }}
          onCancel={() => setTextInput(null)}
          color={textInput.color}
          fontSize={textInput.fontSize}
          isBold={textInput.isBold}
          onBoldChange={(bold) => setTextInput({ ...textInput, isBold: bold })}
          isItalic={textInput.isItalic}
          onItalicChange={(italic) => setTextInput({ ...textInput, isItalic: italic })}
          textAlign={(textInput.textAlign as any) || 'left'}
          onTextAlignChange={(align) => setTextInput({ ...textInput, textAlign: align })}
          activeFontSize={activeFontSize}
          onFontSizeChange={handleFontSizeChange}
          type={textInput.type}
        />
      )}

      <Toolbar 
        showShapes={showShapes} 
        setShowShapes={setShowShapes} 
        activeTool={activeTool}
        setActiveTool={(tool) => {
          if (tool === 'note') {
            createStickyNoteAtCenter();
            setActiveTool('select');
            return;
          }
          if (tool === 'image') {
            triggerImageUpload();
            setActiveTool('select');
            return;
          }
          setActiveTool(tool);
          if (tool === 'pencil' || tool === 'arrow' || tool === 'text') {
            setSelectedStrokeId(null);
          }
        }}
        isSmartShapeEnabled={isSmartShapeEnabled}
        setIsSmartShapeEnabled={setIsSmartShapeEnabled}
        enabledShapes={enabledShapes}
      />

      <StylePanel 
        color={activeColor}
        onColorChange={handleColorChange}
        opacity={activeOpacity}
        onOpacityChange={handleOpacityChange}
      />

      {showPopup && (
        <OnboardingPopup 
          onClose={(shapes) => {
            setEnabledShapes(shapes);
            setShowPopup(false);
          }} 
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg, image/webp, image/avif"
        onChange={handleImageFileChange}
      />

      <input 
        type="file" 
        ref={importInputRef} 
        style={{ display: 'none' }} 
        accept=".lukvox"
        onChange={handleImportLukvox}
      />
    </div>
  )
}

export default App
