"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ProjectData } from "@/lib/utils";
import { useProjectStore } from "@/lib/store/project-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ProjectCardProps {
  project: ProjectData;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { deleteProject } = useProjectStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const platformLabels = {
    web: "Web Application",
    mobile: "Mobile Application",
    desktop: "Desktop Application"
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(project.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date to readable format
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  };

  const createdAtFormatted = formatDate(project.createdAt);
  const updatedAtFormatted = formatDate(project.updatedAt);

  // Function to navigate to editor with projectId
  const navigateToEditor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigating to editor for project:', project.id);
    router.push(`/editor/${project.id}`);
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer" 
        onClick={navigateToEditor}
      >
        <CardHeader>
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{platformLabels[project.platform]} • {project.language}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-xs">{createdAtFormatted}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="text-xs">{updatedAtFormatted}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={navigateToEditor}
          >
            Open
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/editor/${project.id}`)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/project/${project.id}/settings`)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 