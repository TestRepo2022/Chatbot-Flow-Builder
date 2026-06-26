import { useState } from 'react';
import { useFlowStore, VersionSnapshot } from '../../store/flowStore';
import { History, RotateCcw, Trash2, X, Clock, GitCommit, Zap, Save } from 'lucide-react';

function relativeTime(timestamp: number): string {
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

function absoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const triggerMeta: Record<string, { label: string; icon: typeof Save; color: string }> = {
  auto:    { label: 'Auto-save',  icon: Clock, color: '#6366f1' },
  manual:  { label: 'Manual save', icon: Save,  color: '#10b981' },
  publish: { label: 'Published',  icon: Zap,   color: '#f59e0b' },
};

interface SnapshotRowProps {
  snapshot: VersionSnapshot;
  index: number;
  isLatest: boolean;
  onRestore: () => void;
  onDelete: () => void;
}

function SnapshotRow({ snapshot, index, isLatest, onRestore, onDelete }: SnapshotRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = triggerMeta[snapshot.trigger] || triggerMeta.auto;
  const Icon = meta.icon;

  return (
    <div
      className="group rounded-xl p-3 transition-all"
      style={{
        background: isLatest ? `${meta.color}10` : 'hsl(var(--card))',
        border: isLatest
          ? `1.5px solid ${meta.color}44`
          : '1.5px solid hsl(var(--border))',
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-2.5">
        {/* Icon + version number */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: meta.color + '22' }}
        >
          <Icon size={13} style={{ color: meta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground truncate">
              {snapshot.label}
            </span>
            {isLatest && (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: meta.color + '22', color: meta.color }}
              >
                Latest
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: meta.color + '18', color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {relativeTime(snapshot.timestamp)}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
            <span>{snapshot.nodeCount} node{snapshot.nodeCount !== 1 ? 's' : ''}</span>
            <span className="opacity-40">·</span>
            <span>{snapshot.edgeCount} connection{snapshot.edgeCount !== 1 ? 's' : ''}</span>
            <span className="opacity-40">·</span>
            <span title={absoluteTime(snapshot.timestamp)}>
              {absoluteTime(snapshot.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions — always visible on latest, hover on others */}
      <div
        className="mt-2.5 flex items-center gap-1.5 transition-opacity"
        style={{ opacity: isLatest ? 1 : undefined }}
      >
        {!confirmDelete ? (
          <>
            <button
              onClick={onRestore}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex-1 justify-center"
              style={{ background: meta.color, color: 'white' }}
              data-testid={`button-restore-snapshot-${index}`}
            >
              <RotateCcw size={11} />
              Restore this version
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete snapshot"
              data-testid={`button-delete-snapshot-${index}`}
            >
              <Trash2 size={12} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[11px] text-muted-foreground flex-1">Delete this version?</span>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500 text-white"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface HistoryPanelProps {
  onClose: () => void;
}

export function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { versionSnapshots, restoreSnapshot, deleteSnapshot, saveSnapshot } = useFlowStore();

  const sorted = [...versionSnapshots].sort((a, b) => b.timestamp - a.timestamp);

  const handleRestore = (id: string) => {
    if (window.confirm('Restore this version? Your current canvas will be replaced.')) {
      restoreSnapshot(id);
      onClose();
    }
  };

  return (
    <div
      className="flex flex-col h-full panel-slide-in"
      style={{ background: 'hsl(var(--sidebar))' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#6366f122' }}
        >
          <History size={14} style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Version History
          </div>
          <div className="text-[10px] text-muted-foreground">
            {sorted.length} / 10 snapshots
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          data-testid="button-close-history"
        >
          <X size={14} />
        </button>
      </div>

      {/* Save now button */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <button
          onClick={() => saveSnapshot('manual')}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all"
          style={{ background: 'hsl(var(--primary))', color: 'white' }}
          data-testid="button-save-snapshot"
        >
          <GitCommit size={13} />
          Save current version
        </button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Auto-saves happen every time you save the flow
        </p>
      </div>

      {/* Snapshot list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--muted))' }}>
              <History size={22} className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">No history yet</div>
              <div className="text-xs text-muted-foreground mt-1">
                Save or publish the flow to create<br />your first version snapshot.
              </div>
            </div>
          </div>
        ) : (
          sorted.map((snap, i) => (
            <SnapshotRow
              key={snap.id}
              snapshot={snap}
              index={i}
              isLatest={i === 0}
              onRestore={() => handleRestore(snap.id)}
              onDelete={() => deleteSnapshot(snap.id)}
            />
          ))
        )}
      </div>

      {/* Footer info */}
      {sorted.length >= 10 && (
        <div
          className="px-4 py-3 text-[10px] text-muted-foreground text-center flex-shrink-0"
          style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}
        >
          At capacity (10/10). Oldest snapshot will be removed on next save.
        </div>
      )}
    </div>
  );
}
