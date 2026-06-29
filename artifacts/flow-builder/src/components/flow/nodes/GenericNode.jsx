import { memo } from 'react';
import { BaseNode } from './BaseNode';

function truncate(str, n) {
  return str?.length > n ? str.slice(0, n) + '...' : str;
}

export const ListMessageNode = memo(function ListMessageNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="space-y-1.5 rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        {data.header && <div className="text-xs font-semibold text-foreground">{truncate(data.header, 40)}</div>}
        {data.body && <div className="text-xs text-muted-foreground">{truncate(data.body, 60)}</div>}
        {data.sections?.length > 0 && (
          <div className="text-[10px] text-cyan-400">
            {data.sections.length} section{data.sections.length !== 1 ? 's' : ''} &bull;{' '}
            {data.sections.reduce((acc, s) => acc + (s.rows?.length || 0), 0)} items
          </div>
        )}
        {data.buttonText && (
          <div className="text-xs text-center py-1 rounded border mt-1" style={{ borderColor: '#06b6d466', color: '#06b6d4', background: '#06b6d411' }}>
            {data.buttonText}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

export const WhatsappFormNode = memo(function WhatsappFormNode({ id, type, selected, data }) {
  const fields = data.fields || [];
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="space-y-1.5">
        {fields.slice(0, 3).map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs rounded px-2 py-1.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
            <span className="text-pink-400 font-medium capitalize">{f.type}</span>
            <span className="text-foreground flex-1 truncate">{f.label}</span>
            {f.required && <span className="text-red-400 text-[10px]">*</span>}
          </div>
        ))}
        {fields.length > 3 && <div className="text-[10px] text-muted-foreground pl-1">+{fields.length - 3} more fields</div>}
        {fields.length === 0 && <div className="text-xs text-muted-foreground italic">No fields added</div>}
      </div>
    </BaseNode>
  );
});

export const UserInputNode = memo(function UserInputNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="space-y-1.5 rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        {data.prompt
          ? <div className="text-xs text-foreground line-clamp-2">{data.prompt}</div>
          : <div className="text-xs text-muted-foreground italic">No prompt set</div>}
        {data.variableName && (
          <div className="text-[10px] font-mono px-1.5 py-0.5 rounded inline-block" style={{ background: '#14b8a622', color: '#14b8a6' }}>
            {`→ {{${data.variableName}}}`}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

export const AskQuestionNode = memo(function AskQuestionNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        {data.question
          ? <div className="text-xs text-foreground line-clamp-3">{data.question}</div>
          : <div className="text-xs text-muted-foreground italic">No question set</div>}
        {data.variableName && (
          <div className="text-[10px] font-mono mt-1.5 px-1.5 py-0.5 rounded inline-block" style={{ background: '#3b82f622', color: '#3b82f6' }}>
            {`→ {{${data.variableName}}}`}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

export const AskLocationNode = memo(function AskLocationNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        {data.prompt
          ? <div className="text-xs text-foreground">{truncate(data.prompt, 80)}</div>
          : <div className="text-xs text-muted-foreground italic">No prompt set</div>}
        {data.variableName && (
          <div className="text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded inline-block" style={{ background: '#ef444422', color: '#ef4444' }}>
            {`→ {{${data.variableName}}}`}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

export const AskAddressNode = memo(function AskAddressNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        {data.prompt
          ? <div className="text-xs text-foreground">{truncate(data.prompt, 80)}</div>
          : <div className="text-xs text-muted-foreground italic">No prompt set</div>}
        {data.variableName && (
          <div className="text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded inline-block" style={{ background: '#84cc1622', color: '#84cc16' }}>
            {`→ {{${data.variableName}}}`}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

export const ApiRequestNode = memo(function ApiRequestNode({ id, type, selected, data }) {
  const methodColors = {
    GET: '#10b981', POST: '#3b82f6', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6'
  };
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: (methodColors[data.method] || '#6366f1') + '22', color: methodColors[data.method] || '#6366f1' }}>
            {data.method || 'GET'}
          </span>
          <span className="text-xs text-muted-foreground truncate flex-1">{data.url || 'No URL set'}</span>
        </div>
        {data.responseMapping?.length > 0 && (
          <div className="text-[10px] text-purple-400">{data.responseMapping.length} response mapping{data.responseMapping.length !== 1 ? 's' : ''}</div>
        )}
      </div>
    </BaseNode>
  );
});

export const ConnectFlowNode = memo(function ConnectFlowNode({ id, type, selected, data }) {
  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>}
      <div className="rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        {data.flowName
          ? <div className="text-xs text-sky-400 font-medium">{data.flowName}</div>
          : <div className="text-xs text-muted-foreground italic">No flow selected</div>}
        {data.flowId && <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{data.flowId}</div>}
      </div>
    </BaseNode>
  );
});
