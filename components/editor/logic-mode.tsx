"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
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
  ConnectionLineType,
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
  Save
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
    selectedNodeId, 
    setSelectedNode,
    addLogicNode,
    removeLogicNode,
    addLogicEdge,
    removeLogicEdge,
  } = useEditorStore();

  const [edges, setEdges] = useState<LogicEdge[]>([]);
  const [nodes, setNodes] = useState<LogicNode[]>([]);
  const [nodeType, setNodeType] = useState<string>('state');
  const [isAddingNode, setIsAddingNode] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showNodeEditor, setShowNodeEditor] = useState<boolean>(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  // Map store nodes to ReactFlow nodes
  useEffect(() => {
    setNodes(
      logicNodes.map((node) => ({
        ...node,
        type: node.type || 'state',
        data: node.data || { label: 'Node' },
      }))
    );
  }, [logicNodes]);
  
  // Map store edges to ReactFlow edges
  useEffect(() => {
    setEdges(
      logicEdges.map((edge) => ({
        ...edge,
        type: 'default',
        animated: true,
      }))
    );
  }, [logicEdges]);
  
  // On connection handler
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: LogicEdge = {
        id: `e-${uuidv4()}`,
        source: connection.source || '',
        target: connection.target || '',
        type: 'default',
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        data: {}
      };
      
      addLogicEdge(newEdge);
    },
    [addLogicEdge]
  );
  
  // On node selection handler
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: LogicNode) => {
      setSelectedNode(node.id);
      setShowNodeEditor(true);
    },
    [setSelectedNode]
  );
  
  // On edge selection handler
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: LogicEdge) => {
      // Handle edge selection
    },
    []
  );
  
  // On pane click handler - deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowNodeEditor(false);
  }, [setSelectedNode]);
  
  // Add node at position
  const addNodeToFlow = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const nodeConfig = nodeTypes[type as keyof typeof nodeTypes] ? NODE_TYPES[type] : NODE_TYPES.state;
      
      const id = `node-${uuidv4()}`;
      const newNode: LogicNode = {
        id,
        type: nodeConfig.type,
        position,
        data: { ...nodeConfig.defaultData, label: `${nodeConfig.label} ${nodes.length + 1}` },
      };
      
      addLogicNode(newNode);
      setSelectedNode(id);
      setShowNodeEditor(true);
      setIsAddingNode(false);
    },
    [addLogicNode, setSelectedNode, nodes.length]
  );
  
  // Apply a predefined template flow
  const applyTemplate = useCallback((templateName: string) => {
    // Clear existing nodes and edges
    nodes.forEach(node => removeLogicNode(node.id));
    edges.forEach(edge => removeLogicEdge(edge.id));
    
    let templateNodes: LogicNode[] = [];
    let templateEdges: LogicEdge[] = [];
    
    // Create different templates based on name
    switch (templateName) {
      case 'api-fetch':
        // Template for API data fetching flow
        templateNodes = [
          {
            id: 'node-1',
            type: 'event',
            position: { x: 250, y: 50 },
            data: { label: 'Component Mount', eventType: 'mount' }
          },
          {
            id: 'node-2',
            type: 'state',
            position: { x: 250, y: 150 },
            data: { label: 'Loading State', fields: { value: 'true' } }
          },
          {
            id: 'node-3',
            type: 'api',
            position: { x: 250, y: 250 },
            data: { label: 'Fetch Data', method: 'GET', endpoint: '/api/data' }
          },
          {
            id: 'node-4',
            type: 'condition',
            position: { x: 250, y: 350 },
            data: { label: 'API Success?', condition: 'response.ok === true' }
          },
          {
            id: 'node-5',
            type: 'state',
            position: { x: 100, y: 450 },
            data: { label: 'Error State', fields: { message: 'Failed to fetch data' } }
          },
          {
            id: 'node-6',
            type: 'state',
            position: { x: 400, y: 450 },
            data: { label: 'Data State', fields: { items: '[]' } }
          },
          {
            id: 'node-7',
            type: 'state',
            position: { x: 250, y: 550 },
            data: { label: 'Loading Complete', fields: { value: 'false' } }
          }
        ];
        
        templateEdges = [
          { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
          { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
          { id: 'edge-3', source: 'node-3', target: 'node-4', type: 'default' },
          { id: 'edge-4', source: 'node-4', target: 'node-5', type: 'default', sourceHandle: 'false' },
          { id: 'edge-5', source: 'node-4', target: 'node-6', type: 'default', sourceHandle: 'true' },
          { id: 'edge-6', source: 'node-5', target: 'node-7', type: 'default' },
          { id: 'edge-7', source: 'node-6', target: 'node-7', type: 'default' }
        ];
        break;
        
      case 'form-submit':
        // Template for form submission flow
        templateNodes = [
          {
            id: 'node-1',
            type: 'event',
            position: { x: 250, y: 50 },
            data: { label: 'Form Submit', eventType: 'submit' }
          },
          {
            id: 'node-2',
            type: 'state',
            position: { x: 250, y: 150 },
            data: { label: 'Form Data', fields: { name: '', email: '' } }
          },
          {
            id: 'node-3',
            type: 'function',
            position: { x: 250, y: 250 },
            data: { label: 'Validate Form', code: 'return name.length > 0 && email.includes("@")' }
          },
          {
            id: 'node-4',
            type: 'condition',
            position: { x: 250, y: 350 },
            data: { label: 'Is Valid?', condition: 'result === true' }
          },
          {
            id: 'node-5',
            type: 'state',
            position: { x: 100, y: 450 },
            data: { label: 'Error State', fields: { message: 'Please fill all fields correctly' } }
          },
          {
            id: 'node-6',
            type: 'api',
            position: { x: 400, y: 450 },
            data: { label: 'Submit Form', method: 'POST', endpoint: '/api/form' }
          }
        ];
        
        templateEdges = [
          { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
          { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
          { id: 'edge-3', source: 'node-3', target: 'node-4', type: 'default' },
          { id: 'edge-4', source: 'node-4', target: 'node-5', type: 'default', sourceHandle: 'false' },
          { id: 'edge-5', source: 'node-4', target: 'node-6', type: 'default', sourceHandle: 'true' }
        ];
        break;
        
      case 'auth-flow':
        // Template for authentication flow
        templateNodes = [
          {
            id: 'node-1',
            type: 'event',
            position: { x: 250, y: 50 },
            data: { label: 'Login Button Click', eventType: 'click' }
          },
          {
            id: 'node-2',
            type: 'api',
            position: { x: 250, y: 150 },
            data: { label: 'Login API', method: 'POST', endpoint: '/api/auth/login' }
          },
          {
            id: 'node-3',
            type: 'condition',
            position: { x: 250, y: 250 },
            data: { label: 'Login Success?', condition: 'response.token !== undefined' }
          },
          {
            id: 'node-4',
            type: 'state',
            position: { x: 100, y: 350 },
            data: { label: 'Error State', fields: { message: 'Invalid login credentials' } }
          },
          {
            id: 'node-5',
            type: 'state',
            position: { x: 400, y: 350 },
            data: { label: 'Auth State', fields: { token: 'response.token', user: 'response.user' } }
          },
          {
            id: 'node-6',
            type: 'function',
            position: { x: 400, y: 450 },
            data: { label: 'Navigate', code: 'navigate("/dashboard")' }
          }
        ];
        
        templateEdges = [
          { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'default' },
          { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'default' },
          { id: 'edge-3', source: 'node-3', target: 'node-4', type: 'default', sourceHandle: 'false' },
          { id: 'edge-4', source: 'node-3', target: 'node-5', type: 'default', sourceHandle: 'true' },
          { id: 'edge-5', source: 'node-5', target: 'node-6', type: 'default' }
        ];
        break;
    }
    
    // Add template nodes and edges to the flow
    templateNodes.forEach(node => addLogicNode(node));
    templateEdges.forEach(edge => addLogicEdge(edge));
    
    setShowTemplates(false);
  }, [addLogicNode, addLogicEdge, removeLogicNode, removeLogicEdge, nodes, edges]);
  
  // Handle pane right click
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      
      if (reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const position = screenToFlowPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        
        if (isAddingNode) {
          addNodeToFlow(nodeType, position);
        }
      }
    },
    [isAddingNode, addNodeToFlow, nodeType, screenToFlowPosition]
  );
  
  // Setup default zoom on load
  const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

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
              variant={nodeType === key ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => {
                setNodeType(key);
                setIsAddingNode(true);
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
              onClick={() => setShowTemplates(true)}
            >
              Load Template
            </Button>
          </div>
        </div>
        
        {selectedNodeId && showNodeEditor && (
          <div className="border-t">
            <div className="p-3">
              <h3 className="text-sm font-medium mb-2">Node Properties</h3>
              <NodePropertiesEditor nodeId={selectedNodeId} />
            </div>
          </div>
        )}
      </div>
      
      {/* Main content: Flow canvas */}
      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
          connectionLineType={ConnectionLineType.Bezier}
          fitView
          attributionPosition="bottom-right"
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
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
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
                  onClick={() => applyTemplate('api-fetch')}
                >
                  <div>
                    <h3 className="font-medium">API Data Fetch</h3>
                    <p className="text-sm text-muted-foreground">Load and handle data from an API endpoint with error handling</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => applyTemplate('form-submit')}
                >
                  <div>
                    <h3 className="font-medium">Form Submission</h3>
                    <p className="text-sm text-muted-foreground">Form validation and submission flow with error handling</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => applyTemplate('auth-flow')}
                >
                  <div>
                    <h3 className="font-medium">Authentication Flow</h3>
                    <p className="text-sm text-muted-foreground">Login authentication with token handling and navigation</p>
                  </div>
                </Button>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTemplates(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Instructional overlay when no nodes exist */}
          {nodes.length === 0 && (
            <Panel position="center" className="bg-background/95 p-8 rounded-lg shadow-lg border text-center max-w-md">
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
                    setNodeType('state');
                    setIsAddingNode(true);
                  }}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Add State Node
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setNodeType('event');
                    setIsAddingNode(true);
                  }}
                >
                  <Timer className="mr-2 h-4 w-4" />
                  Add Event Node
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start col-span-2"
                  onClick={() => setShowTemplates(true)}
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

          {/* Adding node hint */}
          {isAddingNode && (
            <Panel position="bottom-center" className="bg-background rounded-full shadow-lg border py-2 px-4 mb-2">
              <div className="flex items-center text-sm">
                <div className="mr-2 px-2 py-0.5 bg-primary/10 rounded text-primary text-xs font-medium">
                  Adding {nodeType} node
                </div>
                Right-click on the canvas to place the node
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 px-2" 
                  onClick={() => setIsAddingNode(false)}
                >
                  Cancel
                </Button>
              </div>
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

export default function LogicMode() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-medium">Logic Editor</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Timer className="h-4 w-4 mr-2" />
            Auto Layout
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 h-full">
        <ReactFlowProvider>
          <FlowContainer />
        </ReactFlowProvider>
      </div>
    </div>
  );
} 