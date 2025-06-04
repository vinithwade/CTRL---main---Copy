"use client";

import React from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";

export default function ModeSelector() {
  const { currentMode, setCurrentMode } = useEditorStore();
  
  return (
    <div className="flex items-center justify-center w-full md:w-auto space-x-1 p-2 md:p-0">
      <Button 
        size="sm"
        variant={currentMode === "design" ? "default" : "ghost"}
        onClick={() => setCurrentMode("design")}
      >
        Design
      </Button>
      <Button
        size="sm"
        variant={currentMode === "logic" ? "default" : "ghost"}
        onClick={() => setCurrentMode("logic")}
      >
        Logic
      </Button>
      <Button
        size="sm"
        variant={currentMode === "code" ? "default" : "ghost"}
        onClick={() => setCurrentMode("code")}
      >
        Code
      </Button>
    </div>
  );
} 