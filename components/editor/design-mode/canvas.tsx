import { useRef, useState, useEffect } from "react";
import { DesignElement, ElementType } from "@/lib/types/editor-types";
import { v4 as uuidv4 } from "uuid";

interface CanvasProps {
  elements: DesignElement[];
  selectedElementId: string | null;
  zoom: number;
  showGrid: boolean;
  onSelectElement: (id: string | null) => void;
  onAddElement: (element: DesignElement) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onResizeElement: (id: string, width: number, height: number) => void;
}

// Define default properties for each element type
const getDefaultPropsForType = (type: ElementType): Record<string, unknown> => {
  switch (type) {
    case 'text':
      return { text: 'Text content' };
    case 'button':
      return { text: 'Button', backgroundColor: '#3b82f6', color: '#ffffff' };
    case 'input':
      return { placeholder: 'Enter text...', type: 'text' };
    case 'image':
      // Use SVG data URL instead of external URL to avoid fetch errors
      return { 
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">Image Placeholder</text></svg>', 
        alt: 'Image' 
      };
    case 'video':
      return { src: '', controls: true };
    case 'svg':
      return { src: '', alt: 'SVG Icon' };
    default:
      return {};
  }
};

// Define default styles for each element type
const getDefaultStyleForType = (type: ElementType): Record<string, unknown> => {
  switch (type) {
    case 'text':
      return { 
        fontFamily: 'Inter', 
        fontSize: 16, 
        fontWeight: 'normal', 
        textAlign: 'left',
        color: '#000000'
      };
    case 'button':
      return { 
        borderRadius: 4, 
        padding: 8
      };
    case 'container':
      return { 
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e2e8f0'
      };
    case 'vstack':
      return {
        flexDirection: 'column',
        gap: 8,
        padding: 8
      };
    case 'hstack':
      return {
        flexDirection: 'row',
        gap: 8,
        padding: 8
      };
    case 'zstack':
      return {
        position: 'relative'
      };
    default:
      return {};
  }
};

// Get default dimensions for each element type
const getDefaultDimensionsForType = (type: ElementType): { width: number; height: number } => {
  switch (type) {
    case 'container':
      return { width: 300, height: 200 };
    case 'text':
      return { width: 200, height: 40 };
    case 'button':
      return { width: 150, height: 40 };
    case 'input':
      return { width: 200, height: 40 };
    case 'image':
    case 'svg':
      return { width: 200, height: 150 };
    case 'video':
      return { width: 320, height: 240 };
    case 'vstack':
    case 'hstack':
    case 'zstack':
      return { width: 250, height: 250 };
    case 'grid':
      return { width: 300, height: 300 };
    case 'card':
      return { width: 250, height: 300 };
    case 'columns':
      return { width: 400, height: 200 };
    default:
      return { width: 150, height: 150 };
  }
};

export function Canvas({
  elements,
  selectedElementId,
  zoom,
  showGrid,
  onSelectElement,
  onAddElement,
  onMoveElement,
  onResizeElement
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Handle canvas click for deselection
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on any elements
    if (e.target === e.currentTarget) {
      onSelectElement(null);
    }
  };
  
  // Handle drag start on an element
  const handleElementMouseDown = (e: React.MouseEvent, element: DesignElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
    setIsDragging(true);
    
    // Calculate the offset from mouse position to element top-left corner
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Handle resize handle mouse down
  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    direction: string
  ) => {
    e.stopPropagation();
    onSelectElement(elementId);
    setIsResizing(true);
    setResizeDirection(direction);
  };
  
  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    if (isDragging && selectedElementId) {
      const x = (e.clientX - canvasRect.left - dragOffset.x) / (zoom / 100);
      const y = (e.clientY - canvasRect.top - dragOffset.y) / (zoom / 100);
      
      onMoveElement(selectedElementId, x, y);
    } else if (isResizing && selectedElementId && resizeDirection) {
      const element = elements.find(el => el.id === selectedElementId);
      if (!element) return;
      
      const width = element.width ?? element.size?.width ?? 0;
      const height = element.height ?? element.size?.height ?? 0;
      const x = element.x ?? element.position.x ?? 0;
      const y = element.y ?? element.position.y ?? 0;
      
      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;
      
      // Handle zoom level in the calculations
      const zoomScale = zoom / 100;
      
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(20, (e.clientX - canvasRect.left) / zoomScale - x);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(20, (e.clientY - canvasRect.top) / zoomScale - y);
      }
      if (resizeDirection.includes('w')) {
        const rawNewX = (e.clientX - canvasRect.left) / zoomScale;
        newWidth = Math.max(20, x + width - rawNewX);
        newX = rawNewX;
      }
      if (resizeDirection.includes('n')) {
        const rawNewY = (e.clientY - canvasRect.top) / zoomScale;
        newHeight = Math.max(20, y + height - rawNewY);
        newY = rawNewY;
      }
      
      if (newX !== x || newY !== y) {
        onMoveElement(selectedElementId, newX, newY);
      }
      
      onResizeElement(selectedElementId, newWidth, newHeight);
    }
  };
  
  // Handle mouse up to end dragging/resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };
  
  // Handle dropping new elements on the canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('component-type') as ElementType;
    if (!type) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate position adjusted for canvas bounds and zoom
    const x = (e.clientX - canvasRect.left) / (zoom / 100);
    const y = (e.clientY - canvasRect.top) / (zoom / 100);
    
    // Get default dimensions for this element type
    const { width, height } = getDefaultDimensionsForType(type);
    
    // Create the new element
    const newElement: DesignElement = {
      id: uuidv4(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      props: getDefaultPropsForType(type),
      style: getDefaultStyleForType(type),
      position: { x, y },
      size: { width, height },
      // Legacy properties for backward compatibility
      x,
      y,
      width,
      height,
    };
    
    onAddElement(newElement);
    onSelectElement(newElement.id);
  };
  
  // Handle drag over to allow dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);
  
  return (
    <div className="flex-1 overflow-auto relative">
      <div 
        className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900"
      >
        <div
          ref={canvasRef}
          className={`relative ${showGrid ? 'bg-grid' : 'bg-white dark:bg-black'}`}
          style={{
            width: '1200px',
            height: '800px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease-out'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Canvas indicator when dragging */}
          <div 
            className="absolute inset-0 border-2 border-dashed border-primary/40 pointer-events-none opacity-0 transition-opacity duration-200"
            style={{ 
              opacity: isDragging ? 0.5 : 0 
            }}
          />
          
          {elements.map(element => {
            const isSelected = element.id === selectedElementId;
            const x = element.x ?? element.position.x ?? 0;
            const y = element.y ?? element.position.y ?? 0;
            const width = element.width ?? element.size?.width ?? 100;
            const height = element.height ?? element.size?.height ?? 100;
            
            return (
              <div
                key={element.id}
                className={`absolute ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:ring-1 hover:ring-primary/50'} transition-shadow`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: element.style?.backgroundColor as string,
                  color: element.style?.color as string,
                  fontFamily: element.style?.fontFamily as string,
                  fontSize: `${element.style?.fontSize}px`,
                  fontWeight: element.style?.fontWeight as string,
                  textAlign: element.style?.textAlign as React.CSSProperties['textAlign'],
                  padding: element.style?.padding ? `${element.style.padding}px` : undefined,
                  borderRadius: element.style?.borderRadius ? `${element.style.borderRadius}px` : undefined,
                  borderWidth: element.style?.borderWidth ? `${element.style.borderWidth}px` : undefined,
                  borderStyle: element.style?.borderStyle as string,
                  borderColor: element.style?.borderColor as string,
                  display: element.visible === false ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'move',
                  userSelect: 'none',
                  zIndex: element.style?.zIndex as number || 0,
                  opacity: element.style?.opacity as number || 1,
                  boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.5), 0 2px 5px rgba(0, 0, 0, 0.1)' : undefined,
                  transition: 'box-shadow 0.15s ease'
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
              >
                {/* Small label showing element type when selected */}
                {isSelected && (
                  <div className="absolute -top-6 left-0 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                    {element.type}
                  </div>
                )}
                
                {/* Element content based on type */}
                {element.type === 'text' && <div className="w-full h-full flex items-center px-1">{String(element.props.text || '')}</div>}
                {element.type === 'button' && <button 
                  className="w-full h-full flex items-center justify-center rounded"
                  style={{ cursor: 'move' }} // Prevent actual button behavior during editing
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {String(element.props.text || '')}
                </button>}
                {element.type === 'input' && <input 
                  type="text" 
                  placeholder={element.props.placeholder as string} 
                  className="w-full h-full border px-2 rounded" 
                  disabled 
                  style={{ cursor: 'move' }}
                />}
                {element.type === 'image' && <div className="w-full h-full flex items-center justify-center bg-neutral-200/50 dark:bg-neutral-800/50 rounded overflow-hidden">
                  {element.props.src ? (
                    <img 
                      src={element.props.src as string} 
                      alt={element.props.alt as string || 'Element'} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    <div className="text-neutral-500 dark:text-neutral-400 text-sm">Image</div>
                  )}
                </div>}
                {element.type === 'container' && (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-sm">
                    Container
                  </div>
                )}
                {element.type === 'vstack' && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-full h-1/4 rounded"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-full h-1/4 rounded"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-full h-1/4 rounded"></div>
                  </div>
                )}
                {element.type === 'hstack' && (
                  <div className="w-full h-full flex flex-row items-center justify-center gap-2 p-2">
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-1/4 h-full rounded"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-1/4 h-full rounded"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-1/4 h-full rounded"></div>
                  </div>
                )}
                
                {/* Resize handles for selected elements */}
                {isSelected && (
                  <>
                    <div
                      className="absolute top-0 left-0 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'nw')}
                    />
                    <div
                      className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full translate-x-1/2 -translate-y-1/2 cursor-nesw-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'ne')}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-3 h-3 bg-primary rounded-full -translate-x-1/2 translate-y-1/2 cursor-nesw-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'sw')}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full translate-x-1/2 translate-y-1/2 cursor-nwse-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'se')}
                    />
                    <div
                      className="absolute top-0 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'n')}
                    />
                    <div
                      className="absolute bottom-0 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 's')}
                    />
                    <div
                      className="absolute top-1/2 left-0 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'w')}
                    />
                    <div
                      className="absolute top-1/2 right-0 w-3 h-3 bg-primary rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize border border-white"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'e')}
                    />
                  </>
                )}
              </div>
            );
          })}
          
          {/* Drop target indicator */}
          <div
            className="fixed hidden w-16 h-16 border-2 border-dashed border-primary pointer-events-none"
            id="drop-indicator"
            style={{
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              display: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
} 