"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useEditorStore, LogicNode, LogicEdge } from "@/lib/store/editor-store";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  Connection,
  Handle,
  Position,
  Node,
  NodeChange,
  EdgeChange,
  NodeProps,
  EdgeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Database, 
  Globe, 
  Code, 
  Terminal,
  FileInput, 
  FileOutput,
  Timer,
  Mail,
  ListIcon,
  MessageSquare,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define interfaces for our node data types
interface NodeData {
  label: string;
  [key: string]: unknown;
}

interface StateNodeData extends NodeData {
  fields?: {
    value: string;
    [key: string]: unknown;
  };
}

interface ApiNodeData extends NodeData {
  method?: string;
  endpoint?: string;
}

interface ConditionNodeData extends NodeData {
  condition?: string;
}

interface FunctionNodeData extends NodeData {
  code?: string;
}

interface InputNodeData extends NodeData {
  inputType?: string;
}

interface EventNodeData extends NodeData {
  eventType?: string;
}

interface OutputNodeData extends NodeData {
  outputType?: string;
}

// Helper function to get bezier path
interface BezierPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
}

function getBezierPath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: BezierPathParams): [string] {
  const offset = 30;
  let path = '';

  if (sourcePosition === Position.Bottom && targetPosition === Position.Top) {
    const midY = sourceY + (targetY - sourceY) / 2;
    path = `M${sourceX},${sourceY} C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
  } else {
    path = `M${sourceX},${sourceY} C${sourceX + offset},${sourceY} ${targetX - offset},${targetY} ${targetX},${targetY}`;
  }

  return [path];
}

// Custom Edge
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
}: EdgeProps & {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}) => {
  const edgeStyles = {
    stroke: selected ? '#3b82f6' : '#b1b1b7',
    strokeWidth: selected ? 2 : 1,
    ...style,
  };

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      style={edgeStyles}
    />
  );
};

// Custom Node Types with proper typing
const StateNode = ({ data, id, selected }: NodeProps<StateNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <Database className="h-4 w-4 mr-2 text-blue-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
        {Object.entries(data.fields || {}).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span>{key}:</span>
            <span className="font-mono">{String(value)}</span>
          </div>
        ))}
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const ApiNode = ({ data, id, selected }: NodeProps<ApiNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-green-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <Globe className="h-4 w-4 mr-2 text-green-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="mt-2 text-xs">
        <div className="p-1 bg-gray-50 rounded">
          <span className="font-medium">{data.method || 'GET'} </span>
          <span className="font-mono">{data.endpoint || '/api'}</span>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const ConditionNode = ({ data, id, selected }: NodeProps<ConditionNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-amber-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <Terminal className="h-4 w-4 mr-2 text-amber-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
        {data.condition || 'value === true'}
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} id="true" className="w-2 h-2 !bg-green-500" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-2 h-2 !bg-red-500" style={{ left: '70%' }} />
    </div>
  );
};

const FunctionNode = ({ data, id, selected }: NodeProps<FunctionNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-purple-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <Code className="h-4 w-4 mr-2 text-purple-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono max-h-20 overflow-y-auto">
        {data.code || '// Write your function here'}
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const InputNode = ({ data, id, selected }: NodeProps<InputNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <FileInput className="h-4 w-4 mr-2 text-blue-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="mt-2 text-xs flex items-center gap-2">
        <span className="font-medium">Type:</span>
        <span>{data.inputType || 'text'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const OutputNode = ({ data, id, selected }: NodeProps<OutputNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-blue-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <FileOutput className="h-4 w-4 mr-2 text-blue-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
    </div>
  );
};

const EventNode = ({ data, id, selected }: NodeProps<EventNodeData>) => {
  const { updateLogicNode } = useEditorStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(id, { data: { ...data, label: e.target.value } });
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-red-500' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <Timer className="h-4 w-4 mr-2 text-red-500" />
        <input
          className="bg-transparent border-none outline-none p-0 text-sm font-medium w-full"
          value={data.label}
          onChange={handleNameChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="mt-2 text-xs bg-gray-50 p-1 rounded">
        <span>{data.eventType || 'onClick'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

// Node types and edge types need to be after component declarations
const nodeTypes: NodeTypes = {
  state: StateNode,
  api: ApiNode,
  condition: ConditionNode,
  function: FunctionNode,
  input: InputNode,
  output: OutputNode,
  event: EventNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Node type definitions with index signature for type safety
interface NodeTypeConfig {
  type: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  defaultData: Record<string, unknown>;
}

interface NodeTypesMap {
  [key: string]: NodeTypeConfig;
}

// Node type configurations
const NODE_TYPES: NodeTypesMap = {
  state: {
    type: 'state',
    label: 'State',
    icon: Database,
    defaultData: {
      fields: { value: '' },
    }
  },
  api: {
    type: 'api',
    label: 'API Call',
    icon: Globe,
    defaultData: {
      method: 'GET',
      endpoint: '/api',
    }
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    icon: Terminal,
    defaultData: {
      condition: 'value === true',
    }
  },
  function: {
    type: 'function',
    label: 'Function',
    icon: Code,
    defaultData: {
      code: '// Write your function here',
    }
  },
  input: {
    type: 'input',
    label: 'Input',
    icon: FileInput,
    defaultData: {
      inputType: 'text',
    }
  },
  output: {
    type: 'output',
    label: 'Output',
    icon: FileOutput,
    defaultData: {}
  },
  event: {
    type: 'event',
    label: 'Event',
    icon: Timer,
    defaultData: {
      eventType: 'onClick',
    }
  },
  notification: {
    type: 'function',
    label: 'Notification',
    icon: MessageSquare,
    defaultData: {
      code: 'showNotification("Message")',
    }
  },
  email: {
    type: 'function',
    label: 'Send Email',
    icon: Mail,
    defaultData: {
      code: 'sendEmail("user@example.com", "Subject", "Body")',
    }
  },
  loop: {
    type: 'function',
    label: 'Loop',
    icon: ListIcon,
    defaultData: {
      code: 'items.forEach(item => {\n  // Process item\n})',
    }
  },
};

// Flow Container Component
function FlowContainer() {
  const { 
    logicNodes, 
    logicEdges, 
    designElements,
    addLogicNode, 
    updateLogicNode, 
    removeLogicNode, 
    moveLogicNode, 
    addLogicEdge, 
    updateLogicEdge, 
    removeLogicEdge, 
    setSelectedNode 
  } = useEditorStore();
  
  const reactFlowInstance = useReactFlow();
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Synchronize design elements with logic nodes
  useEffect(() => {
    // Look for design elements that don't have corresponding logic nodes
    designElements.forEach(element => {
      const existingNode = logicNodes.find(node => 
        node.data.sourceElementId === element.id
      );
      
      if (!existingNode) {
        // Create a logic node for this design element
        const nodeType = getNodeTypeForElement(element.type);
        const newNode: LogicNode = {
          id: `node-${element.id}`,
          type: nodeType,
          position: { 
            x: element.position.x + 300, // Offset to avoid overlap 
            y: element.position.y 
          },
          data: {
            label: element.name,
            sourceElementId: element.id,
            elementType: element.type,
            // Properties specific to node type
            ...(nodeType === 'state' && { 
              fields: { 
                visible: element.visible !== undefined ? element.visible : true,
                position: `x: ${element.position?.x || 0}, y: ${element.position?.y || 0}`,
                size: `width: ${element.size?.width || 100}, height: ${element.size?.height || 100}`
              } 
            }),
            ...(nodeType === 'event' && { 
              eventType: 'onClick',
              target: element.id
            }),
          }
        };
        
        addLogicNode(newNode);
      }
    });
    
    // Clean up logic nodes that reference deleted design elements
    logicNodes.forEach(node => {
      if (node.data.sourceElementId) {
        const designElement = designElements.find(el => el.id === node.data.sourceElementId);
        if (!designElement) {
          removeLogicNode(node.id);
        }
      }
    });
  }, [designElements, logicNodes]);

  // Define node types
  const nodeTypes = useMemo<NodeTypes>(() => ({
    state: StateNode,
    api: ApiNode,
    condition: ConditionNode,
    function: FunctionNode,
    input: InputNode,
    output: OutputNode,
    event: EventNode
  }), []);
  
  // Define edge types
  const edgeTypes = useMemo<EdgeTypes>(() => ({
    default: CustomEdge,
  }), []);
  
  // Convert store nodes to react-flow nodes with proper typing
  const nodes = useMemo(() => 
    logicNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      selected: node.id === selectedNodeId
    }))
  , [logicNodes, selectedNodeId]);
  
  // Convert store edges to react-flow edges
  const edges = useMemo(() => 
    logicEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default',
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: edge.data,
      selected: false
    }))
  , [logicEdges]);
  
  // Handle node click
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedNode(node.id);
  };
  
  // Handle pane click (deselect)
  const handlePaneClick = () => {
    setSelectedNodeId(null);
    setSelectedNode(null);
  };
  
  // Handle node dragging
  const handleNodeDragStop = (_: React.MouseEvent, node: Node) => {
    moveLogicNode(node.id, node.position.x, node.position.y);
  };
  
  // Handle connecting nodes
  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    addLogicEdge({
      id: `edge-${uuidv4()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    });
  };
  
  // Handle node changes (position)
  const handleNodesChange = (changes: NodeChange[]) => {
    // Already handled by other callbacks
  };
  
  // Handle edge changes (selection, removal)
  const handleEdgesChange = (changes: EdgeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'remove') {
        removeLogicEdge(change.id);
      }
    });
  };
  
  // Helper function to determine the appropriate node type for a design element
  const getNodeTypeForElement = (elementType: string): string => {
    switch (elementType) {
      case 'button':
        return 'event';
      case 'input':
        return 'input';
      case 'text':
        return 'output';
      case 'container':
      case 'card':
      case 'vstack':
      case 'hstack':
      case 'grid':
        return 'state';
      default:
        return 'state';
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left sidebar: Node types */}
      <div className="w-64 border-r flex flex-col">
        <div className="border-b px-3 py-2">
          <h3 className="text-sm font-medium">Node Types</h3>
        </div>
        
        <div className="p-3 space-y-1 flex-1 overflow-auto">
          {Object.entries(NODE_TYPES).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedNodeType === key ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => {
                setSelectedNodeType(key);
              }}
            >
              {config.icon && React.createElement(config.icon, {
                className: "mr-2 h-4 w-4",
              })}
              {config.label}
            </Button>
          ))}
          
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Templates</h3>
            <Button 
              variant="outline" 
              className="w-full text-sm mb-2"
              onClick={() => setDialogOpen(true)}
            >
              Load Template
            </Button>
          </div>
        </div>
        
        {selectedNodeId && dialogOpen && (
          <div className="border-t">
            <div className="p-3">
              <h3 className="text-sm font-medium mb-2">Node Properties</h3>
              <NodePropertiesEditor nodeId={selectedNodeId} />
            </div>
          </div>
        )}
      </div>
      
      {/* Main content: Flow canvas */}
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          className="bg-background"
        >
          <Controls className="bg-background border rounded-md shadow-md" />
          <MiniMap 
            className="bg-background border rounded-md shadow-md !right-3 !bottom-16" 
            nodeColor="#8a8a8a"
            maskColor="rgba(0, 0, 0, 0.05)"
          />
          <Background gap={16} color="#99999922" />
          
          {/* Template dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
                <DialogDescription>
                  Select a template to quickly create a common logic flow pattern.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-3 py-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => applyTemplate('api-fetch', setDialogOpen)}
                >
                  <div>
                    <h3 className="font-medium">API Data Fetch</h3>
                    <p className="text-sm text-muted-foreground">Load and handle data from an API endpoint with error handling</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => applyTemplate('form-submit', setDialogOpen)}
                >
                  <div>
                    <h3 className="font-medium">Form Submission</h3>
                    <p className="text-sm text-muted-foreground">Form validation and submission flow with error handling</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => applyTemplate('auth-flow', setDialogOpen)}
                >
                  <div>
                    <h3 className="font-medium">Authentication Flow</h3>
                    <p className="text-sm text-muted-foreground">Login authentication with token handling and navigation</p>
                  </div>
                </Button>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Instructional overlay when no nodes exist */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="bg-background/95 p-8 rounded-lg shadow-lg border text-center max-w-md">
              <h3 className="text-xl font-medium mb-2">Logic Editor</h3>
              <p className="text-muted-foreground mb-4">
                Create visual logic flows for your application by adding nodes and connecting them.
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-2">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">State</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-2">
                    <Terminal className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">Logic</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">API</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setSelectedNodeType('state');
                  }}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Add State Node
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setSelectedNodeType('event');
                  }}
                >
                  <Timer className="mr-2 h-4 w-4" />
                  Add Event Node
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start col-span-2"
                  onClick={() => setDialogOpen(true)}
                >
                  <FileInput className="mr-2 h-4 w-4" />
                  Load a Template
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Pro tip: Right-click on the canvas to add the selected node type
              </p>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

// Node Properties Editor Panel with modern dark theme
function NodePropertiesEditor({ nodeId }: { nodeId: string }) {
  const { logicNodes, updateLogicNode, removeLogicNode } = useEditorStore();
  
  const node = logicNodes.find(node => node.id === nodeId);
  if (!node) return null;
  
  const handleUpdateLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLogicNode(nodeId, { data: { ...node.data, label: e.target.value } });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-gray-400">Node Name</Label>
        <Input 
          value={node.data.label as string || ''} 
          onChange={handleUpdateLabel}
          className="h-8 mt-1 bg-[#252525] border-[#444] text-white"
        />
      </div>
      
      {/* State node fields */}
      {node.type === 'state' && (
        <div>
          <Label className="text-xs text-gray-400">State Value</Label>
          <Input 
            value={(node.data.fields as Record<string, string>)?.value || ''} 
            onChange={e => updateLogicNode(nodeId, { 
              data: { 
                ...node.data, 
                fields: {...(node.data.fields || {}), value: e.target.value }
              } 
            })} 
            className="h-8 mt-1 bg-[#252525] border-[#444] text-white"
          />
        </div>
      )}
      
      {/* API node fields */}
      {node.type === 'api' && (
        <>
          <div>
            <Label className="text-xs text-gray-400">Method</Label>
            <Select 
              value={(node.data.method as string) || 'GET'} 
              onValueChange={value => updateLogicNode(nodeId, { 
                data: { 
                  ...node.data, 
                  method: value 
                } 
              })}
            >
              <SelectTrigger className="h-8 mt-1 bg-[#252525] border-[#444] text-white">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-[#444] text-white">
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Endpoint</Label>
            <Input 
              value={(node.data.endpoint as string) || ''} 
              onChange={e => updateLogicNode(nodeId, { 
                data: { 
                  ...node.data, 
                  endpoint: e.target.value 
                } 
              })} 
              className="h-8 mt-1 bg-[#252525] border-[#444] text-white"
            />
          </div>
        </>
      )}
      
      {/* Condition node fields */}
      {node.type === 'condition' && (
        <div>
          <Label className="text-xs text-gray-400">Condition</Label>
          <Input 
            value={(node.data.condition as string) || ''} 
            onChange={e => updateLogicNode(nodeId, { 
              data: { 
                ...node.data, 
                condition: e.target.value 
              } 
            })} 
            className="h-8 mt-1 bg-[#252525] border-[#444] text-white"
          />
        </div>
      )}
      
      {/* Function node fields */}
      {node.type === 'function' && (
        <div>
          <Label className="text-xs text-gray-400">Code</Label>
          <Textarea 
            value={(node.data.code as string) || ''} 
            onChange={e => updateLogicNode(nodeId, { 
              data: { 
                ...node.data, 
                code: e.target.value 
              } 
            })} 
            className="h-28 mt-1 font-mono text-xs bg-[#252525] border-[#444] text-white"
          />
        </div>
      )}
      
      {/* Event node fields */}
      {node.type === 'event' && (
        <div>
          <Label className="text-xs text-gray-400">Event Type</Label>
          <Select 
            value={(node.data.eventType as string) || 'onClick'} 
            onValueChange={value => updateLogicNode(nodeId, { 
              data: { 
                ...node.data, 
                eventType: value 
              } 
            })}
          >
            <SelectTrigger className="h-8 mt-1 bg-[#252525] border-[#444] text-white">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#444] text-white">
              <SelectItem value="onClick">onClick</SelectItem>
              <SelectItem value="onChange">onChange</SelectItem>
              <SelectItem value="onSubmit">onSubmit</SelectItem>
              <SelectItem value="onLoad">onLoad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Input node fields */}
      {node.type === 'input' && (
        <div>
          <Label className="text-xs text-gray-400">Input Type</Label>
          <Select 
            value={(node.data.inputType as string) || 'text'} 
            onValueChange={value => updateLogicNode(nodeId, { 
              data: { 
                ...node.data, 
                inputType: value 
              } 
            })}
          >
            <SelectTrigger className="h-8 mt-1 bg-[#252525] border-[#444] text-white">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#444] text-white">
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="password">Password</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Common node actions */}
      <div className="pt-2 flex justify-end">
        <Button 
          size="sm" 
          variant="destructive"
          onClick={() => removeLogicNode(nodeId)}
          className="h-8 bg-red-600 hover:bg-red-700 text-white"
        >
          Delete Node
        </Button>
      </div>
    </div>
  );
}

// Define the applyTemplate function
function applyTemplate(templateName: string, setDialogOpen: (open: boolean) => void) {
  // Implementation for template application would go here
  console.log(`Applying template: ${templateName}`);
  setDialogOpen(false);
}

export default function LogicMode() {
  return (
    <ReactFlowProvider>
      <FlowContainer />
    </ReactFlowProvider>
  );
} 