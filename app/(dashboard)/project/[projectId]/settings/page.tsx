"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store/project-store";
import { ProjectData } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiLoader } from "react-icons/fi";
import { platformOptions, languageOptions } from "@/lib/utils";
import Deployment from "@/components/project/deployment";
import PluginManager from "@/components/project/plugin-manager";
import { useAuthStore } from "@/lib/store/auth-store";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { getProject, updateProject, deleteProject, isLoading, error, currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [localProject, setLocalProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      getProject(projectId).catch(err => {
        console.error("Failed to fetch project", err);
      });
    }
  }, [projectId, getProject]);

  useEffect(() => {
    if (currentProject) {
      setLocalProject(currentProject);
    }
  }, [currentProject]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localProject) return;
    
    try {
      setIsSaving(true);
      setSavingError(null);
      
      await updateProject(projectId, {
        name: localProject.name,
        description: localProject.description,
        platform: localProject.platform,
        language: localProject.language,
      });
      
      setIsSaving(false);
    } catch (error) {
      console.error("Failed to update project", error);
      setSavingError(error instanceof Error ? error.message : "Failed to save changes");
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      await deleteProject(projectId);
      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to delete project", error);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!localProject) return;
    
    setLocalProject({
      ...localProject,
      [field]: value,
    });
  };

  if (isLoading || !localProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <FiLoader className="w-8 h-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading project settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Check if current user is the project owner
  const isOwner = user?.uid === localProject.createdBy;
  
  // Check if current user is at least an editor
  const userRole = localProject.collaborators?.find(c => c.uid === user?.uid)?.role || 'viewer';
  const canEdit = isOwner || ['editor', 'developer', 'admin'].includes(userRole);

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{localProject.name}</h1>
          <p className="text-muted-foreground">
            Project Settings
          </p>
        </div>
        <Button onClick={() => router.push(`/editor/${projectId}`)}>
          Open Editor
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <form onSubmit={handleUpdate}>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Manage general settings for your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={localProject.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={localProject.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    disabled={!canEdit}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={localProject.platform}
                      onValueChange={(value) => handleInputChange('platform', value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={localProject.language}
                      onValueChange={(value) => handleInputChange('language', value)}
                      disabled={!canEdit || !localProject.platform}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {localProject.platform && languageOptions[localProject.platform as keyof typeof languageOptions]?.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {savingError && (
                  <div className="text-sm font-medium text-destructive mt-2">
                    {savingError}
                  </div>
                )}
              </CardContent>
              
              {canEdit && (
                <CardFooter className="flex justify-between">
                  <div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!isOwner || isSaving || deleting}
                    >
                      Delete Project
                    </Button>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
          
          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Project</CardTitle>
                <CardDescription>
                  This action cannot be undone. This will permanently delete the project and all its data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Please type <strong>{localProject.name}</strong> to confirm deletion.
                </p>
                <Input placeholder={localProject.name} />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Project"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {/* Deployment Tab */}
        <TabsContent value="deployment">
          <Deployment project={localProject} />
        </TabsContent>
        
        {/* Plugins Tab */}
        <TabsContent value="plugins">
          <PluginManager project={localProject} />
        </TabsContent>
        
        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Collaborators</CardTitle>
              <CardDescription>
                Add or remove team members from your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Project Owner</h3>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                      {isOwner ? user?.displayName?.charAt(0) || "U" : "U"}
                    </div>
                    <div>
                      <div className="font-medium">{isOwner ? user?.displayName || "You" : "User"}</div>
                      <div className="text-xs text-muted-foreground">{isOwner ? user?.email : "owner@example.com"}</div>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full font-medium">
                    Owner
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <h3 className="text-lg font-medium">Collaborators</h3>
                  <Button variant="outline" size="sm" disabled={!isOwner}>
                    Add Collaborator
                  </Button>
                </div>
                
                {localProject.collaborators && localProject.collaborators.length > 0 ? (
                  <div className="space-y-3">
                    {localProject.collaborators.map((collaborator) => (
                      <div key={collaborator.uid} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                            C
                          </div>
                          <div>
                            <div className="font-medium">Collaborator</div>
                            <div className="text-xs text-muted-foreground">{collaborator.uid}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select defaultValue={collaborator.role} disabled={!isOwner}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="developer">Developer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {isOwner && (
                            <Button variant="ghost" size="icon" className="text-destructive">
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">No collaborators yet</p>
                    {isOwner && (
                      <Button variant="outline" size="sm" className="mt-2">
                        Invite Team Members
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Configure access levels for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Project Visibility</Label>
                <Select defaultValue="private" disabled={!isOwner}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only invited collaborators)</SelectItem>
                    <SelectItem value="team">Team (All organization members)</SelectItem>
                    <SelectItem value="public">Public (Anyone with the link)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This controls who can see your project
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-export">Allow Code Export</Label>
                  <input 
                    type="checkbox" 
                    id="allow-export" 
                    defaultChecked 
                    className="h-4 w-4"
                    disabled={!isOwner}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Let collaborators export code from this project
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-deploy">Allow Deployment</Label>
                  <input 
                    type="checkbox" 
                    id="allow-deploy" 
                    defaultChecked 
                    className="h-4 w-4"
                    disabled={!isOwner}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Let collaborators deploy this project
                </p>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-plugins">Allow Plugin Installation</Label>
                  <input 
                    type="checkbox" 
                    id="allow-plugins" 
                    defaultChecked={false}
                    className="h-4 w-4"
                    disabled={!isOwner}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Let collaborators install and manage plugins
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 