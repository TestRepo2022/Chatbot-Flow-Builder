import { memo } from 'react';
import { BaseNode } from './BaseNode';
import { Image, Video, FileText, Music } from 'lucide-react';

const mediaIcons = { image: Image, video: Video, document: FileText, audio: Music };
const mediaColors = { image: '#8b5cf6', video: '#a855f7', document: '#c084fc', audio: '#7c3aed' };

export const MediaMessageNode = memo(function MediaMessageNode({ id, type, selected, data }) {
  const mediaType = data.mediaType || 'image';
  const Icon = mediaIcons[mediaType] || Image;
  const color = mediaColors[mediaType] || '#8b5cf6';

  return (
    <BaseNode id={id} type={type} selected={selected}>
      {data.label && (
        <div className="text-xs font-semibold text-muted-foreground mb-2 truncate">{data.label}</div>
      )}
      <div className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '22' }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium capitalize" style={{ color }}>{mediaType}</div>
          {data.url ? (
            <div className="text-xs text-muted-foreground truncate">{data.url}</div>
          ) : (
            <div className="text-xs text-muted-foreground italic">No URL set</div>
          )}
          {data.caption && (
            <div className="text-xs text-foreground truncate mt-0.5">{data.caption}</div>
          )}
        </div>
      </div>
    </BaseNode>
  );
});
