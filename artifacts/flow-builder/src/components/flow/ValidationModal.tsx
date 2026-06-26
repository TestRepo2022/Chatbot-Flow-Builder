import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

interface Props {
  result: { valid: boolean; errors: string[] } | null;
  onClose: () => void;
  onPublish?: () => void;
}

export function ValidationModal({ result, onClose, onPublish }: Props) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-96 rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          {result.valid ? (
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-sm text-foreground">
              {result.valid ? 'Flow is valid' : 'Validation failed'}
            </div>
            <div className="text-xs text-muted-foreground">
              {result.valid ? 'Ready to publish' : `${result.errors.length} issue${result.errors.length !== 1 ? 's' : ''} found`}
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {result.valid ? (
            <div className="text-sm text-green-400 text-center py-4">
              Your flow passed all validation checks.
            </div>
          ) : (
            <ul className="space-y-2">
              {result.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{err}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-2 justify-end" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg transition-colors"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          >
            Close
          </button>
          {result.valid && onPublish && (
            <button
              onClick={() => { onPublish(); onClose(); }}
              className="px-4 py-2 text-xs rounded-lg font-semibold transition-colors"
              style={{ background: '#10b981', color: 'white' }}
            >
              Publish Flow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
