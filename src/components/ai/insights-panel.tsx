"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertCircle, Clock } from "lucide-react";

type Insight = {
  id: string;
  organization_id: string;
  initiated_by: string;
  scope: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  output: {
    insights?: string;
    error?: string;
    model?: string;
    tokens_used?: number;
  } | null;
};

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/insights?limit=5");
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
  };

  const generateInsight = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "organization",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate insight");
      }

      const result = await response.json();
      
      // Refresh insights immediately (the API generates insights synchronously)
      await fetchInsights();
      setGenerating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insight");
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  // Poll for updates if there are pending insights
  useEffect(() => {
    const hasPending = insights.some((i) => i.status === "pending" || i.status === "processing");
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchInsights();
    }, 3000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading insights...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No insights yet. Generate your first insight to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(insight.status)}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(insight.created_at)}
                  </span>
                </div>
                {insight.output?.model && (
                  <Badge variant="outline" className="text-xs">
                    {insight.output.model}
                  </Badge>
                )}
              </div>

              {insight.status === "processing" || insight.status === "pending" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Processing your insight...</span>
                </div>
              ) : insight.output?.error ? (
                <div className="text-sm text-destructive">{insight.output.error}</div>
              ) : insight.output?.insights ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">{insight.output.insights}</div>
                  {insight.output.tokens_used && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tokens used: {insight.output.tokens_used}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No insights available</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

