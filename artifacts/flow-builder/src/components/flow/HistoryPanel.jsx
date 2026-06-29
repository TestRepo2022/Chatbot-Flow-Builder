import { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { History, RotateCcw, Trash2, X, Clock, GitCommit, Zap, Save } from 'lucide-react';

function relativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const s = Math.floor(diff / 1000);
  if (s < 10) return 'Just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function absoluteTime(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const triggerMeta = {
  auto:    { label: 'Auto-save',  icon: GitCommit, color: '#6366f1' },
  manual:  { label: 'Manual save', icon: Save,      color: '#10b981' },
  publish: { label: 'Published',   icon: Zap,        color: '#f59e0b' },
};

export function HistoryPanel({ onClose }) {
  const { versionSnapshots, restoreSnapshot, deleteSnapshot, saveSnapshot } = useFlowStore();
  const [confirmId, setConfirmId] = useState(null);
  const [restoreId, setRestoreId] = useState(null);

  const handleRestore = (id) => {
    restoreSnapshot(id);
    setRestoreId(null);
  };

  const handleDelete = (id) => {
    deleteSnapshot(id);
    setConfirmId(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--sidebar))' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <History size={15} className="text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Version History</div>
          <div className="text-[10px] text-muted-foreground">{versionSnapshots.length} / 10 snapshots</div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Save current button */}
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <button
          onClick={() => saveSnapshot('manual')}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary) / 0.25)' }}
        >
          <Save size={12} /> Save current version
        </button>
      </div>

      {/* Snapshot list */}
      <div className="flex-1 overflow-y-auto">
        {versionSnapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <Clock size={24} className="text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">No snapshots yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">Save or publish your flow to create a version snapshot.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
            {versionSnapshots.map((snap, idx) => {
              const meta = triggerMeta[snap.trigger] || triggerMeta.manual;
              const Icon = meta.icon;
              const isFirst = idx === 0;

              return (
                <div
                  key={snap.id}
                  className="px-3 py-3 transition-colors hover:bg-white/3"
                  style={isFirst ? { background: 'hsl(var(--primary) / 0.05)' } : {}}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: meta.color + '22' }}>
                      <Icon size={13} style={{ color: meta.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium text-foreground truncate">{snap.label}</span>
                        {isFirst && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{relativeTime(snap.timestamp)}</span>
                        <span className="opacity-40">·</span>
                        <span>{absoluteTime(snap.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{snap.nodeCount} nodes</span>
                        <span className="opacity-40">·</span>
                        <span>{snap.edgeCount} connections</span>
                      </div>

                      {/* Restore confirm */}
                      {restoreId === snap.id ? (
                        <div className="mt-2 rounded-lg p-2.5 space-y-2"
                          style={{ background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
                          <p className="text-[11px] text-foreground">Restore this version? Current canvas will be replaced.</p>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRestore(snap.id)}
                              className="flex-1 py-1.5 rounded text-[11px] font-semibold"
                              style={{ background: 'hsl(var(--primary))', color: 'white' }}>
                              Restore
                            </button>
                            <button onClick={() => setRestoreId(null)}
                              className="flex-1 py-1.5 rounded text-[11px] text-muted-foreground hover:bg-white/5">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : confirmId === snap.id ? (
                        <div className="mt-2 rounded-lg p-2.5 space-y-2"
                          style={{ background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.2)' }}>
                          <p className="text-[11px] text-foreground">Delete this snapshot?</p>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleDelete(snap.id)}
                              className="flex-1 py-1.5 rounded text-[11px] font-semibold bg-red-500 text-white">
                              Delete
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="flex-1 py-1.5 rounded text-[11px] text-muted-foreground hover:bg-white/5">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => setRestoreId(snap.id)}
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors hover:bg-white/5"
                            style={{ color: 'hsl(var(--primary))' }}
                          >
                            <RotateCcw size={10} /> Restore
                          </button>
                          <button
                            onClick={() => setConfirmId(snap.id)}
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
