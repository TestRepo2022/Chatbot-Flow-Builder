import { memo, useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { getNodeConfig } from '../../../lib/nodeConfig';
import { useFlowStore } from '../../../store/flowStore';
import { X, Copy, CheckCircle, XCircle } from 'lucide-react';

export const ConditionNode = memo(function ConditionNode({ id, type, selected, data }: NodeProps) {
  const { deleteNode, duplicateNode, selectNode } = useFlowStore();
  const [hovered, setHovered] = useState(false);
  const config = getNodeConfig(type);
  if (!config) return null;
  const Icon = config.icon;

  const operatorLabels: Record<string, string> = {
    equals: '==',
    not_equals: '!=',
    contains: 'contains',
    greater_than: '>',
    less_than: '<',
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectNode(id)}
      style={{ animation: 'nodeAppear 0.2s ease-out' }}
    >
      <Handle type="target" position={Position.Top} style={{ background: config.color, borderColor: config.color }} />

      <div
        className="w-64 rounded-xl overflow-hidden shadow-lg"
        style={{
          background: 'hsl(var(--card))',
          border: selected ? `2px solid ${config.color}` : `1.5px solid hsl(var(--border))`,
          boxShadow: selected ? `0 0 0 1px ${config.color}33` : '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: config.color + '22', borderBottom: `1px solid ${config.color}33` }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: config.color }}>
            <Icon size={13} color="white" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wide flex-1">CONDITION</span>
          <div className="flex items-center gap-1 transition-opacity" style={{ opacity: hovered || selected ? 1 : 0 }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground"><Copy size={11} /></button>
            <button onClick={(e) => { e.stopPropagation(); deleteNode(id); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400"><X size={11} /></button>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {data.label && <div className="text-xs font-semibold text-muted-foreground">{data.label}</div>}

          <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
            {data.variable || data.operator || data.value ? (
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: config.color + '22', color: config.color }}>
                  {data.variable || 'variable'}
                </span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {operatorLabels[data.operator] || '=='}
                </span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">
                  {data.value || 'value'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">No condition set</span>
            )}
          </div>

          {/* True / False branches */}
          <div className="grid grid-cols-2 gap-2 mt-1 relative">
            <div className="relative">
              <div className="flex items-center gap-1 text-xs py-1.5 px-2 rounded-lg border justify-center" style={{ borderColor: '#10b98166', color: '#10b981', background: '#10b98111' }}>
                <CheckCircle size={11} />
                <span>True</span>
              </div>
              <Handle
                id="true"
                type="source"
                position={Position.Bottom}
                style={{ background: '#10b981', borderColor: '#10b981', left: '50%', transform: 'translateX(-50%)', bottom: -8 }}
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-1 text-xs py-1.5 px-2 rounded-lg border justify-center" style={{ borderColor: '#ef444466', color: '#ef4444', background: '#ef444411' }}>
                <XCircle size={11} />
                <span>False</span>
              </div>
              <Handle
                id="false"
                type="source"
                position={Position.Bottom}
                style={{ background: '#ef4444', borderColor: '#ef4444', left: '50%', transform: 'translateX(-50%)', bottom: -8 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
