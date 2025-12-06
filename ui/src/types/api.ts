export interface Telemetry {
  node: string;
  cpu: number;
  mem: number;
  net_sent: number;
  net_recv: number;
  ping_ms: number;
  timestamp: string;
  [key: string]: any; // Allow additional fields
}

export interface PredictRequest {
  input: string;
  telemetry: Telemetry | null;
}

export interface PredictResponse {
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  confidence: number;
  severity: "low" | "high";
}

export interface Event {
  id: number;
  input: string;
  sentiment: string;
  confidence: number;
  severity: string;
  telemetry: Telemetry | null;
  created_at: string;
}

export interface AggregateStats {
  counts: {
    POSITIVE?: number;
    NEGATIVE?: number;
    NEUTRAL?: number;
  };
  total: number;
  avg_confidence: number;
  top_negative_inputs?: Array<{
    input: string;
    confidence: number;
  }>;
}

export interface HealthStatus {
  status: string;
}

export interface NodeHealth {
  latency_ms: number;
  throughput_mbps: number;
  packet_loss: number;
}

export interface ControlResponse {
  status: string;
}

export type SentimentType = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export type SeverityType = "low" | "high";
