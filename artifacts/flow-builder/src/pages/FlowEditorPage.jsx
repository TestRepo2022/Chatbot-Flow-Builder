import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useFlowStore } from '../store/flowStore';
import FlowBuilder from '../components/flow/FlowBuilder';

export default function FlowEditorPage() {
  const params = useParams();
  const { loadFlow, isLoaded, flowId } = useFlowStore();

  useEffect(() => {
    if (params.id && params.id !== flowId) {
      loadFlow(params.id);
    }
  }, [params.id, flowId, loadFlow]);

  if (!isLoaded || flowId !== params.id) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }}
          />
          <span className="text-sm text-muted-foreground">Loading flow...</span>
        </div>
      </div>
    );
  }

  return <FlowBuilder />;
}
