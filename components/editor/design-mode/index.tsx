import { useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { ComponentPanel } from "./component-panel";
import { PropertiesPanel } from "./properties-panel";
import { Canvas } from "./canvas";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Save,
  MoveHorizontal,
  Undo,
  Redo
} from "lucide-react";
import { ElementType } from "@/lib/types/editor-types";
import type { DesignElement } from "@/lib/types/editor-types";

export default function DesignMode() {
  // Get store methods and state
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
  
  // Local state
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [isPanMode, setIsPanMode] = useState(false);
  
  // Get the currently selected element
  const selectedElement = designElements.find(el => el.id === selectedElementId);
  
  // Handle updating element style properties
  const handleUpdateStyle = (key: string, value: unknown) => {
    if (!selectedElementId) return;
    
    updateDesignElement(selectedElementId, {
      style: {
        ...selectedElement?.style,
        [key]: value
      }
    });
  };
  
  // Handle updating element properties
  const handleUpdateProperty = (key: string, value: unknown) => {
    if (!selectedElementId) return;
    
    updateDesignElement(selectedElementId, {
      [key]: value
    });
  };
  
  // Handle updating element props specifically
  const handleUpdateElementProps = (key: string, value: unknown) => {
    if (!selectedElementId || !selectedElement) return;
    
    updateDesignElement(selectedElementId, {
      props: {
        ...selectedElement.props,
        [key]: value
      }
    });
  };
  
  // Handle updating element name
  const handleUpdateName = (name: string) => {
    if (!selectedElementId) return;
    
    updateDesignElement(selectedElementId, { name });
  };
  
  // Handle toggling element visibility
  const handleToggleVisibility = () => {
    if (!selectedElementId || !selectedElement) return;
    
    updateDesignElement(selectedElementId, {
      visible: selectedElement.visible === false ? true : false
    });
  };
  
  // Handle deleting the selected element
  const handleDeleteElement = () => {
    if (!selectedElementId) return;
    
    removeDesignElement(selectedElementId);
    setSelectedElement(null);
  };
  
  // Handle drag start from component panel
  const handleComponentDragStart = (type: ElementType) => {
    // This is just a placeholder - actual element creation happens in Canvas
    console.log(`Started dragging a ${type} component`);
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 10, 30));
  };
  
  const handleZoomReset = () => {
    setZoom(100);
  };
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar: Component Panel */}
      <div className="w-64 overflow-hidden flex-shrink-0">
        <ComponentPanel
          onDragStart={handleComponentDragStart}
        />
      </div>
      
      {/* Main content: Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Canvas toolbar */}
        <div className="h-10 border-b border-l flex items-center justify-between px-2 bg-background">
          <div className="flex items-center space-x-1">
            <Button
              variant={isPanMode ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              title="Pan Mode"
              onClick={() => setIsPanMode(!isPanMode)}
            >
              <MoveHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant={showGrid ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              title="Toggle Grid"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Undo"
              onClick={() => {/* TODO: implement undo */}}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Redo"
              onClick={() => {/* TODO: implement redo */}}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Slider
                value={[zoom]}
                min={30}
                max={200}
                step={10}
                onValueChange={(value) => setZoom(value[0])}
                className="w-24"
              />
              <span 
                className="text-xs w-10 text-center cursor-pointer" 
                onClick={handleZoomReset}
                title="Reset Zoom"
              >
                {zoom}%
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
        
        {/* Canvas area */}
        <Canvas
          elements={designElements}
          selectedElementId={selectedElementId}
          zoom={zoom}
          showGrid={showGrid}
          onSelectElement={setSelectedElement}
          onAddElement={addDesignElement}
          onUpdateElement={updateDesignElement}
          onMoveElement={moveDesignElement}
          onResizeElement={resizeDesignElement}
        />
      </div>
      
      {/* Right sidebar: Properties Panel */}
      <div className="w-72 overflow-hidden flex-shrink-0">
        <PropertiesPanel
          selectedElement={selectedElement || null}
          onUpdateStyle={handleUpdateStyle}
          onUpdateProperty={handleUpdateProperty}
          onUpdateName={handleUpdateName}
          onToggleVisibility={handleToggleVisibility}
          onDeleteElement={handleDeleteElement}
        />
      </div>
    </div>
  );
} 