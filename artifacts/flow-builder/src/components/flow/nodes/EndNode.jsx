import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Square } from 'lucide-react';

export const EndNode = memo(function EndNode({ data, selected }) {
  return (
    <div className="flex flex-col items-center cursor-pointer">
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#64748b', borderColor: '#64748b', top: -8 }}
      />
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, #475569, #334155)',
          border: selected ? '3px solid #64748b' : '3px solid transparent',
          boxShadow: selected
            ? '0 0 0 3px #64748b33'
            : '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <Square size={20} color="white" fill="white" />
      </div>
      <span
        className="mt-2 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
        style={{ background: '#64748b22', color: '#94a3b8', border: '1px solid #64748b33' }}
      >
        END
      </span>
      {data?.message && (
        <span className="mt-1 text-xs text-muted-foreground max-w-32 text-center truncate">
          {data.message}
        </span>
      )}
    </div>
  );
});
