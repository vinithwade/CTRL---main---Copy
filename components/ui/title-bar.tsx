"use client";

import React, { useEffect, useState } from "react";
import { Minus, Square, X, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

interface TitleBarProps {
  title?: string;
  className?: string;
}

export function TitleBar({ title = "CTRL", className }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in electron
    if (typeof window !== "undefined" && window.electron) {
      setPlatform(window.electron.platform);
      
      // Check initial maximized state
      const electron = window.electron;
      electron.isMaximized?.().then(maximized => {
        if (maximized !== undefined) {
          setIsMaximized(maximized);
        }
      }).catch(() => {
        // Ignore errors if isMaximized is not available
      });
      
      // Set up event listener for window maximize/unmaximize
      const checkMaximized = async () => {
        try {
          const maximized = await electron.isMaximized?.();
          if (maximized !== undefined) {
            setIsMaximized(maximized);
          }
        } catch {
          // Ignore errors
        }
      };
      
      // Check every second (could be optimized with proper events)
      const interval = setInterval(checkMaximized, 1000);
      
      return () => clearInterval(interval);
    }
  }, []);

  // If not in electron or on macOS (which has native title bar), don't render
  if (!platform || platform === 'darwin') return null;

  return (
    <div 
      className={cn(
        "h-8 flex items-center bg-background border-b border-border select-none",
        className
      )}
    >
      <div 
        className="flex-1 px-2 text-sm font-medium overflow-hidden whitespace-nowrap text-ellipsis drag-region" 
        onMouseDown={() => window.electron?.setDragRegion?.(true)}
        onMouseUp={() => window.electron?.setDragRegion?.(false)}
      >
        {title}
      </div>
      
      <div className="flex items-center">
        <button
          onClick={() => window.electron?.minimize()}
          className="w-10 h-8 flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => window.electron?.maximize()}
          className="w-10 h-8 flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Maximize className="h-3.5 w-3.5" />
          )}
        </button>
        
        <button
          onClick={() => window.electron?.close()}
          className="w-10 h-8 flex items-center justify-center hover:bg-destructive text-muted-foreground hover:text-destructive-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Add global type definition for window.electron
declare global {
  interface Window {
    electron?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      setDragRegion: (enabled: boolean) => void;
      platform: string;
    };
  }
} 