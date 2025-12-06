import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Activity, RefreshCw, Copy, Check } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function MetricsViewer() {
  const [copied, setCopied] = useState(false);

  const metricsMutation = useMutation({
    mutationFn: apiService.getMetrics,
    onError: (error: any) => {
      toast.error(`Failed to fetch metrics: ${error.message}`);
    },
  });

  const handleCopy = async () => {
    if (metricsMutation.data) {
      await navigator.clipboard.writeText(metricsMutation.data);
      setCopied(true);
      toast.success("Metrics copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Prometheus Metrics
          </h2>

          <div className="flex items-center gap-2">
            {metricsMutation.data && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => metricsMutation.mutate()}
              disabled={metricsMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${metricsMutation.isPending ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {metricsMutation.data ? (
          <ScrollArea className="h-[400px] w-full rounded-md border border-border/50 bg-background/50">
            <pre className="p-4 text-xs font-mono">
              <code>{metricsMutation.data}</code>
            </pre>
          </ScrollArea>
        ) : (
          <div className="h-[400px] flex items-center justify-center border border-border/50 rounded-md bg-background/50 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">Click refresh to load metrics</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
