"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, Loader2, Sparkles, TrendingUp } from "lucide-react";

type InsightRecord = {
  id: string;
  organization_id: string;
  initiated_by: string;
  scope: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  output: {
    insights?: string;
    raw_text?: string;
    structured?: StructuredInsightPayload | null;
    error?: string;
    model?: string;
    requested_model?: string;
    tokens_used?: number;
  } | null;
};

type StructuredInsightPayload = {
  summary: string;
  keyMetrics: Array<{ title: string; value: string; trend?: string; insight?: string }>;
  recommendations: Array<{ priority: "high" | "medium" | "low"; title: string; action: string; impact: string }>;
  watchlist?: Array<{ issue: string; risk: string; suggestedAction: string }>;
  icebreakers: Array<{ audience: string; conversationGoal: string; script: string }>;
  nextCheckIn?: string;
  generatedAt?: string;
  role?: string;
};

const MAX_INSIGHTS = 5;

export function InsightsPanel() {
  const [insights, setInsights] = useState<InsightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ai/insights?limit=${MAX_INSIGHTS}`);
      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }
      const data = await response.json();
      setInsights(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInsight = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "organization" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate insight");
      }

      await fetchInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insight");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    const hasPending = insights.some((i) => i.status === "pending" || i.status === "processing");
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchInsights();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchInsights, insights]);

  const mostRecent = insights[0];
  const structured = useMemo(() => mostRecent?.output?.structured ?? null, [mostRecent]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={generateInsight} disabled={generating} size="sm" className="w-full">
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insight
            </>
          )}
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading insights...</p>
        </div>
      ) : insights.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Generate an insight to see AI-powered recommendations for your role.</p>
        </Card>
      ) : (
        <Card className="p-5 space-y-4 border-border/60 bg-gradient-to-br from-background via-background to-muted/30">
          <InsightHeader insight={mostRecent} />
          <InsightBody insight={mostRecent} structured={structured} />
        </Card>
      )}

      {insights.length > 1 ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Previous insights</p>
          <div className="space-y-2">
            {insights.slice(1).map((insight) => (
              <Card key={insight.id} className="p-4">
                <InsightHeader insight={insight} compact />
                <InsightBody insight={insight} structured={insight.output?.structured ?? null} compact />
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="default">Completed</Badge>;
    case "processing":
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case "failed":
      return <Badge variant="outline" className="border-red-500 text-red-600">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const InsightHeader = ({ insight, compact = false }: { insight: InsightRecord; compact?: boolean }) => (
  <div className={`flex ${compact ? "flex-col gap-1 sm:flex-row sm:items-center sm:justify-between" : "items-center justify-between"}`}>
    <div className="flex items-center gap-2">
      {getStatusBadge(insight.status)}
      <span className="text-xs text-muted-foreground">Generated {formatDate(insight.created_at)}</span>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {insight.output?.model ? (
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
          {insight.output.model}
        </Badge>
      ) : null}
      {insight.output?.requested_model &&
      insight.output?.model &&
      insight.output.requested_model !== insight.output.model ? (
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          Fallback from {insight.output.requested_model}
        </Badge>
      ) : null}
    </div>
  </div>
);

const InsightBody = ({
  insight,
  structured,
  compact = false,
}: {
  insight: InsightRecord;
  structured: StructuredInsightPayload | null;
  compact?: boolean;
}) => {
  if (insight.status === "processing" || insight.status === "pending") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Processing your insight...</span>
      </div>
    );
  }

  if (insight.output?.error) {
    return <div className="text-sm text-destructive">{insight.output.error}</div>;
  }

  if (structured) {
    return <StructuredInsightView structured={structured} compact={compact} tokens={insight.output?.tokens_used} />;
  }

  const fallbackText = insight.output?.raw_text ?? insight.output?.insights;
  if (fallbackText) {
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
        {fallbackText}
        {insight.output?.tokens_used ? (
          <p className="text-xs text-muted-foreground mt-2">Tokens used: {insight.output.tokens_used}</p>
        ) : null}
      </div>
    );
  }

  return <div className="text-sm text-muted-foreground">No insights available</div>;
};

const StructuredInsightView = ({
  structured,
  compact,
  tokens,
}: {
  structured: StructuredInsightPayload;
  compact: boolean;
  tokens?: number;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">{structured.summary}</p>
        {structured.nextCheckIn ? (
          <p className="text-xs text-muted-foreground mt-1">Next check-in: {structured.nextCheckIn}</p>
        ) : null}
      </div>

      {structured.keyMetrics?.length ? (
        <div className={`grid gap-2 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
          {structured.keyMetrics.slice(0, compact ? 2 : 4).map((metric, idx) => (
            <div
              key={`${metric.title}-${idx}`}
              className="flex items-start justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-2"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.title}</p>
                <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                {metric.insight ? <p className="text-xs text-muted-foreground mt-1">{metric.insight}</p> : null}
              </div>
              {metric.trend ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {metric.trend}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {structured.recommendations?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended next steps</p>
          <ul className="space-y-2">
            {structured.recommendations.slice(0, compact ? 2 : 3).map((rec, idx) => (
              <li
                key={`${rec.title}-${idx}`}
                className="rounded-lg border border-border/30 bg-background/40 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{rec.title}</p>
                  <Badge
                    variant={rec.priority === "high" ? "default" : "outline"}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{rec.action}</p>
                <p className="text-xs text-foreground/70 mt-1">Impact: {rec.impact}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {structured.watchlist?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Watchlist</p>
          <div className="grid gap-2">
            {structured.watchlist.slice(0, compact ? 2 : 3).map((item, idx) => (
              <div
                key={`${item.issue}-${idx}`}
                className="rounded-lg border border-amber-300/60 bg-amber-50/60 px-3 py-2 text-sm"
              >
                <p className="font-semibold text-amber-900">{item.issue}</p>
                <p className="text-xs text-amber-900/80">Risk: {item.risk}</p>
                <p className="text-xs text-amber-900/90 mt-1">Suggested action: {item.suggestedAction}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {structured.icebreakers?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">One-to-one icebreakers</p>
          <div className="grid gap-2">
            {structured.icebreakers.slice(0, compact ? 1 : 2).map((breaker, idx) => (
              <div
                key={`${breaker.audience}-${idx}`}
                className="rounded-lg border border-border/30 bg-background/60 px-3 py-2 text-sm"
              >
                <p className="font-semibold">{breaker.audience}</p>
                <p className="text-xs text-muted-foreground mb-1">Goal: {breaker.conversationGoal}</p>
                <p className="text-sm leading-relaxed text-foreground/90">{breaker.script}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {typeof tokens === "number" ? (
        <p className="text-xs text-muted-foreground">Tokens used: {tokens}</p>
      ) : null}
    </div>
  );
};

