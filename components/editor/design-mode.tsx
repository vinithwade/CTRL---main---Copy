"use client";

import { useState, useRef } from "react";
import { useEditorStore, DesignElement } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronDown, ChevronRight, 
  Square, Type, Pencil as ButtonIcon, Image as ImageIcon,
  Grid3X3, LayoutGrid, CopyIcon, EyeIcon, EyeOffIcon,
  Columns, RotateCw, LucideProps
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

// TextAlign type definition
type TextAlign = "left" | "center" | "right" | "justify";

type ElementTypeConfig = {
  icon: React.FC<LucideProps>;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
};

const ELEMENT_TYPES: Record<string, ElementTypeConfig> = {
  container: { icon: Square, label: "Container", defaultWidth: 300, defaultHeight: 200 },
  text: { icon: Type, label: "Text", defaultWidth: 200, defaultHeight: 40 },
  button: { icon: ButtonIcon, label: "Button", defaultWidth: 150, defaultHeight: 40 },
  image: { icon: ImageIcon, label: "Image", defaultWidth: 200, defaultHeight: 150 },
  grid: { icon: Grid3X3, label: "Grid", defaultWidth: 300, defaultHeight: 300 },
  card: { icon: LayoutGrid, label: "Card", defaultWidth: 250, defaultHeight: 300 },
  columns: { icon: Columns, label: "Columns", defaultWidth: 400, defaultHeight: 200 },
};

export default function DesignMode() {
  const {
    designElements,
    selectedElementId,
    setSelectedElement,
    addDesignElement,
    updateDesignElement,
    moveDesignElement,
    removeDesignElement,
    resizeDesignElement,
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [copiedElement, setCopiedElement] = useState<DesignElement | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState("layers");
  const [searchQuery, setSearchQuery] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = designElements.find(el => el.id === selectedElementId);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect when clicking on the canvas background
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleElementMouseDown = (
    e: React.MouseEvent,
    element: DesignElement
  ) => {
    e.stopPropagation();
    setSelectedElement(element.id);
    setIsDragging(true);

    // Calculate the offset from the mouse position to the element's top-left corner
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    direction: string
  ) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElementId) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const x = e.clientX - canvasRect.left - dragOffset.x;
      const y = e.clientY - canvasRect.top - dragOffset.y;
      
      moveDesignElement(selectedElementId, x, y);
    } else if (isResizing && selectedElementId && resizeDirection) {
      const element = designElements.find(el => el.id === selectedElementId);
      if (!element || !element.width || !element.height || !element.x || !element.y) return;
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      let newWidth = element.width;
      let newHeight = element.height;
      
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, e.clientX - canvasRect.left - (element.x || 0));
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(30, e.clientY - canvasRect.top - (element.y || 0));
      }
      if (resizeDirection.includes('w')) {
        const newX = e.clientX - canvasRect.left;
        newWidth = Math.max(50, element.x + element.width - newX);
        moveDesignElement(selectedElementId, newX, element.y);
      }
      if (resizeDirection.includes('n')) {
        const newY = e.clientY - canvasRect.top;
        newHeight = Math.max(30, element.y + element.height - newY);
        moveDesignElement(selectedElementId, element.x, newY);
      }
      
      resizeDesignElement(selectedElementId, newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const addNewElement = (type: string) => {
    const config = ELEMENT_TYPES[type];
    
    const newElement: DesignElement = {
      id: uuidv4(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      props: {
        text: type === "text" ? "Text content" : 
              type === "button" ? "Button" : "",
        backgroundColor: type === "button" ? "#3b82f6" : undefined,
        color: type === "button" ? "#ffffff" : "#000000",
        borderRadius: type === "button" ? 4 : 0,
        padding: type === "button" ? 8 : type === "container" ? 16 : 0,
        columns: type === "columns" ? 2 : undefined,
        src: type === "image" ? "https://via.placeholder.com/200x150" : undefined,
      },
      style: {
        fontFamily: type === "text" ? "Inter" : undefined,
        fontSize: type === "text" ? 16 : undefined,
        fontWeight: type === "text" ? "normal" : undefined,
        textAlign: type === "text" ? "left" : undefined,
      },
      position: { x: 100, y: 100 },
      x: 100,
      y: 100,
      width: config.defaultWidth,
      height: config.defaultHeight,
    };

    addDesignElement(newElement);
    setSelectedElement(newElement.id);
  };

  const duplicateElement = () => {
    if (!selectedElementId) return;
    
    const element = designElements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    const newElement: DesignElement = {
      ...element,
      id: uuidv4(),
      name: `${element.name} (copy)`,
      x: (element.x || 0) + 20,
      y: (element.y || 0) + 20,
    };
    
    addDesignElement(newElement);
    setSelectedElement(newElement.id);
  };

  const copyElement = () => {
    if (!selectedElementId) return;
    
    const element = designElements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    setCopiedElement({...element});
  };

  const pasteElement = () => {
    if (!copiedElement) return;
    
    const newElement: DesignElement = {
      ...copiedElement,
      id: uuidv4(),
      name: `${copiedElement.name} (copy)`,
      x: (copiedElement.x || 0) + 20,
      y: (copiedElement.y || 0) + 20,
    };
    
    addDesignElement(newElement);
    setSelectedElement(newElement.id);
  };

  const updateElementProperty = (key: string, value: unknown) => {
    if (!selectedElementId) return;
    
    updateDesignElement(selectedElementId, {
      props: {
        ...selectedElement?.props,
        [key]: value
      }
    });
  };

  const updateElementStyle = (key: string, value: unknown) => {
    if (!selectedElementId) return;
    
    updateDesignElement(selectedElementId, {
      style: {
        ...selectedElement?.style,
        [key]: value
      }
    });
  };

  const updateElementName = (name: string) => {
    if (!selectedElementId) return;
    updateDesignElement(selectedElementId, { name });
  };

  // Calculate zoom scale
  const zoomScale = zoom / 100;

  return (
    <div className="flex h-full bg-[#1e1e1e] text-white">
      {/* Left Sidebar - Layers & Components */}
      <div className="w-64 border-r border-[#333] flex flex-col">
        <div className="p-2 flex items-center">
          <Button size="sm" variant="ghost" className="text-xs h-8 w-8 p-0">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </Button>
          <div className="ml-2 text-sm font-medium">Layers</div>
        </div>

        {/* Layers Tree */}
        <div className="flex-1 overflow-auto p-2 pt-0">
          <div className="flex items-center mb-2">
            <Square className="w-4 h-4 mr-2 text-emerald-500" />
            <span className="text-sm">Home</span>
          </div>
          
          {designElements.map((element) => (
            <div 
              key={element.id}
              className={`flex items-center ml-4 mb-1 pl-2 py-1 border-l-2 ${
                selectedElementId === element.id 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-transparent hover:bg-[#333]"
              } rounded cursor-pointer transition-colors`}
              onClick={() => setSelectedElement(element.id)}
            >
              <Type className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              <span className="text-xs">{element.name}</span>
            </div>
          ))}
        </div>

        {/* Components & Styles Tabs */}
        <div className="border-t border-[#333] p-2">
          <Tabs defaultValue="components" className="w-full">
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
              <TabsTrigger value="styles" className="text-xs">Styles</TabsTrigger>
            </TabsList>
            <TabsContent value="components" className="pt-2">
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(ELEMENT_TYPES).map(([type, config]) => (
                  <Button
                    key={type}
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs justify-start bg-[#252525] hover:bg-[#333] border-[#444]"
                    onClick={() => addNewElement(type)}
                  >
                    <config.icon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    {config.label}
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="styles" className="pt-2">
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-[#252525] rounded">Colors (19)</div>
                <div className="p-2 bg-[#252525] rounded">Gradients (2)</div>
                <div className="p-2 bg-[#252525] rounded">Type (11)</div>
                <div className="p-2 bg-[#252525] rounded">Spacing (11)</div>
                <div className="p-2 bg-[#252525] rounded">Radius (0)</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        className="flex-1 relative overflow-auto bg-[#252525]"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#333] rounded-full px-3 py-0.5 text-xs flex items-center">
          <span className="mr-2">Preview</span>
          <input 
            type="search" 
            placeholder="OS Controls, Elements, Components..." 
            className="bg-[#1e1e1e] text-xs rounded-full px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="absolute right-4 top-4 flex flex-col gap-2">
          {Object.entries(ELEMENT_TYPES).slice(0, 5).map(([type, config]) => (
            <Button
              key={type}
              size="sm"
              variant="outline"
              className="h-9 bg-[#1e1e1e] border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 relative"
              onClick={() => addNewElement(type)}
            >
              <config.icon className="w-4 h-4" />
              <span className="absolute left-full ml-2 bg-[#333] px-2 py-1 rounded opacity-0 group-hover:opacity-100 text-xs whitespace-nowrap">
                {config.label}
              </span>
            </Button>
          ))}
        </div>

        <div 
          ref={canvasRef}
          className="mt-16 mx-auto bg-[#343434] shadow-xl rounded-lg overflow-hidden transition-transform origin-top-left"
          style={{ 
            width: "400px", 
            height: "600px",
            transform: `scale(${zoomScale})`,
            backgroundImage: showGrid ? 
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)" : 
              "none",
            backgroundSize: "20px 20px"
          }}
        >
          {designElements.map((element) => (
            <div
              key={element.id}
              className={`absolute border ${
                selectedElementId === element.id
                  ? "border-emerald-500"
                  : "border-transparent hover:border-gray-300"
              } ${element.type === "button" ? "flex items-center justify-center" : ""}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                cursor: isDragging ? "move" : "pointer",
                backgroundColor: element.props.backgroundColor as string,
                borderRadius: `${element.props.borderRadius || 0}px`,
                padding: `${element.props.padding || 0}px`,
                color: element.props.color as string,
                fontFamily: element.style?.fontFamily as string,
                fontSize: `${element.style?.fontSize || 16}px`,
                fontWeight: element.style?.fontWeight as string,
                textAlign: element.style?.textAlign as TextAlign,
              }}
              onClick={(e) => handleElementClick(e, element.id)}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
            >
              {element.type === "text" && (
                <span>{element.props.text as string}</span>
              )}
              {element.type === "button" && (
                <span>{element.props.text as string}</span>
              )}
              {element.type === "image" && (
                <Image 
                  src={element.props.src as string} 
                  alt="Element" 
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Resize handles - only show for selected element */}
              {selectedElementId === element.id && (
                <>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -top-1.5 -left-1.5 cursor-nw-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'nw')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'n')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -top-1.5 -right-1.5 cursor-ne-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'ne')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'e')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -bottom-1.5 -right-1.5 cursor-se-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'se')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 's')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'sw')}></div>
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, 'w')}></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-72 border-l border-[#333] bg-[#1e1e1e] overflow-y-auto">
        <div className="p-3 border-b border-[#333]">
          <h2 className="text-sm font-medium text-white flex items-center">
            Layout
          </h2>
        </div>
        
        {selectedElement ? (
          <div className="space-y-4 p-3">
            <div className="space-y-2">
              {/* Width/Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs mb-1 block text-gray-400">Width</label>
                  <div className="flex items-center">
                    <span className="text-xs font-mono bg-[#333] px-2 py-1 rounded-l border border-[#444]">Fill</span>
                    <span className="text-xs font-mono bg-[#222] px-2 py-1 rounded-r border-t border-r border-b border-[#444]">{selectedElement.width}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1 block text-gray-400">Height</label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => resizeDesignElement(selectedElement.id, selectedElement.width || 0, parseInt(e.target.value))}
                      className="h-7 bg-[#222] border-[#444] text-white"
                    />
                    <span className="text-xs font-mono ml-1">px</span>
                  </div>
                </div>
              </div>
              
              {/* Position Layout */}
              <div className="mt-4">
                <label className="text-xs mb-1 block text-gray-400">Stack</label>
                <div className="grid grid-cols-3 gap-1">
                  <button className="p-1 bg-[#333] hover:bg-[#444] rounded border border-[#444] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
                      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <button className="p-1 bg-[#333] hover:bg-[#444] rounded border border-[#444] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 5L12 19" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <button className="p-1 bg-[#333] hover:bg-[#444] rounded border border-[#444] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Spacing */}
              <div className="mt-4">
                <label className="text-xs mb-1 block text-gray-400">Spacing</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Padding</label>
                    <Input
                      type="number"
                      value={selectedElement.props.padding as number || 0}
                      onChange={(e) => updateElementProperty("padding", parseInt(e.target.value))}
                      className="h-7 bg-[#222] border-[#444] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Margin</label>
                    <Input
                      type="number"
                      value={selectedElement.style?.margin as number || 0}
                      onChange={(e) => updateElementStyle("margin", parseInt(e.target.value))}
                      className="h-7 bg-[#222] border-[#444] text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* If text element, show typography */}
              {selectedElement.type === "text" && (
                <div className="mt-4">
                  <label className="text-xs mb-1 block text-gray-400">Typography</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={selectedElement.props.text as string}
                      onChange={(e) => updateElementProperty("text", e.target.value)}
                      className="h-7 bg-[#222] border-[#444] text-white col-span-2"
                    />
                    <Select
                      value={selectedElement.style?.fontWeight as string || "normal"}
                      onValueChange={(value) => updateElementStyle("fontWeight", value)}
                    >
                      <SelectTrigger className="h-7 bg-[#222] border-[#444] text-white">
                        <SelectValue placeholder="Weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedElement.style?.textAlign as string || "left"}
                      onValueChange={(value) => updateElementStyle("textAlign", value as TextAlign)}
                    >
                      <SelectTrigger className="h-7 bg-[#222] border-[#444] text-white">
                        <SelectValue placeholder="Align" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-2 flex justify-end space-x-2">
              <Button 
                size="sm"
                variant="outline"
                className="h-7 bg-[#333] hover:bg-[#444] text-white border-[#444]"
                onClick={() => removeDesignElement(selectedElement.id)}
              >
                Delete
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="h-7 bg-emerald-500/10 text-emerald-500 border-emerald-500 hover:bg-emerald-500/20"
                onClick={duplicateElement}
              >
                Duplicate
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            Select an element to edit its properties
          </div>
        )}
      </div>
    </div>
  );
} 