import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

 | null;
  onPublish?=> void;
}

export function ValidationDialog({ open, onClose, result, onPublish }: ValidationDialogProps) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        
          <DialogTitle className="flex items-center gap-2">
            {result.valid ? (
              <><CheckCircle size={18} className="text-green-500" /> Flow Validation Passed</>
            ) : (
              <><AlertTriangle size={18} className="text-amber-500" /> Validation Issues Found</>
            )}
          </DialogTitle>
        </DialogHeader>

        {result.valid ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your flow passed all validation checks and is ready to publish.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              {onPublish && <Button className="flex-1" onClick={() => { onPublish(); onClose(); }}>Publish Now</Button>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Fix these issues before publishing:</p>
            <div className="space-y-2">
              {result.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg" style={{ background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.3)' }}>
                  <XCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{err}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
