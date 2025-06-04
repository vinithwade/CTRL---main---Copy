import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ElementType } from "@/lib/types/editor-types";
import {
  Square,
  Type,
  Layout,
  Grid3X3,
  CreditCard,
  Columns3,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Layers,
  Image,
  Video,
  FileVideo,
  TextCursorInput,
  Search
} from "lucide-react";

interface ComponentPanelProps {
  onDragStart: (type: ElementType) => void;
}

type ComponentGroup = {
  name: string;
  icon: React.ReactNode;
  components: {
    type: ElementType;
    name: string;
    icon: React.ReactNode;
  }[];
};

const ELEMENT_GROUPS: ComponentGroup[] = [
  {
    name: "Basic",
    icon: <Layout className="h-4 w-4" />,
    components: [
      { type: "text", name: "Text", icon: <Type className="h-4 w-4" /> },
      { type: "button", name: "Button", icon: <Square className="h-4 w-4" /> },
      { type: "input", name: "Input", icon: <TextCursorInput className="h-4 w-4" /> },
      { type: "image", name: "Image", icon: <Image className="h-4 w-4" /> },
    ],
  },
  {
    name: "Layout",
    icon: <Layout className="h-4 w-4" />,
    components: [
      { type: "container", name: "Container", icon: <Square className="h-4 w-4" /> },
      { type: "vstack", name: "VStack", icon: <AlignVerticalJustifyCenter className="h-4 w-4" /> },
      { type: "hstack", name: "HStack", icon: <AlignHorizontalJustifyCenter className="h-4 w-4" /> },
      { type: "zstack", name: "ZStack", icon: <Layers className="h-4 w-4" /> },
      { type: "grid", name: "Grid", icon: <Grid3X3 className="h-4 w-4" /> },
      { type: "card", name: "Card", icon: <CreditCard className="h-4 w-4" /> },
      { type: "columns", name: "Columns", icon: <Columns3 className="h-4 w-4" /> },
    ],
  },
  {
    name: "Media",
    icon: <FileVideo className="h-4 w-4" />,
    components: [
      { type: "image", name: "Image", icon: <Image className="h-4 w-4" /> },
      { type: "video", name: "Video", icon: <Video className="h-4 w-4" /> },
    ],
  },
];

export function ComponentPanel({ onDragStart }: ComponentPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"components" | "layers">("components");

  const filteredComponents = () => {
    if (!searchQuery.trim()) return ELEMENT_GROUPS;

    return ELEMENT_GROUPS.map((group) => ({
      ...group,
      components: group.components.filter((component) =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((group) => group.components.length > 0);
  };

  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData("component-type", type);
    onDragStart(type);
  };

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search components..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "components" | "layers")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="flex-1 overflow-auto px-2 pt-2">
          {filteredComponents().map((group) => (
            <div key={group.name} className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
                {group.icon}
                {group.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.components.map((component) => (
                  <Button
                    key={component.type}
                    variant="outline"
                    className="h-auto py-2 justify-start gap-2 font-normal"
                    draggable
                    onDragStart={(e) => handleDragStart(e, component.type)}
                  >
                    {component.icon}
                    <span>{component.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="layers" className="flex-1 overflow-auto p-2">
          <div className="text-center text-muted-foreground py-10">
            <p>No components added yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 