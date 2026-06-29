import { useEffect, useCallback, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '../../store/flowStore';
import { ComponentPanel } from './ComponentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ValidationModal } from './ValidationModal';
import { HistoryPanel } from './HistoryPanel';
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
  Moon, Sun, Edit2, Check, History, ChevronLeft
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
  const [, setLocation] = useLocation();
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    selectedNodeId, selectNode, deleteNode, deleteEdge,
    copyNode, pasteNode, undo, redo, canUndo, canRedo,
    addNode, flowName, flowStatus, lastSaved, setFlowName,
    saveFlow, publishFlow, validateFlow, exportJSON, importJSON, saveSnapshot,
  } = useFlowStore();

  const reactFlowInstance = useReactFlow();
  const [darkMode, setDarkMode] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(flowName);
  const [validationResult, setValidationResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const autoSaveRef = useRef(null);
  const importRef = useRef(null);

  const versionSnapshots = useFlowStore((s) => s.versionSnapshots);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveFlow();
    }, 2000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [nodes, edges, saveFlow]);

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (!isInput) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedNodeId) deleteNode(selectedNodeId);
        }
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
        if (e.key === 'c' && selectedNodeId && !isInput) { e.preventDefault(); copyNode(selectedNodeId); }
        if (e.key === 'v' && !isInput) { e.preventDefault(); pasteNode(); }
        if (e.key === 's') { e.preventDefault(); saveFlow(); saveSnapshot('manual'); }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, deleteNode, undo, redo, copyNode, pasteNode, saveFlow, saveSnapshot]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
    addNode(type, position);
  }, [reactFlowInstance, addNode]);

  const onNodeClick = useCallback((_, node) => {
    selectNode(node.id);
    setShowHistory(false);
  }, [selectNode]);

  const onEdgeClick = useCallback((_, edge) => {
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

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result);
        importJSON(json);
      } catch (_) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleValidate = () => {
    setValidationResult(validateFlow());
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
      <header
        className="flex items-center gap-3 px-4 h-12 flex-shrink-0 z-20"
        style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => { saveFlow(); setLocation('/'); }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Back to dashboard"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="w-px h-4" style={{ background: 'hsl(var(--border))' }} />
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
              />
              <button onClick={saveName} className="w-5 h-5 rounded flex items-center justify-center text-green-400 hover:bg-green-500/10">
                <Check size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setTempName(flowName); setEditingName(true); }}
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors group"
            >
              {flowName}
              <Edit2 size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </button>
          )}

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

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/5"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/5"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
          <span className="text-[10px] text-muted-foreground ml-2">{lastSavedText}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={() => { setShowHistory(!showHistory); selectNode(null); }}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
            style={
              showHistory
                ? { background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }
                : { color: 'hsl(var(--muted-foreground))' }
            }
            title="Version history"
          >
            <History size={13} />
            History
            {versionSnapshots.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: 'hsl(var(--primary))', color: 'white' }}
              >
                {versionSnapshots.length}
              </span>
            )}
          </button>

          <div className="w-px h-4" style={{ background: 'hsl(var(--border))' }} />

          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Import JSON"
          >
            <Upload size={13} />
            Import
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Export JSON"
          >
            <Download size={13} />
            Export
          </button>

          <button
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Validate flow"
          >
            <CheckCircle size={13} />
            Validate
          </button>

          <div className="w-px h-4" style={{ background: 'hsl(var(--border))' }} />

          <button
            onClick={() => { saveFlow(); saveSnapshot('manual'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
            title="Save draft (Ctrl+S)"
          >
            <Save size={13} />
            Save
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}
          >
            <Zap size={13} />
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 flex-shrink-0 overflow-hidden" style={{ borderRight: '1px solid hsl(var(--border))' }}>
          <ComponentPanel />
        </aside>

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
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="hsl(var(--border))" />
            <Controls position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => {
                const colors = {
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

          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground px-3 py-1.5 rounded-full pointer-events-none"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            Delete — remove node &nbsp;·&nbsp; Ctrl+Z — undo &nbsp;·&nbsp; Ctrl+C/V — copy/paste &nbsp;·&nbsp; Drag from panel to add nodes
          </div>
        </div>

        {(showHistory || selectedNodeId) && (
          <aside className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: '1px solid hsl(var(--border))' }}>
            {showHistory
              ? <HistoryPanel onClose={() => setShowHistory(false)} />
              : <PropertiesPanel />
            }
          </aside>
        )}
      </div>

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
