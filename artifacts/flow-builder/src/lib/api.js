const FLOWS_LIST_KEY = 'fb_flows_list';

function flowDataKey(id) {
  return `fb_flow_${id}`;
}

function historyKey(id) {
  return `fb_flow_${id}_history`;
}

export function getFlowList() {
  try {
    const raw = localStorage.getItem(FLOWS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFlowList(list) {
  localStorage.setItem(FLOWS_LIST_KEY, JSON.stringify(list));
}

function upsertMeta(data) {
  const list = getFlowList();
  const idx = list.findIndex((f) => f.id === data.id);
  const meta = {
    id: data.id,
    name: data.name,
    status: data.status || 'draft',
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

export function createFlow(name = 'Untitled Flow', description = '') {
  const now = Date.now();
  const flow = {
    id: `flow_${now}`,
    name,
    description,
    status: 'draft',
    nodes: [],
    edges: [],
    createdAt: now,
    updatedAt: now,
  };
  localStorage.setItem(flowDataKey(flow.id), JSON.stringify(flow));
  upsertMeta(flow);
  return flow;
}

export function getFlow(id) {
  try {
    const raw = localStorage.getItem(flowDataKey(id));
    if (raw) return JSON.parse(raw);
    return null;
  } catch {
    return null;
  }
}

export function saveFlow(data) {
  const now = Date.now();
  const updated = { ...data, updatedAt: now };
  localStorage.setItem(flowDataKey(data.id), JSON.stringify(updated));
  upsertMeta(updated);
  return updated;
}

export function updateFlow(id, patch) {
  const existing = getFlow(id);
  if (existing) {
    saveFlow({ ...existing, ...patch });
  }
}

export function deleteFlow(id) {
  const list = getFlowList().filter((f) => f.id !== id);
  setFlowList(list);
  localStorage.removeItem(flowDataKey(id));
  localStorage.removeItem(historyKey(id));
}

export function cloneFlow(id) {
  const flow = getFlow(id);
  if (!flow) return null;
  const now = Date.now();
  const clone = {
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

export function renameFlow(id, name) {
  const flow = getFlow(id);
  if (flow) saveFlow({ ...flow, name });
}

export function publishFlow(id) {
  const flow = getFlow(id);
  if (flow) saveFlow({ ...flow, status: 'published' });
}

export function exportFlowJSON(id) {
  const flow = getFlow(id);
  return JSON.stringify(flow || null, null, 2);
}

export function importFlowJSON(json) {
  try {
    const data = JSON.parse(json);
    const now = Date.now();
    const flow = {
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

export function getFlows() {
  return getFlowList().map((m) => getFlow(m.id)).filter(Boolean);
}
