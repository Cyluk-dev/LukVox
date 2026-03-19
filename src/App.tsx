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
import { type Point, type Stroke,type Tool } from './types'
import { 
  checkStrokeHit, 
  getBoundingBox, 
  getRotateHandlePos, 
  getHandleAt,
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
     scaleY?: number
   } | null>(null)

  const lastMousePos = useRef({ x: 0, y: 0 })

  // Convert screen coordinates to whiteboard coordinates
  const toWorld = (x: number, y: number) => ({
    x: (x - offset.x) / scale,
    y: (y - offset.y) / scale
  })

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
              if (handle) {
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
              if (isDoubleClick && selectedStroke.type === 'text') {
            setTextInput({
              x: selectedStroke.points[0].x,
              y: selectedStroke.points[0].y,
              value: selectedStroke.text || '',
              isEditing: true,
              fontSize: selectedStroke.fontSize || (selectedStroke.width * 12),
              color: selectedStroke.color,
              isBold: !!selectedStroke.isBold,
              isItalic: !!selectedStroke.isItalic,
              editingId: selectedStroke.id,
              angle: selectedStroke.angle || 0,
              scaleX: selectedStroke.scaleX || 1,
              scaleY: selectedStroke.scaleY || 1
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
          if (isDoubleClick && hitStroke.type === 'text') {
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
              scaleY: hitStroke.scaleY || 1
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
      } else if (activeTool === 'arrow') {
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
          fontSize: sizeMap[activeFontSize],
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
      } else if (activeTool === 'arrow' && arrowStart) {
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
      if (activeTool === 'pencil' || activeTool === 'arrow' || activeTool === 'text') {
        setStrokes(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          points: currentStroke,
          color: activeColor,
          opacity: activeOpacity,
          width: baseStrokeWidth,
          thinning: thinning,
          type: activeTool as 'pencil' | 'arrow' | 'text',
          text: activeTool === 'text' ? (textInput?.value || '') : undefined,
          fontSize: activeTool === 'text' ? (textInput?.fontSize || sizeMap[activeFontSize]) : undefined,
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
  }, [isDragging, currentStroke, activeTool, offset, scale, isDraggingStroke, dragOffset, selectedStrokeId, isResizingStroke, resizingHandle, initialResizingBox, initialStrokePoints, isRotatingStroke, initialRotationAngle, initialMouseAngle, textInput, activeColor, activeOpacity, activeFontSize, activeTextAlign, baseStrokeWidth, thinning, arrowStart])

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
    if (textInput && textInput.value.trim() && textInput.value !== 'toca para escribir...') {
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
          type: 'text',
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
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId ? { ...s, color: newColor } : s));
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setActiveOpacity(newOpacity);
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId ? { ...s, opacity: newOpacity } : s));
    }
  };

  const handleFontSizeChange = (newSize: 'S' | 'M' | 'L' | 'XL') => {
    setActiveFontSize(newSize);
    const sizeMap = { S: 14, M: 20, L: 32, XL: 48 };
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId && s.type === 'text' ? { ...s, fontSize: sizeMap[newSize] } : s));
    }
  };

  const handleTextAlignChange = (newAlign: 'left' | 'center' | 'right' | 'justify') => {
    setActiveTextAlign(newAlign);
    if (selectedStrokeId) {
      setStrokes(prev => prev.map(s => s.id === selectedStrokeId && s.type === 'text' ? { ...s, textAlign: newAlign as any } : s));
    }
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

      {/* Zoom and Settings Container Bottom-Left */}
      <div className="zoom-container">
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
              presets={presets}
              onSavePreset={handleSavePreset}
              onResetToDefaults={handleResetToDefaults}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        )}
        <div className="zoom-controls-row">
          <button 
            className={`settings-toggle-btn ${showStrokeSettings ? 'active' : ''}`}
            onClick={() => setShowStrokeSettings(!showStrokeSettings)}
          >
            Ajustes
          </button>
          {showMinimap ? (
            <MinimapPanel 
              scale={scale} 
              setScale={setScale} 
              baseGridSize={baseGridSize}
              setBaseGridSize={setBaseGridSize}
              onClose={() => setShowMinimap(false)} 
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
      </div>

      {textInput && (
        <div 
          style={{
            position: 'absolute',
            left: textInput.x * scale + offset.x,
            top: textInput.y * scale + offset.y,
            zIndex: 1001,
            pointerEvents: 'auto'
          }}
        >
          <textarea
            className="whiteboard-text-input-direct"
            autoFocus
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value, isEditing: true })}
            onBlur={handleTextSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setTextInput(null);
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
                setActiveTool('select'); 
              }
            }}
            style={{
              fontSize: `${textInput.fontSize * scale}px`,
              color: textInput.color,
              opacity: textInput.opacity !== undefined ? textInput.opacity : activeOpacity,
              fontFamily: '"Shantell Sans", cursive',
              fontWeight: textInput.isBold ? 'bold' : 'normal',
              fontStyle: textInput.isItalic ? 'italic' : 'normal',
              textAlign: textInput.textAlign as any || 'left',
              minWidth: '10px',
              minHeight: '1.2em',
              transform: `rotate(${textInput.angle || 0}rad) scale(${textInput.scaleX || 1}, ${textInput.scaleY || 1})`,
              transformOrigin: 'top left'
            }}
          />
        </div>
      )}

      <Toolbar 
        showShapes={showShapes} 
        setShowShapes={setShowShapes} 
        activeTool={activeTool}
        setActiveTool={(tool) => {
          setActiveTool(tool);
          if (tool === 'pencil' || tool === 'arrow' || tool === 'text') {
            setSelectedStrokeId(null);
          }
        }}
      />

      <StylePanel 
        color={activeColor}
        onColorChange={handleColorChange}
        opacity={activeOpacity}
        onOpacityChange={handleOpacityChange}
        fontSize={activeFontSize}
        onFontSizeChange={handleFontSizeChange}
        textAlign={activeTextAlign}
        onTextAlignChange={handleTextAlignChange}
      />

      {showPopup && <OnboardingPopup onClose={() => setShowPopup(false)} />}
    </div>
  )
}

export default App
