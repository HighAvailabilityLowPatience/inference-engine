import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Power, PlayCircle, StopCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function SystemControl() {
  const [lastAction, setLastAction] = useState<{ action: string; timestamp: Date } | null>(null);

  const controlMutation = useMutation({
    mutationFn: (action: "start" | "stop") => apiService.controlSystem(action),
    onSuccess: (data, action) => {
      toast.success(`System ${action} command sent successfully`);
      setLastAction({ action, timestamp: new Date() });
    },
    onError: (error: any, action) => {
      toast.error(`Failed to ${action} system: ${error.message}`);
    },
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Power className="h-5 w-5 text-primary" />
          System Control
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => controlMutation.mutate("start")}
            disabled={controlMutation.isPending}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-success/30 hover:bg-success/10 hover:border-success"
          >
            <PlayCircle className="h-6 w-6 text-success" />
            <span>Start System</span>
          </Button>

          <Button
            onClick={() => controlMutation.mutate("stop")}
            disabled={controlMutation.isPending}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
          >
            <StopCircle className="h-6 w-6 text-destructive" />
            <span>Stop System</span>
          </Button>
        </div>

        {lastAction && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
            <span className="text-muted-foreground">Last command: </span>
            <span className="font-semibold">{lastAction.action}</span>
            <span className="text-muted-foreground"> @ </span>
            <span className="font-mono text-xs">
              {formatDistanceToNow(lastAction.timestamp, { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
