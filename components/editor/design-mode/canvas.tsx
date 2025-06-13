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

// Helper function to get default dimensions for element types
const getDefaultDimensionsForType = (type: ElementType): { width: number; height: number } => {
  switch (type) {
    case "button":
      return { width: 120, height: 40 };
    case "text":
      return { width: 200, height: 24 };
    case "input":
      return { width: 200, height: 40 };
    case "image":
      return { width: 200, height: 200 };
    case "container":
      return { width: 300, height: 200 };
    case "card":
      return { width: 320, height: 240 };
    case "vstack":
    case "hstack":
    case "zstack":
      return { width: 250, height: 250 };
    case "grid":
      return { width: 400, height: 300 };
    case "columns":
      return { width: 400, height: 200 };
    default:
      return { width: 200, height: 100 };
  }
};

// Helper function to get default style for element types
const getDefaultStyleForType = (type: ElementType): Record<string, unknown> => {
  switch (type) {
    case "button":
      return {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        borderRadius: 4,
        padding: 8,
        textAlign: "center",
        fontWeight: "medium",
      };
    case "text":
      return {
        color: "#000000",
        fontSize: 16,
        fontWeight: "normal",
      };
    case "input":
      return {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 4,
        padding: 8,
      };
    case "container":
      return {
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        padding: 16,
      };
    case "card":
      return {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 16,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      };
    case "vstack":
      return {
        backgroundColor: "#f9fafb",
        padding: 12,
        gap: 8,
        flexDirection: "column",
      };
    case "hstack":
      return {
        backgroundColor: "#f9fafb",
        padding: 12,
        gap: 8,
        flexDirection: "row",
      };
    case "grid":
      return {
        backgroundColor: "#f9fafb",
        padding: 12,
      };
    default:
      return {};
  }
};

// Helper function to get default props for element types
const getDefaultPropsForType = (type: ElementType): Record<string, unknown> => {
  switch (type) {
    case "button":
      return {
        text: "Button",
        onClick: "handleClick()",
      };
    case "text":
      return {
        text: "Text Element",
      };
    case "input":
      return {
        placeholder: "Enter text...",
        type: "text",
      };
    case "image":
      return {
        src: "/placeholder.jpg",
        alt: "Image",
      };
    case "container":
      return {
        children: [],
      };
    case "card":
      return {
        title: "Card Title",
        children: [],
      };
    default:
      return {};
  }
};

// Element renderer component
const ElementRenderer = ({ 
  element, 
  isSelected, 
  onMouseDown,
  onResizeHandleMouseDown 
}: {
  element: DesignElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, element: DesignElement) => void;
  onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, direction: string) => void;
}) => {
  // Common style for all elements
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.size.width}px`,
    height: `${element.size.height}px`,
    cursor: 'move',
    border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
    userSelect: 'none',
    overflow: 'hidden',
    ...(element.visible === false ? { opacity: 0.5 } : {}),
  };

  // Convert element style to React style object
  const elementStyle: React.CSSProperties = {
    backgroundColor: element.style.backgroundColor as string,
    color: element.style.color as string,
    fontFamily: element.style.fontFamily as string,
    fontSize: `${element.style.fontSize}px`,
    fontWeight: element.style.fontWeight as string,
    textAlign: element.style.textAlign as React.CSSProperties['textAlign'],
    padding: `${element.style.padding}px`,
    margin: `${element.style.margin}px`,
    borderRadius: `${element.style.borderRadius}px`,
    borderWidth: `${element.style.borderWidth}px`,
    borderColor: element.style.borderColor as string,
    boxShadow: element.style.boxShadow as string,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: element.style.flexDirection as React.CSSProperties['flexDirection'],
  };

  // Render based on element type
  const renderElementContent = () => {
    switch (element.type) {
      case "text":
        return (
          <div style={{
            ...elementStyle,
            display: 'block',
            textAlign: element.style.textAlign as React.CSSProperties['textAlign'],
            overflow: 'hidden',
            width: '100%',
            height: '100%',
          }}>
            {element.props.text as string}
          </div>
        );
      case "button":
        return (
          <div style={{
            ...elementStyle,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}>
            {element.props.text as string}
          </div>
        );
      case "input":
        return (
          <div style={{
            ...elementStyle,
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}>
            <span style={{ color: '#9ca3af' }}>
              {element.props.placeholder as string}
            </span>
          </div>
        );
      case "image":
        return (
          <div style={{
            ...elementStyle,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}>
            <div>Image: {element.props.alt as string}</div>
          </div>
        );
      case "container":
      case "card":
      case "vstack":
      case "hstack":
      case "zstack":
      case "grid":
      case "columns":
        return (
          <div style={{
            ...elementStyle,
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: element.type === "hstack" ? "row" : "column",
            justifyContent: "center",
            alignItems: "center",
          }}>
            {element.type === "card" && (
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {element.props.title as string}
              </div>
            )}
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
            </div>
          </div>
        );
      default:
        return (
          <div style={{
            ...elementStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}>
            {element.type}
          </div>
        );
    }
  };

  return (
    <div
      style={baseStyle}
      onMouseDown={(e) => onMouseDown(e, element)}
    >
      {renderElementContent()}
      
      {/* Only show resize handles when selected */}
      {isSelected && (
        <>
          <div
            className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 -left-1 cursor-nw-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeHandleMouseDown(e, element.id, "nw");
            }}
          />
          <div
            className="absolute w-2 h-2 bg-primary border border-white rounded-full -top-1 -right-1 cursor-ne-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeHandleMouseDown(e, element.id, "ne");
            }}
          />
          <div
            className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 -left-1 cursor-sw-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeHandleMouseDown(e, element.id, "sw");
            }}
          />
          <div
            className="absolute w-2 h-2 bg-primary border border-white rounded-full -bottom-1 -right-1 cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeHandleMouseDown(e, element.id, "se");
            }}
          />
        </>
      )}
    </div>
  );
};

export function Canvas({
  elements,
  selectedElementId,
  zoom,
  showGrid,
  onSelectElement,
  onAddElement,
  onUpdateElement,
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
  
  // Handle mouse move for dragging/resizing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const zoomFactor = zoom / 100;
    
    if (isDragging && selectedElementId) {
      const mouseX = (e.clientX - canvasRect.left) / zoomFactor;
      const mouseY = (e.clientY - canvasRect.top) / zoomFactor;
      
      // Calculate new position using the drag offset
      const newX = mouseX - dragOffset.x / zoomFactor;
      const newY = mouseY - dragOffset.y / zoomFactor;
      
      // Move the element
      onMoveElement(selectedElementId, newX, newY);
    } else if (isResizing && selectedElementId && resizeDirection) {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (!selectedElement) return;
      
      const mouseX = (e.clientX - canvasRect.left) / zoomFactor;
      const mouseY = (e.clientY - canvasRect.top) / zoomFactor;
      
      const originalPosition = {
        x: selectedElement.position.x,
        y: selectedElement.position.y
      };
      
      const originalSize = {
        width: selectedElement.size.width,
        height: selectedElement.size.height
      };
      
      let newWidth = originalSize.width;
      let newHeight = originalSize.height;
      let newX = originalPosition.x;
      let newY = originalPosition.y;
      
      // Resize based on direction
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(20, mouseX - originalPosition.x);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(20, mouseY - originalPosition.y);
      }
      if (resizeDirection.includes('w')) {
        const deltaX = originalPosition.x - mouseX;
        newWidth = Math.max(20, originalSize.width + deltaX);
        newX = originalPosition.x - deltaX;
      }
      if (resizeDirection.includes('n')) {
        const deltaY = originalPosition.y - mouseY;
        newHeight = Math.max(20, originalSize.height + deltaY);
        newY = originalPosition.y - deltaY;
      }
      
      // Update position if it changed
      if (newX !== originalPosition.x || newY !== originalPosition.y) {
        onMoveElement(selectedElementId, newX, newY);
      }
      
      // Update size if it changed
      if (newWidth !== originalSize.width || newHeight !== originalSize.height) {
        onResizeElement(selectedElementId, newWidth, newHeight);
      }
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
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}-${Math.floor(Math.random() * 1000)}`,
      props: getDefaultPropsForType(type),
      style: getDefaultStyleForType(type),
      position: { x, y },
      size: { width, height },
      visible: true,
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

  // Update elements with legacy properties for backward compatibility
  useEffect(() => {
    elements.forEach(element => {
      // Ensure legacy properties match the new structure
      if (element.position.x !== element.x || element.position.y !== element.y ||
          element.size.width !== element.width || element.size.height !== element.height) {
        onUpdateElement(element.id, {
          x: element.position.x,
          y: element.position.y,
          width: element.size.width,
          height: element.size.height
        });
      }
    });
  }, [elements, onUpdateElement]);
  
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
          {/* Render all elements */}
          {elements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              onMouseDown={handleElementMouseDown}
              onResizeHandleMouseDown={handleResizeHandleMouseDown}
            />
          ))}
          
          {/* Canvas indicator when dragging */}
          <div 
            className="absolute inset-0 border-2 border-dashed border-primary/40 pointer-events-none opacity-0 transition-opacity duration-200"
            style={{ 
              opacity: isDragging ? 0.5 : 0 
            }}
          />
        </div>
      </div>
    </div>
  );
} 