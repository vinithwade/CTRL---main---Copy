"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useProjectStore } from "@/lib/store/project-store";
import { 
  FiArrowLeft, 
  FiUsers, 
  FiSettings, 
  FiServer, 
  FiPackage, 
  FiDownload,
  FiSave,
  FiPlus,
  FiTrash,
  FiGlobe
} from "react-icons/fi";
import Link from "next/link";

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { getProject, currentProject } = useProjectStore();
  const { toast } = useToast();
  
  // Wrap showToast in useCallback to avoid effect dependency issues
  const showToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description
    });
  }, [toast]);
  
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [deploymentEnv, setDeploymentEnv] = useState("development");
  const [availablePlugins, setAvailablePlugins] = useState([
    { id: "p1", name: "Authentication", description: "User authentication and authorization", installed: true },
    { id: "p2", name: "Database", description: "Database integration and ORM", installed: false },
    { id: "p3", name: "Analytics", description: "User behavior tracking and analytics", installed: false },
    { id: "p4", name: "Payment", description: "Payment processing integration", installed: false },
    { id: "p5", name: "Storage", description: "File storage and management", installed: true },
  ]);

  // Mock deployment settings
  const [deploySettings, setDeploySettings] = useState({
    hosting: {
      provider: "vercel",
      autoDeployment: true,
      deploymentUrl: "",
      productionBranch: "main",
      apiKey: "",
    },
    containerization: {
      enabled: false,
      dockerize: false,
      kubernetesConfig: false,
    }
  });

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      try {
        await getProject(projectId);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load project:", error);
        showToast("Error", "Failed to load project settings");
      }
    };

    loadProject();
  }, [projectId, getProject, showToast]);

  const saveDeploymentSettings = () => {
    // Mock save functionality
    showToast("Settings Saved", "Deployment settings have been updated");
  };

  const saveGeneralSettings = () => {
    // Mock save functionality
    showToast("Settings Saved", "Project settings have been updated");
  };

  const togglePlugin = (pluginId: string) => {
    setAvailablePlugins(prev =>
      prev.map(plugin =>
        plugin.id === pluginId
          ? { ...plugin, installed: !plugin.installed }
          : plugin
      )
    );

    const plugin = availablePlugins.find(p => p.id === pluginId);
    if (plugin) {
      showToast(
        plugin.installed ? "Plugin Removed" : "Plugin Installed", 
        `${plugin.name} has been ${plugin.installed ? "removed from" : "added to"} your project`
      );
    }
  };

  const handleDeployNow = () => {
    showToast("Deployment Started", "Your application is now being deployed");
  };

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link 
          href={`/editor/${projectId}`} 
          className="inline-flex items-center text-sm mr-4 hover:text-primary transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Editor
        </Link>
        <h1 className="text-3xl font-bold">Project Settings</h1>
      </div>

      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="general" className="flex items-center">
            <FiSettings className="mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center">
            <FiUsers className="mr-2" /> Team
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center">
            <FiServer className="mr-2" /> Deployment
          </TabsTrigger>
          <TabsTrigger value="plugins" className="flex items-center">
            <FiPackage className="mr-2" /> Plugins
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Manage your project information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" defaultValue={currentProject.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" defaultValue={currentProject.description || ""} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <select 
                    id="platform"
                    defaultValue={currentProject.platform}
                    className="w-full p-2 border rounded"
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select 
                    id="language"
                    defaultValue={currentProject.language}
                    className="w-full p-2 border rounded"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="swift">Swift</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(currentProject.createdAt).toLocaleDateString()} by {currentProject.createdBy}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(currentProject.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveGeneralSettings}>
                <FiSave className="mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Added</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src="" />
                            <AvatarFallback>OW</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>Owner</div>
                            <div className="text-xs text-muted-foreground">owner@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge>Owner</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(currentProject.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">Cannot remove owner</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-2">
                <Label>Invite Members</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Enter email address" />
                  <select className="border rounded p-2 w-[180px]">
                    <option value="viewer">Viewer</option>
                    <option value="editor" selected>Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button size="sm">
                    <FiPlus className="mr-2" />
                    Invite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Settings */}
        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
              <CardDescription>
                Configure how and where your application is deployed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <select 
                  id="environment"
                  value={deploymentEnv} 
                  onChange={(e) => setDeploymentEnv(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hostingProvider">Hosting Provider</Label>
                <select 
                  id="hostingProvider"
                  value={deploySettings.hosting.provider}
                  onChange={(e) => setDeploySettings({
                    ...deploySettings,
                    hosting: { ...deploySettings.hosting, provider: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="aws">AWS</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="azure">Azure</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  value={deploySettings.hosting.apiKey}
                  onChange={(e) => setDeploySettings({
                    ...deploySettings,
                    hosting: { ...deploySettings.hosting, apiKey: e.target.value }
                  })}
                  placeholder="Enter your provider API key" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productionBranch">Production Branch</Label>
                <Input 
                  id="productionBranch" 
                  value={deploySettings.hosting.productionBranch}
                  onChange={(e) => setDeploySettings({
                    ...deploySettings,
                    hosting: { ...deploySettings.hosting, productionBranch: e.target.value }
                  })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="autoDeployment"
                  checked={deploySettings.hosting.autoDeployment}
                  onCheckedChange={(checked) => setDeploySettings({
                    ...deploySettings,
                    hosting: { ...deploySettings.hosting, autoDeployment: checked }
                  })}
                />
                <Label htmlFor="autoDeployment">Enable auto-deployment on code changes</Label>
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-base font-semibold">Containerization</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dockerize"
                      checked={deploySettings.containerization.dockerize}
                      onCheckedChange={(checked) => setDeploySettings({
                        ...deploySettings,
                        containerization: { ...deploySettings.containerization, dockerize: checked }
                      })}
                    />
                    <Label htmlFor="dockerize">Generate Dockerfile</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="kubernetesConfig"
                      checked={deploySettings.containerization.kubernetesConfig}
                      onCheckedChange={(checked) => setDeploySettings({
                        ...deploySettings,
                        containerization: { ...deploySettings.containerization, kubernetesConfig: checked }
                      })}
                    />
                    <Label htmlFor="kubernetesConfig">Generate Kubernetes config</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={saveDeploymentSettings}>
                <FiSave className="mr-2" />
                Save Settings
              </Button>
              <Button 
                onClick={handleDeployNow}
                variant="secondary"
              >
                <FiGlobe className="mr-2" />
                Deploy Now
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Plugins */}
        <TabsContent value="plugins">
          <Card>
            <CardHeader>
              <CardTitle>Plugins</CardTitle>
              <CardDescription>
                Add functionality to your project with plugins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availablePlugins.map(plugin => (
                  <div 
                    key={plugin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{plugin.name}</h3>
                      <p className="text-sm text-muted-foreground">{plugin.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={plugin.installed ? "default" : "outline"}>
                        {plugin.installed ? "Installed" : "Available"}
                      </Badge>
                      <Button 
                        variant={plugin.installed ? "destructive" : "default"}
                        size="sm"
                        onClick={() => togglePlugin(plugin.id)}
                      >
                        {plugin.installed ? (
                          <>
                            <FiTrash className="mr-2" />
                            Remove
                          </>
                        ) : (
                          <>
                            <FiDownload className="mr-2" />
                            Install
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 