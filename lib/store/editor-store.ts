import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EditorMode = 'design' | 'logic' | 'code';

export type DesignElement = {
  id: string;
  type: string;
  name: string;
  props: Record<string, unknown>;
  children?: string[];
  parent?: string | null;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    padding?: number;
    margin?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    boxShadow?: string;
    textAlign?: string;
  };
  position: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string;
  src?: string;
  alt?: string;
  zIndex?: number;
  // Legacy properties for backward compatibility
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type LogicNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

export type LogicEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
};

export type CodeFile = {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
};

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  platform: string;
  language: string;
};

interface EditorState {
  // Project info
  projectId: string | null;
  projectName: string;
  projectDescription: string;
  projectPlatform: string;
  projectLanguage: string;

  // Mode switching
  currentMode: EditorMode;
  setCurrentMode: (mode: EditorMode) => void;

  // Design mode
  designElements: DesignElement[];
  selectedElementId: string | null;
  setSelectedElement: (id: string | null) => void;
  addDesignElement: (element: DesignElement) => void;
  updateDesignElement: (id: string, updates: Partial<DesignElement>) => void;
  removeDesignElement: (id: string) => void;
  moveDesignElement: (id: string, x: number, y: number) => void;
  resizeDesignElement: (id: string, width: number, height: number) => void;

  // Logic mode
  logicNodes: LogicNode[];
  logicEdges: LogicEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  addLogicNode: (node: LogicNode) => void;
  updateLogicNode: (id: string, updates: Partial<LogicNode>) => void;
  removeLogicNode: (id: string) => void;
  moveLogicNode: (id: string, x: number, y: number) => void;
  addLogicEdge: (edge: LogicEdge) => void;
  updateLogicEdge: (id: string, updates: Partial<LogicEdge>) => void;
  removeLogicEdge: (id: string) => void;

  // Code mode
  codeFiles: CodeFile[];
  currentFileId: string | null;
  setCurrentFile: (id: string | null) => void;
  addCodeFile: (file: CodeFile) => void;
  updateCodeFile: (id: string, updates: Partial<CodeFile>) => void;
  removeCodeFile: (id: string) => void;

  // Project data loading
  setProjectData: (data: ProjectData) => void;
  clearEditorState: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      // Project info
      projectId: null,
      projectName: '',
      projectDescription: '',
      projectPlatform: '',
      projectLanguage: '',

      // Mode switching
      currentMode: 'design',
      setCurrentMode: (mode) => set({ currentMode: mode }),

      // Design mode
      designElements: [],
      selectedElementId: null,
      setSelectedElement: (id) => set({ selectedElementId: id }),
      addDesignElement: (element) => 
        set((state) => ({ designElements: [...state.designElements, element] })),
      updateDesignElement: (id, updates) => 
        set((state) => ({
          designElements: state.designElements.map((el) => 
            el.id === id ? { ...el, ...updates } : el
          )
        })),
      removeDesignElement: (id) => 
        set((state) => ({
          designElements: state.designElements.filter((el) => el.id !== id)
        })),
      moveDesignElement: (id, x, y) => 
        set((state) => ({
          designElements: state.designElements.map((el) => 
            el.id === id ? { ...el, x, y } : el
          )
        })),
      resizeDesignElement: (id, width, height) => 
        set((state) => ({
          designElements: state.designElements.map((el) => 
            el.id === id ? { ...el, width, height } : el
          )
        })),

      // Logic mode
      logicNodes: [],
      logicEdges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setSelectedEdge: (id) => set({ selectedEdgeId: id }),
      addLogicNode: (node) => 
        set((state) => ({ logicNodes: [...state.logicNodes, node] })),
      updateLogicNode: (id, updates) => 
        set((state) => ({
          logicNodes: state.logicNodes.map((node) => 
            node.id === id ? { ...node, ...updates } : node
          )
        })),
      removeLogicNode: (id) => 
        set((state) => ({
          logicNodes: state.logicNodes.filter((node) => node.id !== id),
          // Also remove any edges connected to this node
          logicEdges: state.logicEdges.filter(
            (edge) => edge.source !== id && edge.target !== id
          )
        })),
      moveLogicNode: (id, x, y) => 
        set((state) => ({
          logicNodes: state.logicNodes.map((node) => 
            node.id === id ? { ...node, position: { x, y } } : node
          )
        })),
      addLogicEdge: (edge) => 
        set((state) => ({ logicEdges: [...state.logicEdges, edge] })),
      updateLogicEdge: (id, updates) => 
        set((state) => ({
          logicEdges: state.logicEdges.map((edge) => 
            edge.id === id ? { ...edge, ...updates } : edge
          )
        })),
      removeLogicEdge: (id) => 
        set((state) => ({
          logicEdges: state.logicEdges.filter((edge) => edge.id !== id)
        })),

      // Code mode
      codeFiles: [],
      currentFileId: null,
      setCurrentFile: (id) => set({ currentFileId: id }),
      addCodeFile: (file) => 
        set((state) => ({ codeFiles: [...state.codeFiles, file] })),
      updateCodeFile: (id, updates) => 
        set((state) => ({
          codeFiles: state.codeFiles.map((file) => 
            file.id === id ? { ...file, ...updates } : file
          )
        })),
      removeCodeFile: (id) => 
        set((state) => ({
          codeFiles: state.codeFiles.filter((file) => file.id !== id),
          currentFileId: state.currentFileId === id ? null : state.currentFileId
        })),

      // Project data loading
      setProjectData: (data) => {
        set({
          projectId: data.id,
          projectName: data.name,
          projectDescription: data.description,
          projectPlatform: data.platform,
          projectLanguage: data.language,
        });
      },
      clearEditorState: () => {
        set({
          projectId: null,
          projectName: '',
          projectDescription: '',
          projectPlatform: '',
          projectLanguage: '',
          currentMode: 'design',
          designElements: [],
          selectedElementId: null,
          logicNodes: [],
          logicEdges: [],
          selectedNodeId: null,
          selectedEdgeId: null,
          codeFiles: [],
          currentFileId: null,
        });
      },
    }),
    {
      name: 'ctrl-editor-storage',
    }
  )
); 