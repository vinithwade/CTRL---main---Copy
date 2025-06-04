import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Palette, 
  Type, 
  LayoutGrid, 
  BoxSelect, 
  Layers,
  Sliders,
  EyeOff
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DesignElement, 
  ElementStyle, 
  TextAlign, 
  FontWeight, 
  FlexDirection,
  JustifyContent,
  AlignItems
} from "@/lib/types/editor-types";

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  onUpdateStyle: (key: string, value: unknown) => void;
  onUpdateProperty: (key: string, value: unknown) => void;
  onUpdateName: (name: string) => void;
  onToggleVisibility: () => void;
  onDeleteElement: () => void;
}

export function PropertiesPanel({ 
  selectedElement, 
  onUpdateStyle, 
  onUpdateProperty,
  onUpdateName,
  onToggleVisibility,
  onDeleteElement
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("style");
  
  // If no element is selected, show a placeholder
  if (!selectedElement) {
    return (
      <div className="flex flex-col h-full border-l border-border bg-background">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="text-sm text-muted-foreground">
            <BoxSelect className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select an element to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full border-l border-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <Input
            value={selectedElement.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="h-8 font-medium"
          />
          <div className="flex space-x-1">
            <Button
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={onToggleVisibility}
              title={selectedElement.visible === false ? "Show element" : "Hide element"}
            >
              <EyeOff className="h-4 w-4" data-state={selectedElement.visible === false ? "active" : "inactive"} />
            </Button>
          </div>
        </div>
        
        <div className="flex text-xs text-muted-foreground space-x-2">
          <div>ID: {selectedElement.id.slice(0, 6)}...</div>
          <div>Type: {selectedElement.type}</div>
        </div>
      </div>
      
      <Tabs defaultValue="style" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="style">
            <Palette className="w-4 h-4 mr-1" />
            Style
          </TabsTrigger>
          <TabsTrigger value="layout">
            <LayoutGrid className="w-4 h-4 mr-1" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="text" disabled={selectedElement.type !== 'text'}>
            <Type className="w-4 h-4 mr-1" />
            Text
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="style" className="p-4 space-y-5">
            {/* Colors */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Appearance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bg-color" className="text-xs">Background</Label>
                  <div className="flex">
                    <Input
                      id="bg-color"
                      type="color"
                      value={selectedElement.style?.backgroundColor || "#ffffff"}
                      onChange={(e) => onUpdateStyle("backgroundColor", e.target.value)}
                      className="w-10 h-8 p-0 mr-2"
                    />
                    <Input
                      value={selectedElement.style?.backgroundColor || "#ffffff"}
                      onChange={(e) => onUpdateStyle("backgroundColor", e.target.value)}
                      className="h-8 flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-color" className="text-xs">Color</Label>
                  <div className="flex">
                    <Input
                      id="text-color"
                      type="color"
                      value={selectedElement.style?.color || "#000000"}
                      onChange={(e) => onUpdateStyle("color", e.target.value)}
                      className="w-10 h-8 p-0 mr-2"
                    />
                    <Input
                      value={selectedElement.style?.color || "#000000"}
                      onChange={(e) => onUpdateStyle("color", e.target.value)}
                      className="h-8 flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Border */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Border</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="border-radius" className="text-xs">Radius</Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      id="border-radius"
                      min={0}
                      max={50}
                      step={1}
                      value={[Number(selectedElement.style?.borderRadius || 0)]}
                      onValueChange={(value) => onUpdateStyle("borderRadius", value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={selectedElement.style?.borderRadius || 0}
                      onChange={(e) => onUpdateStyle("borderRadius", Number(e.target.value))}
                      className="w-16 h-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-width" className="text-xs">Width</Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      id="border-width"
                      min={0}
                      max={10}
                      step={1}
                      value={[Number(selectedElement.style?.borderWidth || 0)]}
                      onValueChange={(value) => onUpdateStyle("borderWidth", value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={selectedElement.style?.borderWidth || 0}
                      onChange={(e) => onUpdateStyle("borderWidth", Number(e.target.value))}
                      className="w-16 h-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-color" className="text-xs">Color</Label>
                  <div className="flex">
                    <Input
                      id="border-color"
                      type="color"
                      value={selectedElement.style?.borderColor || "#000000"}
                      onChange={(e) => onUpdateStyle("borderColor", e.target.value)}
                      className="w-10 h-8 p-0 mr-2"
                    />
                    <Input
                      value={selectedElement.style?.borderColor || "#000000"}
                      onChange={(e) => onUpdateStyle("borderColor", e.target.value)}
                      className="h-8 flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-style" className="text-xs">Style</Label>
                  <Select
                    value={selectedElement.style?.borderStyle || "solid"}
                    onValueChange={(value) => onUpdateStyle("borderStyle", value)}
                  >
                    <SelectTrigger id="border-style" className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Effects */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Effects</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="opacity" className="text-xs">Opacity</Label>
                  <div className="flex gap-2 items-center">
                    <Slider
                      id="opacity"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[Number(selectedElement.style?.opacity || 1)]}
                      onValueChange={(value) => onUpdateStyle("opacity", value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={selectedElement.style?.opacity || 1}
                      onChange={(e) => onUpdateStyle("opacity", Number(e.target.value))}
                      className="w-16 h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="p-4 space-y-5">
            {/* Size */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Size</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-xs">Width</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="width"
                      type="number"
                      value={selectedElement.width || selectedElement.size?.width || 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        onUpdateProperty("width", value);
                        if (selectedElement.size) {
                          onUpdateProperty("size", { ...selectedElement.size, width: value });
                        }
                      }}
                      className="h-8"
                    />
                    <Select value="px" onValueChange={() => {}}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="auto">auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs">Height</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="height"
                      type="number"
                      value={selectedElement.height || selectedElement.size?.height || 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        onUpdateProperty("height", value);
                        if (selectedElement.size) {
                          onUpdateProperty("size", { ...selectedElement.size, height: value });
                        }
                      }}
                      className="h-8"
                    />
                    <Select value="px" onValueChange={() => {}}>
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="auto">auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Position */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Position</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="x-position" className="text-xs">X Position</Label>
                  <Input
                    id="x-position"
                    type="number"
                    value={selectedElement.x || selectedElement.position.x || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      onUpdateProperty("x", value);
                      onUpdateProperty("position", { ...selectedElement.position, x: value });
                    }}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="y-position" className="text-xs">Y Position</Label>
                  <Input
                    id="y-position"
                    type="number"
                    value={selectedElement.y || selectedElement.position.y || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      onUpdateProperty("y", value);
                      onUpdateProperty("position", { ...selectedElement.position, y: value });
                    }}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
            
            {/* Padding */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Padding</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="padding" className="text-xs">All Sides</Label>
                  <Input
                    id="padding"
                    type="number"
                    value={selectedElement.style?.padding || 0}
                    onChange={(e) => onUpdateStyle("padding", Number(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
            
            {/* Margin */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Margin</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="margin" className="text-xs">All Sides</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={selectedElement.style?.margin || 0}
                    onChange={(e) => onUpdateStyle("margin", Number(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced layout options for container elements */}
            {['container', 'vstack', 'hstack', 'zstack'].includes(selectedElement.type) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Container Layout</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="flex-direction" className="text-xs">Direction</Label>
                    <Select
                      value={selectedElement.style?.flexDirection || "column"}
                      onValueChange={(value) => onUpdateStyle("flexDirection", value)}
                    >
                      <SelectTrigger id="flex-direction" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="row-reverse">Row Reverse</SelectItem>
                        <SelectItem value="column-reverse">Column Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="justify-content" className="text-xs">Justify Content</Label>
                    <Select
                      value={selectedElement.style?.justifyContent || "flex-start"}
                      onValueChange={(value) => onUpdateStyle("justifyContent", value)}
                    >
                      <SelectTrigger id="justify-content" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="align-items" className="text-xs">Align Items</Label>
                    <Select
                      value={selectedElement.style?.alignItems || "flex-start"}
                      onValueChange={(value) => onUpdateStyle("alignItems", value)}
                    >
                      <SelectTrigger id="align-items" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="stretch">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="text" className="p-4 space-y-5">
            {/* Text Properties */}
            {selectedElement.type === 'text' && (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Text</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="text-content" className="text-xs">Content</Label>
                      <Input
                        id="text-content"
                        value={selectedElement.props.text as string || ""}
                        onChange={(e) => onUpdateProperty("props", { ...selectedElement.props, text: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-family" className="text-xs">Font Family</Label>
                      <Select
                        value={selectedElement.style?.fontFamily || "Inter"}
                        onValueChange={(value) => onUpdateStyle("fontFamily", value)}
                      >
                        <SelectTrigger id="font-family" className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="SF Pro">SF Pro</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="monospace">Monospace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-size" className="text-xs">Font Size</Label>
                      <div className="flex gap-2 items-center">
                        <Slider
                          id="font-size"
                          min={8}
                          max={72}
                          step={1}
                          value={[Number(selectedElement.style?.fontSize || 16)]}
                          onValueChange={(value) => onUpdateStyle("fontSize", value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={8}
                          value={selectedElement.style?.fontSize || 16}
                          onChange={(e) => onUpdateStyle("fontSize", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-weight" className="text-xs">Font Weight</Label>
                      <Select
                        value={selectedElement.style?.fontWeight || "normal"}
                        onValueChange={(value) => onUpdateStyle("fontWeight", value)}
                      >
                        <SelectTrigger id="font-weight" className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="semibold">Semibold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="text-align" className="text-xs">Text Align</Label>
                      <Select
                        value={selectedElement.style?.textAlign || "left"}
                        onValueChange={(value) => onUpdateStyle("textAlign", value)}
                      >
                        <SelectTrigger id="text-align" className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="justify">Justify</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
      <div className="p-4 border-t border-border">
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={onDeleteElement}
        >
          Delete Element
        </Button>
      </div>
    </div>
  );
} 