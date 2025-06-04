"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store/editor-store";
import { useProjectStore } from "@/lib/store/project-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowLeft } from "lucide-react";
import ModeSelector from "./mode-selector";

interface EditorLayoutProps {
  children: React.ReactNode;
  projectId: string;
}

export function EditorLayout({ children, projectId }: EditorLayoutProps) {
  const router = useRouter();
  const { getProject, currentProject, isLoading: projectLoading, projects } = useProjectStore();
  const { setProjectData, projectName } = useEditorStore();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Check if we already have the project in state
  const existingProject = projects.find(p => p.id === projectId);

  // Fetch project data only if we don't already have it
  useEffect(() => {
    if (projectId && !existingProject) {
      console.log('Fetching project data for:', projectId);
      const loadProject = async () => {
        try {
          await getProject(projectId);
        } catch (error) {
          console.error("Failed to fetch project", error);
        }
      };
      
      loadProject();
      
      // Set a safety timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    } else if (existingProject && !currentProject) {
      // If we have the project in our projects list but not as currentProject
      console.log('Using existing project data:', existingProject.id);
      getProject(projectId);
    }
  }, [projectId, getProject, existingProject, currentProject]);

  // Set editor state from project data
  useEffect(() => {
    if (currentProject) {
      setProjectData(currentProject);
    } else if (existingProject) {
      // Use existing project data immediately while current project is loading
      setProjectData(existingProject);
    }
  }, [currentProject, existingProject, setProjectData]);

  // If we already have the current project or an existing project in state, render immediately
  const projectToUse = currentProject || existingProject;
  
  // If we're still loading but timeout has passed, give user an option to go back
  if (!projectToUse && loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h3 className="mb-4 text-xl">Loading is taking longer than expected</h3>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  // Standard loading state - only show if we don't have any project data
  if (!projectToUse && projectLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we have a project to use, render the editor even if still technically loading
  if (projectToUse) {
    return (
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="font-bold flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            
            <div className="text-lg font-bold">{projectName || "Project"}</div>
          </div>

          <ModeSelector />

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
            >
              Shortcuts
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Export Project</DropdownMenuItem>
                <DropdownMenuItem>Project Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {showShortcuts && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Copy</span>
                  <span className="font-mono">Ctrl/Cmd + C</span>
                </div>
                <div className="flex justify-between">
                  <span>Paste</span>
                  <span className="font-mono">Ctrl/Cmd + V</span>
                </div>
                <div className="flex justify-between">
                  <span>Undo</span>
                  <span className="font-mono">Ctrl/Cmd + Z</span>
                </div>
                <div className="flex justify-between">
                  <span>Redo</span>
                  <span className="font-mono">Ctrl/Cmd + Y</span>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => setShowShortcuts(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  // Fallback loading state if nothing else worked
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
} 