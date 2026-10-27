export interface ServiceTrustScore {
  serviceId: string;
  totalCalls: number;
  successfulCalls: number;
  totalLatencyMs: number;
  averageLatencyMs: number;
  score: number; // 0 - 100
}

export class TrustTracker {
  private scores: Map<string, ServiceTrustScore> = new Map();

  recordCall(serviceId: string, success: boolean, latencyMs: number): ServiceTrustScore {
    let entry = this.scores.get(serviceId);
    if (!entry) {
      entry = {
        serviceId,
        totalCalls: 0,
        successfulCalls: 0,
        totalLatencyMs: 0,
        averageLatencyMs: 0,
        score: 100,
      };
      this.scores.set(serviceId, entry);
    }

    entry.totalCalls++;
    if (success) entry.successfulCalls++;
    entry.totalLatencyMs += latencyMs;
    entry.averageLatencyMs = Math.round(entry.totalLatencyMs / entry.totalCalls);

    // Score based on success rate (80% weight) and latency penalty (20% weight)
    const successRatio = entry.successfulCalls / entry.totalCalls;
    const latencyPenalty = entry.averageLatencyMs > 2000 ? 20 : entry.averageLatencyMs > 1000 ? 10 : 0;
    entry.score = Math.max(1, Math.min(100, Math.round(successRatio * 100 - latencyPenalty)));

    return entry;
  }

  getScore(serviceId: string): ServiceTrustScore | undefined {
    return this.scores.get(serviceId);
  }

  getAllScores(): ServiceTrustScore[] {
    return Array.from(this.scores.values());
  }
}
