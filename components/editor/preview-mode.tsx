"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "../ui/button";
import { Laptop, Smartphone, Tablet, X } from "lucide-react";
import Image from "next/image";

interface PreviewModeProps {
  onClose: () => void;
}

export function PreviewMode({ onClose }: PreviewModeProps) {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const { designElements } = useEditorStore();
  
  // Get appropriate dimensions based on device type
  const getDeviceDimensions = () => {
    switch (deviceType) {
      case "mobile":
        return { width: 375, height: 667, className: "w-[375px] h-[667px]" };
      case "tablet":
        return { width: 768, height: 1024, className: "w-[768px] h-[1024px]" };
      case "desktop":
        return { width: 1440, height: 900, className: "w-full h-full max-w-[1440px] max-h-[900px]" };
    }
  };
  
  const dimensions = getDeviceDimensions();
  
  // Render design elements from the store
  const renderElements = () => {
    if (!designElements) return null;
    
    return designElements.map((element) => {
      const style = {
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: element.size?.width ? `${element.size.width}px` : 'auto',
        height: element.size?.height ? `${element.size.height}px` : 'auto',
        backgroundColor: element.style?.backgroundColor || 'transparent',
        color: element.style?.color || 'inherit',
        fontFamily: element.style?.fontFamily || 'inherit',
        fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : 'inherit',
        fontWeight: element.style?.fontWeight || 'inherit',
        padding: element.style?.padding ? `${element.style.padding}px` : '0',
        margin: element.style?.margin ? `${element.style.margin}px` : '0',
        borderRadius: element.style?.borderRadius ? `${element.style.borderRadius}px` : '0',
        border: element.style?.borderWidth 
          ? `${element.style.borderWidth}px solid ${element.style.borderColor || 'black'}` 
          : 'none',
        boxShadow: element.style?.boxShadow || 'none',
        zIndex: element.zIndex || 0,
      };
      
      switch (element.type) {
        case 'container':
          return (
            <div key={element.id} style={style as React.CSSProperties}>
              {element.children && renderChildElements(element.children)}
            </div>
          );
        case 'text':
          return (
            <div key={element.id} style={style as React.CSSProperties}>
              {element.content || 'Text Content'}
            </div>
          );
        case 'button':
          return (
            <button 
              key={element.id} 
              style={style as React.CSSProperties}
              className="interactive-element"
              onClick={() => console.log('Button clicked:', element.id)}
            >
              {element.content || 'Button'}
            </button>
          );
        case 'image':
          return (
            <div key={element.id} style={style as React.CSSProperties}>
              {element.src ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image 
                    src={element.src} 
                    alt={element.alt || 'Image'} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  Image Placeholder
                </div>
              )}
            </div>
          );
        default:
          return null;
      }
    });
  };
  
  // Helper function to render child elements
  const renderChildElements = (childIds: string[]) => {
    if (!designElements) return null;
    
    return childIds.map(id => {
      const element = designElements.find(el => el.id === id);
      if (!element) return null;
      
      // Find the element with the given ID and render it
      const renderedElements = renderElements();
      return renderedElements ? renderedElements.find(el => el?.key === id) : null;
    });
  };
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant={deviceType === "desktop" ? "default" : "outline"} 
            size="sm"
            onClick={() => setDeviceType("desktop")}
          >
            <Laptop className="h-4 w-4 mr-2" /> Desktop
          </Button>
          <Button 
            variant={deviceType === "tablet" ? "default" : "outline"} 
            size="sm"
            onClick={() => setDeviceType("tablet")}
          >
            <Tablet className="h-4 w-4 mr-2" /> Tablet
          </Button>
          <Button 
            variant={deviceType === "mobile" ? "default" : "outline"} 
            size="sm"
            onClick={() => setDeviceType("mobile")}
          >
            <Smartphone className="h-4 w-4 mr-2" /> Mobile
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-100">
        <div 
          className={`bg-white shadow-xl overflow-auto ${dimensions.className} flex-shrink-0`}
          style={{
            transform: deviceType !== "desktop" ? 'scale(0.8)' : 'none',
            transformOrigin: 'center',
            position: 'relative'
          }}
        >
          {designElements && designElements.length > 0 ? (
            renderElements()
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No elements to preview. Add elements in Design Mode first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 