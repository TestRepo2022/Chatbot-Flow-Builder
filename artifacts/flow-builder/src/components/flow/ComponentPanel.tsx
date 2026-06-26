import { useState, useMemo } from 'react';
import { NODE_TYPES_CONFIG, CATEGORIES } from '../../lib/nodeConfig';
import { Search } from 'lucide-react';

export function ComponentPanel() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return NODE_TYPES_CONFIG.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      nodes: filtered.filter((n) => n.category === cat),
    })).filter((g) => g.nodes.length > 0);
  }, [filtered]);

  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--sidebar))' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Components
        </h2>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none transition-all"
            style={{
              background: 'hsl(var(--muted) / 0.5)',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
            data-testid="input-node-search"
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {grouped.map(({ category, nodes }) => (
          <div key={category}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              {category}
            </div>
            <div className="space-y-1.5">
              {nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab transition-all duration-150 select-none"
                    style={{
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--card))',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = node.color + '88';
                      (e.currentTarget as HTMLElement).style.background = node.color + '11';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))';
                      (e.currentTarget as HTMLElement).style.background = 'hsl(var(--card))';
                    }}
                    data-testid={`draggable-node-${node.type}`}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: node.color + '22' }}
                    >
                      <Icon size={14} style={{ color: node.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{node.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{node.description}</div>
                    </div>
                    <div
                      className="w-1.5 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: node.color }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No nodes match "{search}"
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div
        className="px-4 py-3 text-[10px] text-muted-foreground text-center"
        style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}
      >
        Drag nodes onto the canvas
      </div>
    </div>
  );
}
