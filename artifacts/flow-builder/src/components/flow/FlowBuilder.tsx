import { useEffect, useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '../../store/flowStore';
import { ComponentPanel } from './ComponentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ValidationModal } from './ValidationModal';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { TextMessageNode } from './nodes/TextMessageNode';
import { MediaMessageNode } from './nodes/MediaMessageNode';
import { QuickReplyNode } from './nodes/QuickReplyNode';
import { ConditionNode } from './nodes/ConditionNode';
import {
  ListMessageNode,
  WhatsappFormNode,
  UserInputNode,
  AskQuestionNode,
  AskLocationNode,
  AskAddressNode,
  ApiRequestNode,
  ConnectFlowNode,
} from './nodes/GenericNode';
import {
  Save, Upload, Download, CheckCircle, Zap, Undo2, Redo2,
  Moon, Sun, Edit2, Check
} from 'lucide-react';

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  textMessage: TextMessageNode,
  mediaMessage: MediaMessageNode,
  quickReply: QuickReplyNode,
  conditionNode: ConditionNode,
  listMessage: ListMessageNode,
  whatsappForm: WhatsappFormNode,
  userInput: UserInputNode,
  askQuestion: AskQuestionNode,
  askLocation: AskLocationNode,
  askAddress: AskAddressNode,
  apiRequest: ApiRequestNode,
  connectFlow: ConnectFlowNode,
};

function FlowBuilderInner() {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    selectedNodeId, selectNode, deleteNode, deleteEdge,
    copyNode, pasteNode, undo, redo, canUndo, canRedo,
    addNode, flowName, flowStatus, lastSaved, setFlowName,
    saveFlow, publishFlow, validateFlow, exportJSON, importJSON,
  } = useFlowStore();

  const reactFlowInstance = useReactFlow();
  const [darkMode, setDarkMode] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(flowName);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-save every 2s (debounced)
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveFlow();
    }, 2000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [nodes, edges, saveFlow]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (!isInput) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedNodeId) {
            deleteNode(selectedNodeId);
          }
        }
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
        if (e.key === 'c' && selectedNodeId && !isInput) {
          e.preventDefault();
          copyNode(selectedNodeId);
        }
        if (e.key === 'v' && !isInput) {
          e.preventDefault();
          pasteNode();
        }
        if (e.key === 's') {
          e.preventDefault();
          saveFlow();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, deleteNode, undo, redo, copyNode, pasteNode, saveFlow]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
    addNode(type, position);
  }, [reactFlowInstance, addNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    if (window.confirm('Delete this connection?')) {
      deleteEdge(edge.id);
    }
  }, [deleteEdge]);

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleExport = () => {
    const data = exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        importJSON(json);
      } catch (_) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleValidate = () => {
    const result = validateFlow();
    setValidationResult(result);
  };

  const handlePublish = () => {
    const result = validateFlow();
    if (!result.valid) {
      setValidationResult(result);
    } else {
      publishFlow();
    }
  };

  const saveName = () => {
    setFlowName(tempName);
    setEditingName(false);
  };

  const lastSavedText = lastSaved
    ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Not saved yet';

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* ── TOP TOOLBAR ─────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-4 h-12 flex-shrink-0 z-20"
        style={{
          background: 'hsl(var(--card))',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        {/* Logo + Flow Name */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}
          >
            FB
          </div>
          {editingName ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="text-sm font-semibold bg-transparent outline-none border-b px-1"
                style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--foreground))', width: Math.max(120, tempName.length * 8) + 'px' }}
                data-testid="input-flow-name"
              />
              <button onClick={saveName} className="w-5 h-5 rounded flex items-center justify-center text-green-400 hover:bg-green-500/10">
                <Check size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setTempName(flowName); setEditingName(true); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors group"
              data-testid="button-edit-flow-name"
            >
              {flowName}
              <Edit2 size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </button>
          )}

          {/* Status badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={
              flowStatus === 'published'
                ? { background: '#10b98122', color: '#10b981', border: '1px solid #10b98133' }
                : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }
            }
          >
            {flowStatus}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Center: undo/redo + last saved */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/5"
            title="Undo (Ctrl+Z)"
            data-testid="button-undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/5"
            title="Redo (Ctrl+Y)"
            data-testid="button-redo"
          >
            <Redo2 size={14} />
          </button>
          <span className="text-[10px] text-muted-foreground ml-2">{lastSavedText}</span>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Toggle dark mode"
            data-testid="button-toggle-dark-mode"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <div className="w-px h-4" style={{ background: 'hsl(var(--border))' }} />

          {/* Import */}
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Import JSON"
            data-testid="button-import"
          >
            <Upload size={13} />
            Import
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Export JSON"
            data-testid="button-export"
          >
            <Download size={13} />
            Export
          </button>

          {/* Validate */}
          <button
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Validate flow"
            data-testid="button-validate"
          >
            <CheckCircle size={13} />
            Validate
          </button>

          <div className="w-px h-4" style={{ background: 'hsl(var(--border))' }} />

          {/* Save Draft */}
          <button
            onClick={saveFlow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
            title="Save draft (Ctrl+S)"
            data-testid="button-save"
          >
            <Save size={13} />
            Save
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}
            data-testid="button-publish"
          >
            <Zap size={13} />
            Publish
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside
          className="w-56 flex-shrink-0 overflow-hidden"
          style={{ borderRight: '1px solid hsl(var(--border))' }}
        >
          <ComponentPanel />
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: 'hsl(239 84% 67% / 0.6)' },
              animated: false,
            }}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={null}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Shift"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.5}
              color="hsl(var(--border))"
            />
            <Controls position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => {
                const colors: Record<string, string> = {
                  startNode: '#10b981', endNode: '#64748b',
                  textMessage: '#6366f1', mediaMessage: '#8b5cf6',
                  quickReply: '#f59e0b', listMessage: '#06b6d4',
                  whatsappForm: '#ec4899', conditionNode: '#f97316',
                  userInput: '#14b8a6', askQuestion: '#3b82f6',
                  askLocation: '#ef4444', askAddress: '#84cc16',
                  apiRequest: '#a855f7', connectFlow: '#0ea5e9',
                };
                return colors[n.type || ''] || '#6366f1';
              }}
              maskColor="hsl(var(--background) / 0.8)"
            />
          </ReactFlow>

          {/* Canvas keyboard shortcut hint */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground px-3 py-1.5 rounded-full pointer-events-none"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            Delete — remove node &nbsp;·&nbsp; Ctrl+Z — undo &nbsp;·&nbsp; Ctrl+C/V — copy/paste &nbsp;·&nbsp; Drag from panel to add nodes
          </div>
        </div>

        {/* Right Panel */}
        {selectedNodeId && (
          <aside
            className="w-72 flex-shrink-0 overflow-hidden"
            style={{ borderLeft: '1px solid hsl(var(--border))' }}
          >
            <PropertiesPanel />
          </aside>
        )}
      </div>

      {/* Validation Modal */}
      {validationResult && (
        <ValidationModal
          result={validationResult}
          onClose={() => setValidationResult(null)}
          onPublish={publishFlow}
        />
      )}
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
