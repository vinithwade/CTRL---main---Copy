"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProjectStore } from "@/lib/store/project-store";
import ProjectCard from "@/components/dashboard/project-card";
import CreateProject from "@/components/dashboard/create-project";
import { FiLoader } from "react-icons/fi";

export default function DashboardPage() {
  const { user, isDemoMode } = useAuthStore();
  const { projects, fetchUserProjects, isLoading } = useProjectStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // If we have a user, fetch their projects
        if (user) {
          await fetchUserProjects(user.uid);
        } else if (isDemoMode) {
          // If we're in demo mode but don't have a user yet, use a default ID
          await fetchUserProjects('demo-user');
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        // Always set initial load to false, even on error
        setIsInitialLoad(false);
      }
    };

    loadProjects();
    
    // Set a safety timeout to prevent infinite loading state
    const timeout = setTimeout(() => {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }, 500); // Reduced from 1000ms to 500ms

    return () => clearTimeout(timeout);
  }, [user, fetchUserProjects, isDemoMode, isInitialLoad]);

  // Loading state - but with a brief minimum display time to prevent flashes
  if (isInitialLoad || (isLoading && projects.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <FiLoader className="w-8 h-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your projects...</p>
      </div>
    );
  }

  // This will only render briefly before redirect happens
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            View and manage your development projects
          </p>
        </div>
        <CreateProject />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/50">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-xl font-semibold">No projects yet</h2>
            <p className="text-muted-foreground">
              Get started by creating your first no-code/low-code project.
            </p>
            <CreateProject />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
} 