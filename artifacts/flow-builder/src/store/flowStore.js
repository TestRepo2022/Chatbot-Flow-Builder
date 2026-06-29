import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { NODE_TYPES_CONFIG } from '../lib/nodeConfig';
import { saveFlow as apiSaveFlow, getFlow, publishFlow as apiPublishFlow } from '../lib/api';

const MAX_SNAPSHOTS = 10;

function snapshotsKey(flowId) {
  return `fb_flow_${flowId}_history`;
}

function loadSnapshots(flowId) {
  try {
    const raw = localStorage.getItem(snapshotsKey(flowId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSnapshots(flowId, snapshots) {
  localStorage.setItem(snapshotsKey(flowId), JSON.stringify(snapshots));
}

const EMPTY_NODES = [];
const EMPTY_EDGES = [];

export const useFlowStore = create((set, get) => ({
  flowId: '',
  flowName: '',
  flowStatus: 'draft',
  flowDescription: '',
  lastSaved: null,
  isLoaded: false,

  nodes: EMPTY_NODES,
  edges: EMPTY_EDGES,
  selectedNodeId: null,
  copiedNode: null,

  history: [],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  versionSnapshots: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
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
      const newNode = {
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
      const newNode = {
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
    const newNode = {
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

  saveSnapshot: (trigger = 'auto', label) => {
    const { nodes, edges, flowName, versionSnapshots, flowId } = get();
    if (!flowId) return;
    const now = Date.now();
    const triggerLabels = { auto: 'Auto-save', manual: 'Manual save', publish: 'Published' };
    const newSnap = {
      id: `snap_${now}`,
      timestamp: now,
      label: label || `${triggerLabels[trigger] || 'Save'} — ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes,
      edges,
      flowName,
      trigger,
    };
    const updated = [newSnap, ...versionSnapshots].slice(0, MAX_SNAPSHOTS);
    persistSnapshots(flowId, updated);
    set({ versionSnapshots: updated });
  },

  restoreSnapshot: (snapshotId) => {
    const { versionSnapshots } = get();
    const snap = versionSnapshots.find((s) => s.id === snapshotId);
    if (!snap) return;
    set({
      nodes: snap.nodes,
      edges: snap.edges,
      selectedNodeId: null,
      history: [{ nodes: snap.nodes, edges: snap.edges, timestamp: Date.now() }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
    get().saveFlow();
  },

  deleteSnapshot: (snapshotId) => {
    const { versionSnapshots, flowId } = get();
    const updated = versionSnapshots.filter((s) => s.id !== snapshotId);
    persistSnapshots(flowId, updated);
    set({ versionSnapshots: updated });
  },

  loadFlow: (id) => {
    const flow = getFlow(id);
    if (!flow) return;
    const nodes = flow.nodes || [];
    const edges = flow.edges || [];
    set({
      flowId: flow.id,
      flowName: flow.name,
      flowStatus: flow.status || 'draft',
      flowDescription: flow.description || '',
      nodes,
      edges,
      selectedNodeId: null,
      copiedNode: null,
      history: [{ nodes, edges, timestamp: Date.now() }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
      versionSnapshots: loadSnapshots(flow.id),
      lastSaved: null,
      isLoaded: true,
    });
  },

  setFlowName: (name) => set({ flowName: name }),

  publishFlow: () => {
    const { flowId, nodes, edges, flowName, flowDescription } = get();
    if (!flowId) return;
    apiPublishFlow(flowId);
    set({ flowStatus: 'published', lastSaved: new Date() });
    apiSaveFlow({
      id: flowId,
      name: flowName,
      status: 'published',
      nodes,
      edges,
      description: flowDescription,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    get().saveSnapshot('publish');
  },

  saveAsDraft: () => {
    get().saveFlow();
    set({ flowStatus: 'draft' });
  },

  saveFlow: () => {
    const { flowId, flowName, flowStatus, nodes, edges, flowDescription } = get();
    if (!flowId) return;
    const existing = getFlow(flowId);
    apiSaveFlow({
      id: flowId,
      name: flowName,
      status: flowStatus,
      nodes,
      edges,
      description: flowDescription,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    });
    set({ lastSaved: new Date() });
  },

  exportJSON: () => {
    const { flowId, flowName, flowStatus, nodes, edges, flowDescription } = get();
    return {
      id: flowId,
      name: flowName,
      status: flowStatus,
      nodes,
      edges,
      description: flowDescription,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },

  importJSON: (json) => {
    set({
      flowId: json.id || `flow_${Date.now()}`,
      flowName: json.name || 'Imported Flow',
      flowStatus: json.status || 'draft',
      flowDescription: json.description || '',
      nodes: json.nodes || [],
      edges: json.edges || [],
      history: [{ nodes: json.nodes || [], edges: json.edges || [], timestamp: Date.now() }],
      historyIndex: 0,
      selectedNodeId: null,
      canUndo: false,
      canRedo: false,
      isLoaded: true,
    });
  },

  validateFlow: () => {
    const { nodes, edges } = get();
    const errors = [];

    const startNodes = nodes.filter((n) => n.type === 'startNode');
    if (startNodes.length === 0) errors.push('Flow must have a Start node');
    if (startNodes.length > 1) errors.push('Flow can only have one Start node');

    if (startNodes.length === 1) {
      const startConnected = edges.some((e) => e.source === startNodes[0].id);
      if (!startConnected) errors.push('Start node has no outgoing connections');
    }

    const connectedNodeIds = new Set();
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
