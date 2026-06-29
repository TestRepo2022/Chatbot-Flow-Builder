import { memo } from 'react';
import { BaseNode } from './BaseNode';

export const TextMessageNode = memo(function TextMessageNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && (
        <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>
      )}
      <div
        className="text-sm text-foreground leading-relaxed rounded-lg p-2.5 min-h-8"
        style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}
      >
        {data.message ? (
          <span className="line-clamp-3">{data.message}</span>
        ) : (
          <span className="text-muted-foreground italic text-xs">No message set...</span>
        )}
      </div>
      {data.variables?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.variables.map((v, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {`{{${v}}}`}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
});
