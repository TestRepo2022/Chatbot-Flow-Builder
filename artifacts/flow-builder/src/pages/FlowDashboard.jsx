import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  getFlowList, createFlow, saveFlow, deleteFlow, cloneFlow, renameFlow
} from '../lib/api';
import {
  Plus, Search, Zap, FileText, Copy, Trash2, Edit2,
  Check, X, Play, Square, MessageSquare, GitBranch,
  MoreHorizontal, Clock, Globe
} from 'lucide-react';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function StatusBadge({ status }) {
  if (status === 'published') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
        style={{ background: '#10b98122', color: '#10b981', border: '1px solid #10b98133' }}>
        <Globe size={9} /> Published
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }}>
      <FileText size={9} /> Draft
    </span>
  );
}

function FlowCard({ flow, onOpen, onRename, onDuplicate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(flow.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveName = () => {
    if (tempName.trim()) onRename(tempName.trim());
    setEditing(false);
  };

  const nodeIcons = [Play, MessageSquare, GitBranch, Square];
  const hue = (flow.id.charCodeAt(5) || 0) % 360;

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        background: 'hsl(var(--card))',
        border: '1.5px solid hsl(var(--border))',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `hsl(${hue} 70% 60% / 0.5)`;
        e.currentTarget.style.boxShadow = `0 8px 24px hsl(${hue} 70% 30% / 0.15)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'hsl(var(--border))';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
      }}
      onClick={() => !menuOpen && !editing && !confirmDelete && onOpen()}
      data-testid={`card-flow-${flow.id}`}
    >
      {/* Color header */}
      <div
        className="h-24 relative overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 15%), hsl(${(hue + 40) % 360} 70% 20%))` }}
      >
        <div className="flex items-center gap-2 opacity-60">
          {nodeIcons.map((Icon, i) => (
            <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `hsl(${hue} 70% 60% / 0.2)`, border: `1px solid hsl(${hue} 70% 60% / 0.2)` }}>
              <Icon size={14} style={{ color: `hsl(${hue} 80% 70%)` }} />
            </div>
          ))}
        </div>

        <div className="absolute bottom-2 right-2.5 flex items-center gap-2 text-[10px] font-medium"
          style={{ color: `hsl(${hue} 80% 80%)` }}>
          <span>{flow.nodeCount} nodes</span>
          <span className="opacity-40">·</span>
          <span>{flow.edgeCount} edges</span>
        </div>

        <div className="absolute top-2 left-2.5">
          <StatusBadge status={flow.status} />
        </div>

        <div className="absolute top-2 right-2.5">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
            style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
            data-testid={`button-menu-${flow.id}`}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-50 rounded-xl py-1.5 shadow-2xl w-40"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => { setMenuOpen(false); onOpen(); }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-2 text-foreground">
                <Zap size={12} /> Open
              </button>
              <button onClick={() => { setMenuOpen(false); setEditing(true); setTempName(flow.name); }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-2 text-foreground">
                <Edit2 size={12} /> Rename
              </button>
              <button onClick={() => { setMenuOpen(false); onDuplicate(); }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors flex items-center gap-2 text-foreground">
                <Copy size={12} /> Duplicate
              </button>
              <div className="my-1 mx-2" style={{ borderTop: '1px solid hsl(var(--border))' }} />
              <button onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-red-500/10 transition-colors flex items-center gap-2 text-red-400">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-1.5 mb-2" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false); }}
              className="flex-1 bg-transparent text-sm font-semibold outline-none border-b px-1"
              style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--foreground))' }}
              data-testid={`input-rename-${flow.id}`}
            />
            <button onClick={saveName} className="w-5 h-5 rounded flex items-center justify-center text-green-400"><Check size={12} /></button>
            <button onClick={() => setEditing(false)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground"><X size={11} /></button>
          </div>
        ) : (
          <h3 className="font-semibold text-sm text-foreground truncate mb-1">{flow.name}</h3>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock size={10} />
          <span>{timeAgo(flow.updatedAt)}</span>
        </div>
      </div>

      {confirmDelete && (
        <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
          <div className="rounded-lg p-3 space-y-2" style={{ background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.3)' }}>
            <p className="text-xs text-foreground font-medium">Delete "{flow.name}"?</p>
            <p className="text-[11px] text-muted-foreground">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={onDelete} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-white/5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateFlowModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), desc.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-96 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <div>
            <h2 className="font-semibold text-sm text-foreground">New Flow</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Create a new chatbot conversation flow</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/10">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Flow Name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Customer Support Bot"
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              data-testid="input-new-flow-name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description (optional)</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="What does this flow do?"
              className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
              style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
          </div>
        </div>

        <div className="px-5 py-4 flex gap-2 justify-end" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <button onClick={onClose} className="px-4 py-2 text-xs rounded-lg transition-colors"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-xs rounded-lg font-semibold transition-all disabled:opacity-40"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}
            data-testid="button-create-flow-confirm">
            <span className="flex items-center gap-1.5"><Plus size={12} /> Create Flow</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlowDashboard() {
  const [, setLocation] = useLocation();
  const [flows, setFlows] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const reload = () => setFlows(getFlowList());
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (getFlowList().length === 0) {
      const now = Date.now();
      const demo = createFlow('Welcome Bot', 'A simple greeter flow to get you started');
      saveFlow({
        ...demo,
        nodes: [
          { id: 'n1', type: 'startNode', position: { x: 200, y: 50 }, data: { label: 'Start' } },
          { id: 'n2', type: 'textMessage', position: { x: 160, y: 180 }, data: { label: 'Greeting', message: 'Hello! How can I help you today?' } },
          { id: 'n3', type: 'endNode', position: { x: 200, y: 340 }, data: { label: 'End', message: 'Thanks for chatting!' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
        ],
        updatedAt: now,
        createdAt: now,
      });
      reload();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return flows.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || f.status === filter;
      return matchSearch && matchFilter;
    });
  }, [flows, search, filter]);

  const handleCreate = (name, desc) => {
    const flow = createFlow(name, desc);
    reload();
    setLocation(`/flow/${flow.id}`);
  };

  const handleOpen = (id) => setLocation(`/flow/${id}`);

  const handleRename = (id, name) => {
    renameFlow(id, name);
    reload();
  };

  const handleDuplicate = (id) => {
    cloneFlow(id);
    reload();
  };

  const handleDelete = (id) => {
    deleteFlow(id);
    reload();
  };

  const totalPublished = flows.filter((f) => f.status === 'published').length;
  const totalDraft = flows.filter((f) => f.status === 'draft').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 px-6 h-14 flex items-center justify-between"
        style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}>
            FB
          </div>
          <span className="font-bold text-sm tracking-tight">Flow Builder</span>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'hsl(var(--primary))', color: 'white' }}
          data-testid="button-new-flow">
          <Plus size={13} /> New Flow
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">My Flows</h1>
          <p className="text-sm text-muted-foreground">
            {flows.length === 0
              ? 'Create your first chatbot flow to get started.'
              : `${flows.length} flow${flows.length !== 1 ? 's' : ''} · ${totalPublished} published · ${totalDraft} draft`}
          </p>
        </div>

        {flows.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Flows', value: flows.length, color: '#6366f1' },
              { label: 'Published', value: totalPublished, color: '#10b981' },
              { label: 'Drafts', value: totalDraft, color: '#64748b' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4"
                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flows..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              data-testid="input-search-flows"
            />
          </div>

          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
            {['all', 'draft', 'published'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 text-xs capitalize transition-colors"
                style={filter === f
                  ? { background: 'hsl(var(--primary))', color: 'white' }
                  : { background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))' }
                }
                data-testid={`button-filter-${f}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-2xl border-2 border-dashed h-48 flex flex-col items-center justify-center gap-3 transition-all"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--primary))'; e.currentTarget.style.color = 'hsl(var(--primary))'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
              data-testid="button-create-flow-card"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-current">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">New Flow</span>
            </button>

            {filtered.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                onOpen={() => handleOpen(flow.id)}
                onRename={(name) => handleRename(flow.id, name)}
                onDuplicate={() => handleDuplicate(flow.id)}
                onDelete={() => handleDelete(flow.id)}
              />
            ))}
          </div>
        ) : flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
              <Zap size={28} className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">No flows yet</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Create your first chatbot flow to start building conversations.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mt-2"
              style={{ background: 'hsl(var(--primary))', color: 'white' }}
              data-testid="button-create-first-flow">
              <Plus size={14} /> Create First Flow
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Search size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No flows match "{search}"</p>
            <button onClick={() => setSearch('')} className="text-xs text-primary hover:underline">Clear search</button>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateFlowModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
