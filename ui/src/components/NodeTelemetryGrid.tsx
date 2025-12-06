import { useQuery } from "@tanstack/react-query";
import { Server, Activity, Cpu, HardDrive, Network, Clock } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Event, Telemetry } from "@/types/api";

interface NodeData {
  node: string;
  telemetry: Telemetry;
  lastUpdate: string;
  isNew: boolean;
}

export function NodeTelemetryGrid() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiService.getEvents(100),
    refetchInterval: 10000,
  });

  const getMetricColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return "metric-excellent";
    if (value < thresholds[1]) return "metric-warning";
    return "metric-critical";
  };

  const getLatencyColor = (ms: number) => getMetricColor(ms, [50, 150]);
  const getCpuColor = (percent: number) => getMetricColor(percent, [70, 90]);
  const getMemColor = (percent: number) => getMetricColor(percent, [70, 90]);

  // Build node map from events
  const nodeMap = new Map<string, NodeData>();
  events.forEach((event: Event) => {
    if (event.telemetry && event.telemetry.node) {
      const existing = nodeMap.get(event.telemetry.node);
      if (!existing || new Date(event.created_at) > new Date(existing.lastUpdate)) {
        nodeMap.set(event.telemetry.node, {
          node: event.telemetry.node,
          telemetry: event.telemetry,
          lastUpdate: event.created_at,
          isNew: existing ? new Date(event.created_at).getTime() - new Date(existing.lastUpdate).getTime() < 15000 : false,
        });
      }
    }
  });

  const nodes = Array.from(nodeMap.values()).sort((a, b) => a.node.localeCompare(b.node));

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Node Telemetry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Node Telemetry
          </h2>
          <div className="text-center py-12 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No node telemetry data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Node Telemetry
          </h2>
          <Badge variant="outline" className="font-mono">
            {nodes.length} {nodes.length === 1 ? "Node" : "Nodes"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const t = node.telemetry;
            return (
              <Card
                key={node.node}
                className={`metric-card border-border/50 ${node.isNew ? "pulse-animation" : ""}`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-semibold font-mono text-sm">{node.node}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Network className="h-3.5 w-3.5" />
                        <span>Latency</span>
                      </div>
                      <span className={`font-mono font-semibold text-${getLatencyColor(t.ping_ms)}`}>
                        {t.ping_ms.toFixed(0)}ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Cpu className="h-3.5 w-3.5" />
                        <span>CPU</span>
                      </div>
                      <span className={`font-mono font-semibold text-${getCpuColor(t.cpu)}`}>
                        {t.cpu.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>Memory</span>
                      </div>
                      <span className={`font-mono font-semibold text-${getMemColor(t.mem)}`}>
                        {t.mem.toFixed(1)}%
                      </span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="text-primary">↑</span> {(t.net_sent / 1024).toFixed(1)}KB/s
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-accent">↓</span> {(t.net_recv / 1024).toFixed(1)}KB/s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(t.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
