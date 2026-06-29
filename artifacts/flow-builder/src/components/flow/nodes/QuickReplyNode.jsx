import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeConfig } from '../../../lib/nodeConfig';
import { useFlowStore } from '../../../store/flowStore';
import { X, Copy } from 'lucide-react';

export const QuickReplyNode = memo(function QuickReplyNode({ id, type, selected, data }) {
  const { deleteNode, duplicateNode, selectNode } = useFlowStore();
  const [hovered, setHovered] = useState(false);
  const config = getNodeConfig(type);
  if (!config) return null;
  const Icon = config.icon;
  const buttons = data.buttons || [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectNode(id)}
    >
      <Handle type="target" position={Position.Top} style={{ background: config.color, borderColor: config.color }} />

      <div
        className="w-64 rounded-xl overflow-hidden shadow-lg"
        style={{
          background: 'hsl(var(--card))',
          border: selected ? `2px solid ${config.color}` : '1.5px solid hsl(var(--border))',
          boxShadow: selected ? `0 0 0 1px ${config.color}33, 0 8px 32px ${config.color}22` : '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: config.color + '22', borderBottom: `1px solid ${config.color}33` }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: config.color }}>
            <Icon size={13} color="white" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wide flex-1 truncate">QUICK REPLY</span>
          <div className="flex items-center gap-1 transition-opacity" style={{ opacity: hovered || selected ? 1 : 0 }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground">
              <Copy size={11} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteNode(id); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
              <X size={11} />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {data.label && <div className="text-xs font-semibold text-muted-foreground truncate">{data.label}</div>}
          {data.message && (
            <div className="text-sm leading-relaxed rounded-lg p-2 line-clamp-2" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
              {data.message}
            </div>
          )}

          <div className="space-y-1 relative">
            {buttons.map((btn, i) => (
              <div key={btn.id} className="relative">
                <div
                  className="text-xs font-medium text-center py-1.5 px-3 rounded-lg border transition-colors"
                  style={{ borderColor: config.color + '66', color: config.color, background: config.color + '11' }}
                >
                  {btn.text || `Button ${i + 1}`}
                </div>
                <Handle
                  id={btn.id}
                  type="source"
                  position={Position.Right}
                  style={{
                    background: config.color,
                    borderColor: config.color,
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                  }}
                />
              </div>
            ))}
            {buttons.length === 0 && (
              <div className="text-xs text-muted-foreground italic text-center py-2">No buttons added</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
