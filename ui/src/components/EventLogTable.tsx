import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import type { Event, SentimentType, SeverityType } from "@/types/api";

export function EventLogTable() {
  const [limit, setLimit] = useState(50);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [nodeFilter, setNodeFilter] = useState<string>("all");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", limit],
    queryFn: () => apiService.getEvents(limit),
    refetchInterval: 15000,
  });

  const nodes = useMemo(() => {
    const nodeSet = new Set<string>();
    events.forEach((event: Event) => {
      if (event.telemetry?.node) {
        nodeSet.add(event.telemetry.node);
      }
    });
    return Array.from(nodeSet).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      if (sentimentFilter !== "all" && event.sentiment !== sentimentFilter) return false;
      if (severityFilter !== "all" && event.severity !== severityFilter) return false;
      if (nodeFilter !== "all" && event.telemetry?.node !== nodeFilter) return false;
      return true;
    });
  }, [events, sentimentFilter, severityFilter, nodeFilter]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toUpperCase()) {
      case "POSITIVE":
        return TrendingUp;
      case "NEGATIVE":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toUpperCase()) {
      case "POSITIVE":
        return "status-healthy";
      case "NEGATIVE":
        return "status-critical";
      default:
        return "status-info";
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Event Log
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="POSITIVE">Positive</SelectItem>
                <SelectItem value="NEGATIVE">Negative</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {nodes.length > 0 && (
              <Select value={nodeFilter} onValueChange={setNodeFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nodes</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node} value={node}>
                      {node}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No events found</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[140px]">Time</TableHead>
                    <TableHead>Input</TableHead>
                    <TableHead className="w-[120px]">Sentiment</TableHead>
                    <TableHead className="w-[100px]">Confidence</TableHead>
                    <TableHead className="w-[100px]">Severity</TableHead>
                    <TableHead className="w-[100px]">Node</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event: Event) => {
                    const SentimentIcon = getSentimentIcon(event.sentiment);
                    const sentimentColor = getSentimentColor(event.sentiment);

                    return (
                      <TableRow key={event.id} className={event.severity === "high" ? "bg-destructive/5" : ""}>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate" title={event.input}>
                          {event.input}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <SentimentIcon className={`h-3.5 w-3.5 text-${sentimentColor}`} />
                            <span className={`text-sm font-medium text-${sentimentColor}`}>
                              {event.sentiment}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {(event.confidence * 100).toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`status-badge text-xs ${
                              event.severity === "high" ? "status-critical" : "status-healthy"
                            }`}
                          >
                            {event.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">
                            {event.telemetry?.node || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {events.length >= limit && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setLimit((prev) => prev + 50)}
                  size="sm"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
