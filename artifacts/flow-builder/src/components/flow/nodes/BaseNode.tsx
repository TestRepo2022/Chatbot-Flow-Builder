import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { X, Copy } from 'lucide-react';
import { useFlowStore } from '../../../store/flowStore';
import { getNodeConfig } from '../../../lib/nodeConfig';

interface BaseNodeProps {
  id: string;
  type: string;
  selected: boolean;
  children: React.ReactNode;
  handles?: {
    inputs?: Array<{ id?: string; position?: Position; style?: React.CSSProperties; label?: string }>;
    outputs?: Array<{ id?: string; position?: Position; style?: React.CSSProperties; label?: string }>;
  };
  hideDefaultHandles?: boolean;
}

export const BaseNode = memo(function BaseNode({
  id,
  type,
  selected,
  children,
  handles,
  hideDefaultHandles,
}: BaseNodeProps) {
  const { deleteNode, duplicateNode, selectNode } = useFlowStore();
  const [hovered, setHovered] = useState(false);
  const config = getNodeConfig(type);

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectNode(id)}
    >
      {/* Default input handle */}
      {!hideDefaultHandles && type !== 'startNode' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: config.color, borderColor: config.color }}
        />
      )}

      {/* Custom input handles */}
      {handles?.inputs?.map((h, i) => (
        <Handle
          key={h.id || `input_${i}`}
          id={h.id}
          type="target"
          position={h.position || Position.Top}
          style={{ background: config.color, borderColor: config.color, ...h.style }}
        />
      ))}

      {/* Node card */}
      <div
        className="w-64 rounded-xl overflow-hidden shadow-lg transition-all duration-150"
        style={{
          background: `hsl(var(--card))`,
          border: selected
            ? `2px solid ${config.color}`
            : `1.5px solid hsl(var(--border))`,
          boxShadow: selected
            ? `0 0 0 1px ${config.color}33, 0 8px 32px ${config.color}22`
            : '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: config.color + '22', borderBottom: `1px solid ${config.color}33` }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: config.color }}
          >
            <Icon size={13} color="white" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wide flex-1 truncate">
            {config.label.toUpperCase()}
          </span>

          {/* Action buttons */}
          <div
            className="flex items-center gap-1 transition-opacity duration-150"
            style={{ opacity: hovered || selected ? 1 : 0 }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              title="Duplicate"
            >
              <Copy size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 transition-colors text-muted-foreground hover:text-red-400"
              title="Delete"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {children}
        </div>
      </div>

      {/* Default output handle */}
      {!hideDefaultHandles && type !== 'endNode' && type !== 'quickReply' && type !== 'conditionNode' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: config.color, borderColor: config.color }}
        />
      )}

      {/* Custom output handles */}
      {handles?.outputs?.map((h, i) => (
        <div key={h.id || `output_${i}`} className="relative">
          <Handle
            id={h.id}
            type="source"
            position={h.position || Position.Bottom}
            style={{ background: config.color, borderColor: config.color, ...h.style }}
          />
          {h.label && (
            <span
              className="absolute text-[10px] font-medium pointer-events-none"
              style={{
                color: config.color,
                ...(h.position === Position.Right ? { right: -60, top: '50%', transform: 'translateY(-50%)' } :
                  { bottom: -18, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }),
              }}
            >
              {h.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
});
