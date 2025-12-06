import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Send, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { apiService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { SentimentType } from "@/types/api";

export function QuickPredictPanel() {
  const [inputText, setInputText] = useState("");

  const predictMutation = useMutation({
    mutationFn: (text: string) =>
      apiService.predict({
        input: text,
        telemetry: null,
      }),
    onSuccess: () => {
      toast.success("Analysis complete");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to analyze text");
    },
  });

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }
    predictMutation.mutate(inputText);
  };

  const getSentimentIcon = (sentiment: SentimentType) => {
    switch (sentiment) {
      case "POSITIVE":
        return TrendingUp;
      case "NEGATIVE":
        return TrendingDown;
      case "NEUTRAL":
        return Minus;
    }
  };

  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case "POSITIVE":
        return "status-healthy";
      case "NEGATIVE":
        return "status-critical";
      case "NEUTRAL":
        return "status-info";
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Quick Sentiment Analysis
        </h2>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter text to analyze sentiment..."
            className="min-h-[100px] resize-none bg-background/50"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={predictMutation.isPending}
          />

          <Button
            onClick={handleAnalyze}
            disabled={predictMutation.isPending || !inputText.trim()}
            className="w-full"
          >
            {predictMutation.isPending ? (
              "Analyzing..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>

          {predictMutation.data && (
            <Card className="border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sentiment</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getSentimentIcon(predictMutation.data.sentiment);
                    const colorClass = getSentimentColor(predictMutation.data.sentiment);
                    return (
                      <>
                        <Icon className={`h-4 w-4 text-${colorClass}`} />
                        <span className={`font-semibold text-${colorClass}`}>
                          {predictMutation.data.sentiment}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${predictMutation.data.confidence * 100}%` }}
                    />
                  </div>
                  <span className="font-mono font-semibold text-sm">
                    {(predictMutation.data.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity</span>
                <Badge
                  className={`status-badge ${
                    predictMutation.data.severity === "high" ? "status-critical" : "status-healthy"
                  }`}
                >
                  {predictMutation.data.severity === "high" && <AlertTriangle className="h-3 w-3" />}
                  {predictMutation.data.severity.toUpperCase()}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
}
