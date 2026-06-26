import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { NODE_TYPES_CONFIG } from '../lib/nodeConfig';
import { updateFlow, saveNodes, saveEdges, publishFlow as apiPublishFlow } from '../lib/api';

export interface FlowJSON {
  id: string;
  name: string;
  status: 'draft' | 'published';
  nodes: Node[];
  edges: Edge[];
}

export interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

export interface FlowStore {
  flowId: string;
  flowName: string;
  flowStatus: 'draft' | 'published';
  lastSaved: Date | null;

  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  copiedNode: Node | null;

  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<any>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  duplicateNode: (id: string) => void;
  copyNode: (id: string) => void;
  pasteNode: () => void;
  addNode: (type: string, position: { x: number; y: number }) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  setFlowName: (name: string) => void;
  publishFlow: () => void;
  saveAsDraft: () => void;
  saveFlow: () => void;
  exportJSON: () => FlowJSON;
  importJSON: (json: FlowJSON) => void;
  validateFlow: () => { valid: boolean; errors: string[] };
}

const defaultInitialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'startNode',
    position: { x: 350, y: 80 },
    data: { label: 'Start' },
  },
  {
    id: 'text-1',
    type: 'textMessage',
    position: { x: 350, y: 220 },
    data: {
      label: 'Welcome Message',
      message: 'Hello! Welcome to our Travel Booking Bot. How can I help you today?',
      variables: [],
    },
  },
  {
    id: 'qr-1',
    type: 'quickReply',
    position: { x: 350, y: 400 },
    data: {
      label: 'Main Menu',
      message: 'Please select an option:',
      buttons: [
        { id: 'btn_1', text: 'Book a Flight' },
        { id: 'btn_2', text: 'Book Hotel' },
        { id: 'btn_3', text: 'View My Bookings' },
      ],
    },
  },
  {
    id: 'end-1',
    type: 'endNode',
    position: { x: 100, y: 600 },
    data: { label: 'End - Flight', message: 'Starting flight booking...' },
  },
  {
    id: 'end-2',
    type: 'endNode',
    position: { x: 350, y: 600 },
    data: { label: 'End - Hotel', message: 'Starting hotel booking...' },
  },
  {
    id: 'end-3',
    type: 'endNode',
    position: { x: 600, y: 600 },
    data: { label: 'End - Bookings', message: 'Loading your bookings...' },
  },
];

const defaultInitialEdges: Edge[] = [
  { id: 'e1', source: 'start-1', target: 'text-1', animated: true },
  { id: 'e2', source: 'text-1', target: 'qr-1' },
  { id: 'e3', source: 'qr-1', sourceHandle: 'btn_1', target: 'end-1' },
  { id: 'e4', source: 'qr-1', sourceHandle: 'btn_2', target: 'end-2' },
  { id: 'e5', source: 'qr-1', sourceHandle: 'btn_3', target: 'end-3' },
];

function loadSavedFlow(): { nodes: Node[]; edges: Edge[]; name: string; status: 'draft' | 'published' } {
  try {
    const saved = localStorage.getItem('flow_flow_1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        nodes: parsed.nodes || defaultInitialNodes,
        edges: parsed.edges || defaultInitialEdges,
        name: parsed.name || 'Travel Booking Bot',
        status: parsed.status || 'draft',
      };
    }
  } catch (_e) {
    // ignore
  }
  return {
    nodes: defaultInitialNodes,
    edges: defaultInitialEdges,
    name: 'Travel Booking Bot',
    status: 'draft',
  };
}

const saved = loadSavedFlow();

export const useFlowStore = create<FlowStore>((set, get) => ({
  flowId: 'flow_1',
  flowName: saved.name,
  flowStatus: saved.status,
  lastSaved: null,

  nodes: saved.nodes,
  edges: saved.edges,
  selectedNodeId: null,
  copiedNode: null,

  history: [{ nodes: saved.nodes, edges: saved.edges, timestamp: Date.now() }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    const newEdge = { ...connection, id: `e_${Date.now()}` };
    const edges = addEdge(newEdge, get().edges);
    set({ edges });
    get().pushHistory();
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    const nodes = get().nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    );
    set({ nodes });
  },

  deleteNode: (id) => {
    const { nodes, edges, selectedNodeId } = get();
    set({
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    });
    get().pushHistory();
  },

  deleteEdge: (id) => {
    set({ edges: get().edges.filter((e) => e.id !== id) });
    get().pushHistory();
  },

  duplicateNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (node) {
      const newNode: Node = {
        ...node,
        id: `node_${Date.now()}`,
        position: { x: node.position.x + 60, y: node.position.y + 60 },
        selected: false,
      };
      set({ nodes: [...get().nodes, newNode] });
      get().pushHistory();
    }
  },

  copyNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (node) set({ copiedNode: node });
  },

  pasteNode: () => {
    const { copiedNode } = get();
    if (copiedNode) {
      const newNode: Node = {
        ...copiedNode,
        id: `node_${Date.now()}`,
        position: { x: copiedNode.position.x + 80, y: copiedNode.position.y + 80 },
        selected: false,
      };
      set({ nodes: [...get().nodes, newNode] });
      get().pushHistory();
    }
  },

  addNode: (type, position) => {
    const config = NODE_TYPES_CONFIG.find((n) => n.type === type);
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { ...(config?.defaultData || { label: type }) },
    };
    set({ nodes: [...get().nodes, newNode] });
    get().pushHistory();
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges, timestamp: Date.now() });
    const trimmed = newHistory.slice(-50);
    set({
      history: trimmed,
      historyIndex: trimmed.length - 1,
      canUndo: trimmed.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({
        nodes: prev.nodes,
        edges: prev.edges,
        historyIndex: historyIndex - 1,
        canUndo: historyIndex - 1 > 0,
        canRedo: true,
        selectedNodeId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({
        nodes: next.nodes,
        edges: next.edges,
        historyIndex: historyIndex + 1,
        canUndo: true,
        canRedo: historyIndex + 1 < history.length - 1,
        selectedNodeId: null,
      });
    }
  },

  setFlowName: (name) => set({ flowName: name }),

  publishFlow: () => {
    const { flowId, nodes, edges, flowName } = get();
    apiPublishFlow(flowId);
    set({ flowStatus: 'published', lastSaved: new Date() });
    localStorage.setItem(`flow_${flowId}`, JSON.stringify({ id: flowId, name: flowName, status: 'published', nodes, edges }));
  },

  saveAsDraft: () => {
    get().saveFlow();
    set({ flowStatus: 'draft' });
  },

  saveFlow: () => {
    const { flowId, flowName, flowStatus, nodes, edges } = get();
    const data = { id: flowId, name: flowName, status: flowStatus, nodes, edges };
    localStorage.setItem(`flow_${flowId}`, JSON.stringify(data));
    updateFlow(flowId, data);
    set({ lastSaved: new Date() });
  },

  exportJSON: () => {
    const { flowId, flowName, flowStatus, nodes, edges } = get();
    return { id: flowId, name: flowName, status: flowStatus, nodes, edges };
  },

  importJSON: (json) => {
    set({
      flowId: json.id || `flow_${Date.now()}`,
      flowName: json.name || 'Imported Flow',
      flowStatus: json.status || 'draft',
      nodes: json.nodes || [],
      edges: json.edges || [],
      history: [{ nodes: json.nodes || [], edges: json.edges || [], timestamp: Date.now() }],
      historyIndex: 0,
      selectedNodeId: null,
      canUndo: false,
      canRedo: false,
    });
  },

  validateFlow: () => {
    const { nodes, edges } = get();
    const errors: string[] = [];

    const startNodes = nodes.filter((n) => n.type === 'startNode');
    if (startNodes.length === 0) errors.push('Flow must have a Start node');
    if (startNodes.length > 1) errors.push('Flow can only have one Start node');

    if (startNodes.length === 1) {
      const startConnected = edges.some((e) => e.source === startNodes[0].id);
      if (!startConnected) errors.push('Start node has no outgoing connections');
    }

    const connectedNodeIds = new Set<string>();
    edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    nodes.forEach((node) => {
      if (node.type === 'startNode' || node.type === 'endNode') return;
      if (!connectedNodeIds.has(node.id)) {
        errors.push(`Node "${node.data?.label || node.id}" is disconnected`);
      }
    });

    nodes.forEach((node) => {
      if (node.type === 'textMessage' && !node.data?.message) {
        errors.push(`Text Message "${node.data?.label}" has no message`);
      }
      if (node.type === 'apiRequest' && !node.data?.url) {
        errors.push(`API Request "${node.data?.label}" has no URL`);
      }
      if (node.type === 'conditionNode' && !node.data?.variable) {
        errors.push(`Condition "${node.data?.label}" has no variable set`);
      }
    });

    return { valid: errors.length === 0, errors };
  },
}));
