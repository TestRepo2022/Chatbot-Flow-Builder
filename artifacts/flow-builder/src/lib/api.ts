export interface FlowMeta {
  id: string;
  name: string;
  status: 'draft' | 'published';
  nodeCount: number;
  edgeCount: number;
  createdAt: number;
  updatedAt: number;
  description: string;
}

export interface FlowData {
  id: string;
  name: string;
  status: 'draft' | 'published';
  nodes: any[];
  edges: any[];
  createdAt: number;
  updatedAt: number;
  description: string;
}

export type FlowJSON = FlowData;

const FLOWS_LIST_KEY = 'fb_flows_list';

function flowDataKey(id: string) {
  return `fb_flow_${id}`;
}

function historyKey(id: string) {
  return `fb_flow_${id}_history`;
}

/* ── Flow list (meta only) ─────────────────────────────────────── */

export function getFlowList(): FlowMeta[] {
  try {
    const raw = localStorage.getItem(FLOWS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFlowList(list: FlowMeta[]) {
  localStorage.setItem(FLOWS_LIST_KEY, JSON.stringify(list));
}

function upsertMeta(data: FlowData) {
  const list = getFlowList();
  const idx = list.findIndex((f) => f.id === data.id);
  const meta: FlowMeta = {
    id: data.id,
    name: data.name,
    status: data.status,
    nodeCount: data.nodes?.length ?? 0,
    edgeCount: data.edges?.length ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    description: data.description || '',
  };
  if (idx >= 0) {
    list[idx] = meta;
  } else {
    list.unshift(meta);
  }
  setFlowList(list);
}

/* ── CRUD ──────────────────────────────────────────────────────── */

export function createFlow(name: string, description = ''): FlowData {
  const now = Date.now();
  const flow: FlowData = {
    id: `flow_${now}`,
    name,
    status: 'draft',
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
    description,
  };
  localStorage.setItem(flowDataKey(flow.id), JSON.stringify(flow));
  upsertMeta(flow);
  return flow;
}

export function getFlow(id: string): FlowData | null {
  try {
    const raw = localStorage.getItem(flowDataKey(id));
    if (raw) return JSON.parse(raw);
    // fallback: check legacy 'flows' key
    const legacy = localStorage.getItem('flows');
    if (legacy) {
      const arr = JSON.parse(legacy) as any[];
      const found = arr.find((f) => f.id === id);
      if (found) return { ...found, createdAt: Date.now(), updatedAt: Date.now(), description: '' };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveFlow(data: FlowData) {
  const now = Date.now();
  const updated: FlowData = { ...data, updatedAt: now };
  localStorage.setItem(flowDataKey(data.id), JSON.stringify(updated));
  upsertMeta(updated);
  return updated;
}

export function updateFlow(id: string, patch: Partial<FlowData>) {
  const existing = getFlow(id);
  if (existing) {
    saveFlow({ ...existing, ...patch });
  }
}

export function deleteFlow(id: string) {
  const list = getFlowList().filter((f) => f.id !== id);
  setFlowList(list);
  localStorage.removeItem(flowDataKey(id));
  localStorage.removeItem(historyKey(id));
}

export function cloneFlow(id: string): FlowData | null {
  const flow = getFlow(id);
  if (!flow) return null;
  const now = Date.now();
  const clone: FlowData = {
    ...flow,
    id: `flow_${now}`,
    name: `${flow.name} (Copy)`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  localStorage.setItem(flowDataKey(clone.id), JSON.stringify(clone));
  upsertMeta(clone);
  return clone;
}

export function renameFlow(id: string, name: string) {
  const flow = getFlow(id);
  if (flow) saveFlow({ ...flow, name });
}

export function publishFlow(id: string) {
  const flow = getFlow(id);
  if (flow) saveFlow({ ...flow, status: 'published' });
}

/* ── Import / Export ───────────────────────────────────────────── */

export function exportFlowJSON(id: string): string {
  const flow = getFlow(id);
  return JSON.stringify(flow || null, null, 2);
}

export function importFlowJSON(json: string): FlowData | null {
  try {
    const data = JSON.parse(json) as FlowData;
    const now = Date.now();
    const flow: FlowData = {
      ...data,
      id: data.id || `flow_${now}`,
      createdAt: data.createdAt || now,
      updatedAt: now,
      description: data.description || '',
    };
    localStorage.setItem(flowDataKey(flow.id), JSON.stringify(flow));
    upsertMeta(flow);
    return flow;
  } catch {
    return null;
  }
}

/* ── Legacy compatibility ──────────────────────────────────────── */

export function getFlows(): FlowData[] {
  return getFlowList().map((m) => getFlow(m.id)).filter(Boolean) as FlowData[];
}

export function saveNodes(flowId: string, nodes: any[]) {
  updateFlow(flowId, { nodes });
}

export function saveEdges(flowId: string, edges: any[]) {
  updateFlow(flowId, { edges });
}
