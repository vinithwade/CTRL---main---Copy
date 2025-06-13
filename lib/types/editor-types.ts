// Editor types for CTRL app

// Common types
export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Coordinates = Position & Size;

// Design Mode types
export type ElementType = 
  | 'text'
  | 'button'
  | 'input'
  | 'image'
  | 'video'
  | 'svg'
  | 'container'
  | 'vstack'
  | 'hstack'
  | 'zstack'
  | 'grid'
  | 'card'
  | 'columns';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type FontWeight = 'normal' | 'bold' | 'light' | 'medium' | 'semibold';
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export type ElementStyle = {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: number;
  margin?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: string;
  opacity?: number;
  zIndex?: number;
  boxShadow?: string;
  // Flex properties
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: number;
};

export interface DesignElement {
  id: string;
  type: ElementType;
  name: string;
  props: Record<string, unknown>;
  style: Partial<ElementStyle>;
  position: Position;
  size: Size;
  visible?: boolean;
  // Legacy properties for backward compatibility
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Logic Mode types
export type NodeType = 
  | 'state'
  | 'event'
  | 'action'
  | 'condition'
  | 'api'
  | 'database'
  | 'function';

export interface BaseNodeData {
  label: string;
  description?: string;
  color?: string;
}

export interface StateNodeData extends BaseNodeData {
  fields?: Record<string, unknown>;
  defaultValue?: unknown;
}

export interface ApiNodeData extends BaseNodeData {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint?: string;
  headers?: Record<string, string>;
  body?: string;
  auth?: boolean;
}

export interface DatabaseNodeData extends BaseNodeData {
  operation: 'read' | 'write' | 'update' | 'delete' | 'query';
  collection: string;
  provider: 'firebase' | 'supabase' | 'mongodb' | 'custom';
  query?: string;
}

export interface ConditionNodeData extends BaseNodeData {
  condition?: string;
  type?: 'if-else' | 'switch';
}

export interface FunctionNodeData extends BaseNodeData {
  code?: string;
  parameters?: string[];
  returnType?: string;
}

export interface EventNodeData extends BaseNodeData {
  eventType?: string;
  target?: string;
  debounceTime?: number;
}

export interface LogicNode {
  id: string;
  type: NodeType;
  name: string;
  position: Position;
  data: Record<string, unknown>;
}

export interface LogicEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: Record<string, unknown>;
}

// Code Mode types
export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  lastModified: Date;
}

export interface CodeProject {
  id: string;
  files: CodeFile[];
  rootDirectory: string;
}

export interface CodeSetting {
  tabSize: number;
  insertSpaces: boolean;
  formatOnSave: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  wordWrapColumn: number;
  lineNumbers: 'on' | 'off' | 'relative';
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'system';
}

// Project types
export type Platform = 'web' | 'mobile' | 'desktop';
export type Language = 'typescript' | 'javascript' | 'swift' | 'kotlin' | 'flutter';

export interface Project {
  id: string;
  name: string;
  description: string;
  designElements: DesignElement[];
  logicNodes: LogicNode[];
  logicEdges: LogicEdge[];
  codeFiles: CodeFile[];
} 