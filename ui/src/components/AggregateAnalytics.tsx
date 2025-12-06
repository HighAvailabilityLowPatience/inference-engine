import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingDown } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function AggregateAnalytics() {
  const { data: aggregate, isLoading } = useQuery({
    queryKey: ["aggregate"],
    queryFn: apiService.getAggregate,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Aggregate Analytics
          </h2>
          <div className="h-64 bg-muted/30 rounded-lg animate-pulse" />
        </div>
      </Card>
    );
  }

  if (!aggregate) return null;

  const chartData = [
    { name: "Positive", value: aggregate.counts.POSITIVE || 0, color: "hsl(var(--status-healthy))" },
    { name: "Negative", value: aggregate.counts.NEGATIVE || 0, color: "hsl(var(--status-critical))" },
    { name: "Neutral", value: aggregate.counts.NEUTRAL || 0, color: "hsl(var(--status-info))" },
  ].filter((item) => item.value > 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Aggregate Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Sentiment Distribution</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold font-mono">{aggregate.total}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Events</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg col-span-2">
                <div className="text-2xl font-bold font-mono">
                  {(aggregate.avg_confidence * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">Avg Confidence</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Top Negative Inputs
            </h3>
            <div className="space-y-2">
              {aggregate.top_negative_inputs && aggregate.top_negative_inputs.length > 0 ? (
                aggregate.top_negative_inputs.slice(0, 5).map((item, index) => (
                  <Card key={index} className="p-3 bg-muted/30 border-border/50">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm flex-1 line-clamp-2">{item.input}</p>
                      <span className="text-xs font-mono font-semibold text-destructive shrink-0">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No negative inputs recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
