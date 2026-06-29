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

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'hsl(var(--sidebar))' }}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">Components</div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none"
            style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-3">
        {grouped.map(({ category, nodes }) => (
          <div key={category}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-1.5">{category}</div>
            <div className="space-y-1">
              {nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:bg-white/5 group select-none"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = node.color + '40'; e.currentTarget.style.background = node.color + '10'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = ''; }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: node.bgColor, border: `1px solid ${node.color}40` }}
                    >
                      <Icon size={14} style={{ color: node.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{node.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{node.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search size={16} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No nodes found</p>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground text-center pt-2 opacity-60">
          Drag nodes onto the canvas
        </div>
      </div>
    </div>
  );
}
