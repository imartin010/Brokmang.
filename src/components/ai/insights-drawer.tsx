"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, AlertCircle, Clock, Download, Share2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export function InsightsDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/insights?limit=5");
      if (!response.ok) throw new Error("Failed to fetch insights");
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
        headers: { "Content-Type": "application/json" },
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
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Completed</Badge>;
      case "pending":
      case "processing":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Processing</Badge>;
      case "failed":
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white border-l border-border/40 z-50 shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">AI Insights</h2>
                  <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateInsight}
              disabled={generating}
              className="w-full mt-4 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm rounded-xl transition-all duration-200"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate New Insight
                </>
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium mb-1">No insights yet</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                  Generate your first AI insight to get personalized recommendations and analysis
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="group rounded-xl border border-border/40 bg-white hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Insight Header */}
                    <div className="p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-b border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(insight.status)}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(insight.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {insight.output?.model && (
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {insight.output.model}
                        </p>
                      )}
                    </div>

                    {/* Insight Content */}
                    <div className="p-4">
                      {insight.status === "completed" && insight.output?.insights ? (
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap line-clamp-6">
                            {insight.output.insights}
                          </div>
                        </div>
                      ) : insight.status === "failed" ? (
                        <div className="text-sm text-red-600 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{insight.output?.error || "Failed to generate insight"}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}

                      {/* Footer */}
                      {insight.output?.tokens_used && (
                        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Tokens used: {insight.output.tokens_used.toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/20">
            <Link href="/app/insights">
              <Button variant="outline" className="w-full rounded-xl">
                View All Insights
                <TrendingUp className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

