import { useQuery } from "@tanstack/react-query";
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function SystemStatusBar() {
  const { data: health, isError: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: apiService.getHealth,
    refetchInterval: 10000,
    retry: 2,
  });

  const { data: nodeHealth } = useQuery({
    queryKey: ["node-health"],
    queryFn: apiService.getNodeHealth,
    refetchInterval: 15000,
    retry: 2,
  });

  const getSystemStatus = () => {
    if (healthError) return { status: "down", color: "status-critical", icon: AlertCircle };
    if (health?.status !== "ok") return { status: "degraded", color: "status-degraded", icon: Activity };
    return { status: "online", color: "status-healthy", icon: CheckCircle2 };
  };

  const getMetricColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return "text-metric-excellent";
    if (value < thresholds[1]) return "text-metric-warning";
    return "text-metric-critical";
  };

  const getLatencyColor = (ms: number) => getMetricColor(ms, [50, 150]);
  const getPacketLossColor = (percent: number) => getMetricColor(percent, [1, 3]);

  const systemStatus = getSystemStatus();
  const StatusIcon = systemStatus.icon;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${systemStatus.color}/10 border border-${systemStatus.color}/20`}>
              <StatusIcon className={`h-5 w-5 text-${systemStatus.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">System Status</h2>
                <Badge className={`status-badge status-${systemStatus.status === "online" ? "healthy" : systemStatus.status === "degraded" ? "degraded" : "critical"}`}>
                  {systemStatus.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
                Last checked {formatDistanceToNow(new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>

          {nodeHealth && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Latency</span>
                <span className={`font-mono font-semibold ${getLatencyColor(nodeHealth.latency_ms)}`}>
                  {nodeHealth.latency_ms.toFixed(1)}ms
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Throughput</span>
                <span className="font-mono font-semibold text-metric-good">
                  {nodeHealth.throughput_mbps.toFixed(2)} Mbps
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Packet Loss</span>
                <span className={`font-mono font-semibold ${getPacketLossColor(nodeHealth.packet_loss)}`}>
                  {nodeHealth.packet_loss.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
