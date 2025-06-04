"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { useProjectStore } from "@/lib/store/project-store";
import { EditorLayout } from "@/components/editor/editor-layout";
import DesignMode from "@/components/editor/design-mode";
import LogicMode from "@/components/editor/logic-mode";
import CodeMode from "@/components/editor/code-mode";
import { useParams } from "next/navigation";

export default function EditorPage() {
  // Use the useParams hook to get the projectId from the URL
  const params = useParams();
  const projectId = params.projectId as string;
  const { currentMode, setProjectData } = useEditorStore();
  const { getProject, projects, currentProject } = useProjectStore();

  // Load project data into editor store when the page loads
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Try to find the project in the already loaded projects
        const existingProject = projects.find(p => p.id === projectId);
        
        if (existingProject) {
          console.log("Found existing project:", existingProject);
          setProjectData(existingProject);
        } else {
          // If not found, fetch it from the store
          console.log("Fetching project data for ID:", projectId);
          await getProject(projectId);
          
          // After fetching, if we have a current project, set its data
          if (currentProject) {
            console.log("Setting project data:", currentProject);
            setProjectData(currentProject);
          }
        }
      } catch (error) {
        console.error("Error loading project data:", error);
      }
    };

    loadProjectData();
  }, [projectId, getProject, projects, currentProject, setProjectData]);

  return (
    <EditorLayout projectId={projectId}>
      {currentMode === "design" && <DesignMode />}
      {currentMode === "logic" && <LogicMode />}
      {currentMode === "code" && <CodeMode />}
    </EditorLayout>
  );
} 