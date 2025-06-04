"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProjectData } from "@/lib/utils";
import { AlertCircle, ChevronRight, CloudOff, Github, Globe, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FiCheck, FiAlertCircle } from "react-icons/fi";

interface DeploymentProps {
  project: ProjectData;
}

// Define platform-specific deployment types
type DeploymentPlatform = "vercel" | "netlify" | "firebase" | "github" | "custom";

interface DeploymentConfig {
  platform: DeploymentPlatform;
  status: "idle" | "configuring" | "building" | "deploying" | "success" | "failed";
  url?: string;
  lastDeployed?: Date;
  error?: string;
  buildLogs?: string[];
}

// Update the type for deployment history records
interface DeploymentHistoryRecord {
  id: string;
  provider: string;
  status: string;
  timestamp: string;
  url?: string;
}

export default function Deployment({ project }: DeploymentProps) {
  const [activeTab, setActiveTab] = useState<DeploymentPlatform>("vercel");
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    platform: "vercel",
    status: "idle",
    buildLogs: [],
  });
  const [deployProgress, setDeployProgress] = useState(0);
  const [githubRepo, setGithubRepo] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [apiKey, setApiKey] = useState("");
  const activeProvider = activeTab;
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistoryRecord[]>([]);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentSuccess, setDeploymentSuccess] = useState<boolean>(false);

  // Compute deployment status once
  const isDeploying = ['configuring', 'building', 'deploying'].includes(deploymentConfig.status);

  // Simulate deployment process
  const handleDeploy = () => {
    // Reset state
    setDeploymentConfig({
      ...deploymentConfig,
      status: "configuring",
      error: undefined,
      buildLogs: ["Starting deployment process..."],
    });
    setDeployProgress(10);

    // Simulate configuration step
    setTimeout(() => {
      setDeploymentConfig(prev => ({
        ...prev,
        status: "building",
        buildLogs: [...(prev.buildLogs || []), "Configuration complete", "Building project..."],
      }));
      setDeployProgress(30);

      // Simulate build step
      setTimeout(() => {
        setDeploymentConfig(prev => ({
          ...prev,
          status: "deploying",
          buildLogs: [
            ...(prev.buildLogs || []),
            "Build complete",
            "Optimizing assets...",
            "Running tests...",
            "Tests passed",
            "Starting deployment...",
          ],
        }));
        setDeployProgress(75);

        // Simulate deployment completion
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% chance of success for demo
          if (success) {
            setDeploymentConfig(prev => ({
              ...prev,
              status: "success",
              lastDeployed: new Date(),
              url: getDeploymentUrl(activeTab, customDomain),
              buildLogs: [...(prev.buildLogs || []), "Deployment successful!"],
            }));
            setDeployProgress(100);
          } else {
            setDeploymentConfig(prev => ({
              ...prev,
              status: "failed",
              error: "Failed to deploy: Server responded with an error",
              buildLogs: [...(prev.buildLogs || []), "Error: Deployment failed"],
            }));
            setDeployProgress(100);
          }
        }, 2000);
      }, 2000);
    }, 1500);
  };

  // Helper function to generate deployment URLs
  const getDeploymentUrl = (platform: DeploymentPlatform, customDomain?: string): string => {
    if (customDomain && customDomain.trim()) {
      return `https://${customDomain}`;
    }

    const projectSlug = project.name.toLowerCase().replace(/\s+/g, "-");
    
    switch (platform) {
      case "vercel":
        return `https://${projectSlug}.vercel.app`;
      case "netlify":
        return `https://${projectSlug}.netlify.app`;
      case "firebase":
        return `https://${projectSlug}.web.app`;
      case "github":
        return `https://${githubRepo.split('/')[0]}.github.io/${projectSlug}`;
      default:
        return `https://example.com/${projectSlug}`;
    }
  };

  const getPlatformName = (platform: DeploymentPlatform): string => {
    switch (platform) {
      case "vercel": return "Vercel";
      case "netlify": return "Netlify";
      case "firebase": return "Firebase Hosting";
      case "github": return "GitHub Pages";
      case "custom": return "Custom Server";
      default: return platform;
    }
  };
  
  // Mock deployment providers commented out for future use
  // const providers = [
  //   { id: "vercel", name: "Vercel", logo: <FiCloudLightning className="w-5 h-5" /> },
  //   { id: "netlify", name: "Netlify", logo: <FiGlobe className="w-5 h-5" /> },
  //   { id: "aws", name: "AWS Amplify", logo: <FiServer className="w-5 h-5" /> },
  //   { id: "firebase", name: "Firebase", logo: <FiDatabase className="w-5 h-5" /> },
  // ];
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDeploy = async (provider: string) => {
    setDeploymentError(null);
    setDeploymentSuccess(false);
    
    // Simulate deployment process
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        setDeploymentSuccess(true);
        setDeploymentHistory([
          {
            id: Date.now().toString(),
            provider: activeProvider,
            status: "success",
            timestamp: new Date().toISOString(),
            url: `https://${project.name.toLowerCase().replace(/\s+/g, '-')}.${activeProvider === 'firebase' ? 'web.app' : activeProvider + '.app'}`,
          },
          ...deploymentHistory,
        ]);
      } else {
        setDeploymentError("Deployment failed. Please check your configuration and try again.");
      }
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment</h2>
          <p className="text-muted-foreground">Deploy your project to production</p>
        </div>
        {deploymentConfig.status === "success" && deploymentConfig.url && (
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => window.open(deploymentConfig.url, '_blank')}
          >
            <Globe className="h-4 w-4" />
            <span>View Site</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DeploymentPlatform)}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="vercel">Vercel</TabsTrigger>
          <TabsTrigger value="netlify">Netlify</TabsTrigger>
          <TabsTrigger value="firebase">Firebase</TabsTrigger>
          <TabsTrigger value="github">GitHub Pages</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vercel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy to Vercel</CardTitle>
              <CardDescription>
                Deploy your project to Vercel for global CDN distribution, CI/CD, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vercel-token">Vercel API Token</Label>
                <Input 
                  id="vercel-token" 
                  type="password" 
                  placeholder="••••••••••••••••••••••" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create a token in your Vercel account settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vercel-domain">Custom Domain (Optional)</Label>
                <Input 
                  id="vercel-domain" 
                  placeholder="myapp.com" 
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                {deploymentConfig.lastDeployed && (
                  <span className="text-muted-foreground">
                    Last deployed: {deploymentConfig.lastDeployed.toLocaleString()}
                  </span>
                )}
              </div>
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? "Deploying..." : "Deploy to Vercel"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="netlify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy to Netlify</CardTitle>
              <CardDescription>
                Deploy your project to Netlify for continuous deployment and serverless functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="netlify-token">Netlify API Token</Label>
                <Input 
                  id="netlify-token" 
                  type="password" 
                  placeholder="••••••••••••••••••••••" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="netlify-domain">Custom Domain (Optional)</Label>
                <Input 
                  id="netlify-domain" 
                  placeholder="myapp.com" 
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                {deploymentConfig.lastDeployed && (
                  <span className="text-muted-foreground">
                    Last deployed: {deploymentConfig.lastDeployed.toLocaleString()}
                  </span>
                )}
              </div>
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? "Deploying..." : "Deploy to Netlify"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="firebase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy to Firebase Hosting</CardTitle>
              <CardDescription>
                Deploy your project to Firebase Hosting for fast CDN hosting with Google Cloud.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firebase-token">Firebase CI Token</Label>
                <Input 
                  id="firebase-token" 
                  type="password" 
                  placeholder="••••••••••••••••••••••" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Generate a token using Firebase CLI: firebase login:ci
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firebase-project">Firebase Project ID</Label>
                <Input 
                  id="firebase-project" 
                  placeholder="my-awesome-project" 
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                {deploymentConfig.lastDeployed && (
                  <span className="text-muted-foreground">
                    Last deployed: {deploymentConfig.lastDeployed.toLocaleString()}
                  </span>
                )}
              </div>
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? "Deploying..." : "Deploy to Firebase"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="github" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy to GitHub Pages</CardTitle>
              <CardDescription>
                Deploy your project to GitHub Pages for static site hosting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-repo">GitHub Repository</Label>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="github-repo" 
                    placeholder="username/repository" 
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                <Input 
                  id="github-token" 
                  type="password" 
                  placeholder="ghp_••••••••••••••••••" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Token needs workflow and repo permissions
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                {deploymentConfig.lastDeployed && (
                  <span className="text-muted-foreground">
                    Last deployed: {deploymentConfig.lastDeployed.toLocaleString()}
                  </span>
                )}
              </div>
              <Button onClick={handleDeploy} disabled={isDeploying || !githubRepo}>
                {isDeploying ? "Deploying..." : "Deploy to GitHub Pages"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Deployment</CardTitle>
              <CardDescription>
                Generate deployment artifacts for manual deployment to your own server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deploy-method">Deployment Method</Label>
                <select 
                  id="deploy-method"
                  className="w-full p-2 rounded-md border border-input bg-background"
                >
                  <option value="ftp">FTP Upload</option>
                  <option value="ssh">SSH/SFTP</option>
                  <option value="zip">Download ZIP Package</option>
                  <option value="docker">Docker Image</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server-info">Server Information</Label>
                <Input 
                  id="server-info" 
                  placeholder="hostname or IP address" 
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
              </div>
              
              <Alert variant="outline" className="bg-muted">
                <Server className="h-4 w-4" />
                <AlertTitle>Custom deployments</AlertTitle>
                <AlertDescription>
                  Custom deployments require additional configuration based on your server setup.
                  Make sure your server meets the requirements for your project type.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                {deploymentConfig.lastDeployed && (
                  <span className="text-muted-foreground">
                    Last generated: {deploymentConfig.lastDeployed.toLocaleString()}
                  </span>
                )}
              </div>
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? "Building..." : "Generate Deployment"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Deployment Status Section */}
      {deploymentConfig.status !== "idle" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Deployment Status
              </CardTitle>
              <Badge 
                variant={
                  deploymentConfig.status === "success" ? "success" :
                  deploymentConfig.status === "failed" ? "destructive" :
                  "outline"
                }
                className="capitalize"
              >
                {deploymentConfig.status}
              </Badge>
            </div>
            <CardDescription>
              Deploying to {getPlatformName(activeTab)}
              {customDomain && ` • ${customDomain}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isDeploying && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Deployment progress</span>
                  <span>{deployProgress}%</span>
                </div>
                <Progress value={deployProgress} className="h-2" />
              </div>
            )}
            
            {deploymentConfig.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deployment Failed</AlertTitle>
                <AlertDescription>
                  {deploymentConfig.error}
                </AlertDescription>
              </Alert>
            )}
            
            {deploymentConfig.status === "success" && (
              <Alert variant="default" className="bg-primary/10 text-primary border-primary">
                <FiCheck className="h-4 w-4" />
                <AlertTitle>Deployment Successful</AlertTitle>
                <AlertDescription>
                  Your project is live at{" "}
                  <a 
                    href={deploymentConfig.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    {deploymentConfig.url}
                  </a>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-md border bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Build & Deployment Logs</h3>
              </div>
              <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
                {deploymentConfig.buildLogs?.map((log, index) => (
                  <div key={index} className="py-0.5">
                    {log}
                  </div>
                ))}
                {isDeploying && <div className="animate-pulse">_</div>}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            {deploymentConfig.status === "failed" && (
              <Button variant="outline" onClick={handleDeploy} className="mr-2">
                Retry
              </Button>
            )}
            <Button 
              variant="ghost" 
              className="ml-auto"
              onClick={() => {
                setDeploymentConfig({
                  ...deploymentConfig,
                  status: "idle",
                  buildLogs: [],
                });
                setDeployProgress(0);
              }}
            >
              Clear
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Empty state if no deployment yet */}
      {deploymentConfig.status === "idle" && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-10">
            <CloudOff className="h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Deployments Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Your project hasn&apos;t been deployed yet. Configure your deployment settings and deploy your project to make it publicly accessible.
            </p>
          </CardContent>
        </Card>
      )}
      
      {deploymentSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <FiCheck className="w-5 h-5" />
          <div>
            <p className="font-medium">Deployment successful!</p>
            <p className="text-sm">Your application is now live at{' '}
              <a 
                href={`https://${project.name.toLowerCase().replace(/\s+/g, '-')}.${activeTab === 'firebase' ? 'web.app' : activeTab + '.app'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {project.name.toLowerCase().replace(/\s+/g, '-')}.{activeTab === 'firebase' ? 'web.app' : activeTab + '.app'}
              </a>
            </p>
          </div>
        </div>
      )}
      
      {deploymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <FiAlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Deployment failed</p>
            <p className="text-sm">{deploymentError}</p>
          </div>
        </div>
      )}
      
      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>
            Past deployments of your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deploymentHistory.length > 0 ? (
            <div className="space-y-3">
              {deploymentHistory.map((deployment) => (
                <div 
                  key={deployment.id} 
                  className="p-3 border rounded-lg flex items-center justify-between mb-2"
                >
                  <div>
                    <div className="font-medium">{deployment.provider}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(deployment.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <a 
                    href={deployment.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary text-sm hover:underline flex items-center"
                  >
                    View Deployment <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-md">
              <p className="text-muted-foreground">No deployments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Deploy your project to see deployment history
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Custom Domain Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>
            Connect your own domain to your deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-domain">Domain Name</Label>
            <div className="flex gap-2">
              <Input
                id="custom-domain"
                placeholder="example.com"
              />
              <Button variant="secondary">Add Domain</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your domain name without http:// or https://
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">DNS Configuration</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Once you add a domain, you&apos;ll need to configure your DNS settings with your domain provider:
            </p>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2 py-1 border-b">
                <div className="font-medium">Type</div>
                <div className="font-medium">Name</div>
                <div className="font-medium">Value</div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <div>A</div>
                <div>@</div>
                <div>76.76.21.21</div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <div>CNAME</div>
                <div>www</div>
                <div>cname.{activeTab}.app</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 