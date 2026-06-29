import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

export const StartNode = memo(function StartNode({ selected }) {
  return (
    <div className="flex flex-col items-center cursor-pointer">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          border: selected ? '3px solid #10b981' : '3px solid transparent',
          boxShadow: selected
            ? '0 0 0 3px #10b98133, 0 8px 32px #10b98144'
            : '0 4px 16px #10b98144',
        }}
      >
        <Play size={24} color="white" fill="white" />
      </div>
      <span
        className="mt-2 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
        style={{ background: '#10b98122', color: '#10b981', border: '1px solid #10b98133' }}
      >
        START
      </span>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#10b981', borderColor: '#10b981', bottom: -8 }}
      />
    </div>
  );
});
