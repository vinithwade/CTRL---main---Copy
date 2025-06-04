"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectData } from "@/lib/utils";
import { AlertCircle, Settings2, PackageOpen, Star, ExternalLink, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiSearch, FiDownload } from "react-icons/fi";

interface PluginManagerProps {
  project: ProjectData;
}

// Plugin types and interfaces
interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  stars: number;
  downloads: number;
  compatibility: string[];
  installed?: boolean;
  enabled?: boolean;
  configurable?: boolean;
  settings?: Record<string, unknown>;
}

// Mock plugins for marketplace
const MARKETPLACE_PLUGINS: Plugin[] = [
  {
    id: "api-connector",
    name: "API Connector",
    description: "Connect to external APIs with a visual interface",
    author: "CTRL Team",
    version: "1.2.0",
    tags: ["api", "integration", "http"],
    stars: 127,
    downloads: 4329,
    compatibility: ["web", "mobile", "desktop"],
    configurable: true,
  },
  {
    id: "auth-provider",
    name: "Auth Provider",
    description: "Simplified authentication for your applications",
    author: "CTRL Team",
    version: "2.0.1",
    tags: ["authentication", "security"],
    stars: 215,
    downloads: 7820,
    compatibility: ["web", "mobile", "desktop"],
    configurable: true,
  },
  {
    id: "database-model-generator",
    name: "Database Model Generator",
    description: "Generate database models and CRUD operations",
    author: "DataTools Inc",
    version: "1.0.5",
    tags: ["database", "models", "orm"],
    stars: 98,
    downloads: 3254,
    compatibility: ["web", "desktop"],
    configurable: true,
  },
  {
    id: "component-library",
    name: "Component Library",
    description: "Ready-to-use UI components for your project",
    author: "UI Masters",
    version: "3.1.2",
    tags: ["ui", "components", "design"],
    stars: 312,
    downloads: 9876,
    compatibility: ["web", "mobile"],
    configurable: false,
  },
  {
    id: "translation-manager",
    name: "Translation Manager",
    description: "Manage multi-language support in your application",
    author: "Globalizer",
    version: "1.3.0",
    tags: ["i18n", "localization", "languages"],
    stars: 87,
    downloads: 2199,
    compatibility: ["web", "mobile", "desktop"],
    configurable: true,
  },
  {
    id: "analytics-tracker",
    name: "Analytics Tracker",
    description: "Track user behavior and events in your application",
    author: "DataMetrics",
    version: "2.2.0",
    tags: ["analytics", "tracking", "metrics"],
    stars: 156,
    downloads: 5432,
    compatibility: ["web", "mobile"],
    configurable: true,
  },
  {
    id: "form-builder",
    name: "Dynamic Form Builder",
    description: "Build dynamic forms with validation and submission handling",
    author: "FormWizards",
    version: "2.0.3",
    tags: ["forms", "validation", "ui"],
    stars: 203,
    downloads: 6189,
    compatibility: ["web"],
    configurable: true,
  },
  {
    id: "payment-gateway",
    name: "Payment Gateway",
    description: "Integrate payment processing in your application",
    author: "PaymentPros",
    version: "1.5.0",
    tags: ["payments", "ecommerce", "integration"],
    stars: 176,
    downloads: 4821,
    compatibility: ["web", "mobile"],
    configurable: true,
  },
];

export default function PluginManager({ project }: PluginManagerProps) {
  // State management
  const [activeTab, setActiveTab] = useState("installed");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([
    { ...MARKETPLACE_PLUGINS[0], installed: true, enabled: true },
    { ...MARKETPLACE_PLUGINS[1], installed: true, enabled: false },
  ]);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);

  // Filter plugins based on search query and tag filter
  const filteredMarketplacePlugins = MARKETPLACE_PLUGINS.filter(plugin => {
    const matchesSearch = searchQuery === "" || 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = tagFilter === null || plugin.tags.includes(tagFilter);
    
    const isCompatible = plugin.compatibility.includes(project.platform);
    
    return matchesSearch && matchesTag && isCompatible;
  });

  // Get all unique tags from plugins
  const allTags = Array.from(
    new Set(
      MARKETPLACE_PLUGINS.flatMap(plugin => plugin.tags)
    )
  ).sort();

  // Handle plugin installation
  const handleInstallPlugin = (plugin: Plugin) => {
    const isAlreadyInstalled = installedPlugins.some(p => p.id === plugin.id);
    
    if (!isAlreadyInstalled) {
      const newPlugin = { ...plugin, installed: true, enabled: true };
      setInstalledPlugins([...installedPlugins, newPlugin]);
      alert(`Plugin "${plugin.name}" has been installed successfully!`);
    }
  };

  // Handle plugin uninstallation
  const handleUninstallPlugin = (pluginId: string) => {
    if (confirm("Are you sure you want to uninstall this plugin?")) {
      setInstalledPlugins(installedPlugins.filter(p => p.id !== pluginId));
    }
  };

  // Handle plugin enable/disable toggle
  const handleTogglePluginEnabled = (pluginId: string, enabled: boolean) => {
    setInstalledPlugins(installedPlugins.map(plugin => 
      plugin.id === pluginId ? { ...plugin, enabled } : plugin
    ));
  };

  // Handle plugin configuration
  const handleConfigurePlugin = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setIsConfigureDialogOpen(true);
  };

  // Get a plugin by ID (from either installed or marketplace)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPluginById = (pluginId: string): Plugin | undefined => {
    return installedPlugins.find(p => p.id === pluginId) || 
           MARKETPLACE_PLUGINS.find(p => p.id === pluginId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Plugin Manager</h2>
        <p className="text-muted-foreground">Extend your project with powerful plugins</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="installed">
            Installed Plugins
            {installedPlugins.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {installedPlugins.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            Plugin Marketplace
          </TabsTrigger>
        </TabsList>
        
        {/* Installed Plugins Tab */}
        <TabsContent value="installed" className="mt-4">
          {installedPlugins.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-10">
                <PackageOpen className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Plugins Installed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Don&apos;t see what you&apos;re looking for? Request a plugin from our marketplace.
                </p>
                <Button onClick={() => setActiveTab("marketplace")} variant="outline">
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {installedPlugins.map(plugin => (
                  <Card key={plugin.id} className={!plugin.enabled ? "opacity-70" : undefined}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {plugin.name}
                            <Badge variant="outline" className="text-xs font-normal">
                              v{plugin.version}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{plugin.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`plugin-enable-${plugin.id}`}
                              checked={plugin.enabled}
                              onCheckedChange={(checked) => handleTogglePluginEnabled(plugin.id, checked)}
                            />
                            <Label htmlFor={`plugin-enable-${plugin.id}`} className="text-xs">
                              {plugin.enabled ? "Enabled" : "Disabled"}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {plugin.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        By {plugin.author} • {plugin.downloads.toLocaleString()} downloads
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end gap-2">
                      {plugin.configurable && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfigurePlugin(plugin)}
                        >
                          <Settings2 className="h-3.5 w-3.5 mr-1" />
                          Configure
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleUninstallPlugin(plugin.id)}
                      >
                        Uninstall
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-4">
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="h-10 rounded-md border border-input px-3 py-2"
                value={tagFilter || ""}
                onChange={(e) => setTagFilter(e.target.value === "" ? null : e.target.value)}
              >
                <option value="">All Categories</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            {/* Compatibility Note */}
            <Alert variant="outline" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Compatibility</AlertTitle>
              <AlertDescription>
                Showing plugins compatible with your {project.platform} project.
              </AlertDescription>
            </Alert>
            
            {/* Plugin List */}
            {filteredMarketplacePlugins.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-md">
                <p className="text-muted-foreground">No plugins match your search criteria</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredMarketplacePlugins.map(plugin => {
                  const isInstalled = installedPlugins.some(p => p.id === plugin.id);
                  
                  return (
                    <Card key={plugin.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {plugin.name}
                              <Badge variant="outline" className="text-xs font-normal">
                                v{plugin.version}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{plugin.description}</CardDescription>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant={isInstalled ? "secondary" : "default"}
                              size="sm"
                              disabled={isInstalled}
                              onClick={() => handleInstallPlugin(plugin)}
                            >
                              {isInstalled ? "Installed" : (
                                <>
                                  <FiDownload className="mr-1 h-4 w-4" />
                                  Install
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {plugin.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={`text-xs cursor-pointer ${tagFilter === tag ? 'bg-primary/20' : ''}`}
                              onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-4">
                          <span>By {plugin.author}</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {plugin.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiDownload className="h-3 w-3" />
                            {plugin.downloads.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Plugin Configuration Dialog */}
      <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedPlugin && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPlugin.name} Configuration</DialogTitle>
                <DialogDescription>
                  Configure settings for this plugin
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-96 pr-4">
                <div className="space-y-6 py-2">
                  {/* API Connector Configuration */}
                  {selectedPlugin.id === "api-connector" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="api-base-url">API Base URL</Label>
                        <Input id="api-base-url" placeholder="https://api.example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-auth-type">Authentication Type</Label>
                        <select 
                          id="api-auth-type"
                          className="w-full p-2 rounded-md border border-input bg-background"
                        >
                          <option value="none">None</option>
                          <option value="basic">Basic Auth</option>
                          <option value="bearer">Bearer Token</option>
                          <option value="api-key">API Key</option>
                          <option value="oauth2">OAuth 2.0</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key or Token</Label>
                        <Input id="api-key" type="password" placeholder="Enter your API key" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enable-caching">Enable Response Caching</Label>
                          <Switch id="enable-caching" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cache API responses to improve performance
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Auth Provider Configuration */}
                  {selectedPlugin.id === "auth-provider" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="auth-provider">Authentication Provider</Label>
                        <select 
                          id="auth-provider"
                          className="w-full p-2 rounded-md border border-input bg-background"
                        >
                          <option value="firebase">Firebase Authentication</option>
                          <option value="auth0">Auth0</option>
                          <option value="cognito">AWS Cognito</option>
                          <option value="custom">Custom Provider</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-domain">Auth Domain</Label>
                        <Input id="auth-domain" placeholder="your-project.firebaseapp.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-client-id">Client ID</Label>
                        <Input id="auth-client-id" placeholder="Client ID" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-client-secret">Client Secret</Label>
                        <Input id="auth-client-secret" type="password" placeholder="Client Secret" />
                      </div>
                      <div className="space-y-2">
                        <Label>Authentication Methods</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="email-auth" defaultChecked />
                            <Label htmlFor="email-auth" className="text-sm font-normal">Email/Password</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="google-auth" defaultChecked />
                            <Label htmlFor="google-auth" className="text-sm font-normal">Google</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="facebook-auth" />
                            <Label htmlFor="facebook-auth" className="text-sm font-normal">Facebook</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="apple-auth" />
                            <Label htmlFor="apple-auth" className="text-sm font-normal">Apple</Label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Default Configuration Section */}
                  {selectedPlugin.id !== "api-connector" && 
                   selectedPlugin.id !== "auth-provider" && (
                    <div className="flex items-center justify-center h-32 border rounded-md">
                      <div className="text-center">
                        <p className="text-muted-foreground">Configuration options for this plugin will be shown here.</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Configuration
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Plugin Information</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Version: {selectedPlugin.version}</p>
                      <p>Author: {selectedPlugin.author}</p>
                      <p>Downloads: {selectedPlugin.downloads.toLocaleString()}</p>
                      <p>Compatibility: {selectedPlugin.compatibility.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigureDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  alert("Plugin configuration saved!");
                  setIsConfigureDialogOpen(false);
                }}>
                  Save Configuration
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 