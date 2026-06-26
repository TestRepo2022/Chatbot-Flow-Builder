export interface FlowJSON {
  id: string;
  name: string;
  status: 'draft' | 'published';
  nodes: any[];
  edges: any[];
}

export function createFlow(name: string): FlowJSON {
  const newFlow: FlowJSON = {
    id: `flow_${Date.now()}`,
    name,
    status: 'draft',
    nodes: [],
    edges: [],
  };
  updateFlow(newFlow.id, newFlow);
  return newFlow;
}

export function updateFlow(id: string, data: Partial<FlowJSON>) {
  const flows = getFlows();
  const index = flows.findIndex(f => f.id === id);
  if (index >= 0) {
    flows[index] = { ...flows[index], ...data };
  } else {
    flows.push({ id, ...data } as FlowJSON);
  }
  localStorage.setItem('flows', JSON.stringify(flows));
}

export function deleteFlow(id: string) {
  const flows = getFlows();
  localStorage.setItem('flows', JSON.stringify(flows.filter(f => f.id !== id)));
}

export function getFlow(id: string): FlowJSON | undefined {
  return getFlows().find(f => f.id === id);
}

export function getFlows(): FlowJSON[] {
  const flowsStr = localStorage.getItem('flows');
  return flowsStr ? JSON.parse(flowsStr) : [];
}

export function saveNodes(flowId: string, nodes: any[]) {
  updateFlow(flowId, { nodes });
}

export function saveEdges(flowId: string, edges: any[]) {
  updateFlow(flowId, { edges });
}

export function publishFlow(id: string) {
  updateFlow(id, { status: 'published' });
}

export function cloneFlow(id: string) {
  const flow = getFlow(id);
  if (flow) {
    createFlow(`${flow.name} (Copy)`);
  }
}

export function exportFlowJSON(id: string): string {
  const flow = getFlow(id);
  return JSON.stringify(flow || null, null, 2);
}

export function importFlowJSON(json: string): FlowJSON | null {
  try {
    const data = JSON.parse(json);
    updateFlow(data.id, data);
    return data;
  } catch (e) {
    return null;
  }
}
