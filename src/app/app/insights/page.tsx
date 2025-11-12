import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";

import { GenerateInsightButton } from "@/components/ai/generate-insight-button";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { AlertTriangle, CheckCircle2, Clock, Download, Loader2, Share2, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SUPPORTED_ROLES = new Set(["team_leader", "sales_manager", "business_unit_head", "ceo"]);

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

type StatsCard = {
  key: string;
  label: string;
  value: number;
  accent: string;
  icon: ReactNode;
};

export default async function AIInsightsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, organization_id, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileData as { role: string; organization_id: string; full_name: string } | null;

  if (!profile || profile.role === "sales_agent" || !SUPPORTED_ROLES.has(profile.role as string)) {
    redirect("/app");
  }

  const { data: insightsData } = await supabase
    .from("ai_insight_recent")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const insights = (insightsData || []) as InsightRecord[];

  const completedInsights = insights.filter((i) => i.status === "completed");
  const failedInsights = insights.filter((i) => i.status === "failed");
  const processingInsights = insights.filter((i) => i.status === "pending" || i.status === "processing");

  const stats: StatsCard[] = [
    {
      key: "completed",
      label: "Completed",
      value: completedInsights.length,
      accent: "from-emerald-50 to-emerald-100/60",
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
    },
    {
      key: "processing",
      label: "In progress",
      value: processingInsights.length,
      accent: "from-blue-50 to-blue-100/60",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
    },
    {
      key: "failed",
      label: "Needs attention",
      value: failedInsights.length,
      accent: "from-red-50 to-red-100/60",
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
    },
    {
      key: "total",
      label: "Total generated",
      value: insights.length,
      accent: "from-purple-50 to-blue-100/60",
      icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-sky-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-sm text-muted-foreground mt-1">Strategic briefings tailored to your leadership role.</p>
          </div>
        </div>
        <GenerateInsightButton className="bg-gradient-to-r from-purple-600 via-blue-600 to-sky-500 hover:from-purple-700 hover:to-sky-600 text-white shadow-md border-0 h-11 px-6" />
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className={`rounded-2xl border border-border/40 bg-gradient-to-br ${stat.accent} p-5 shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground/70">{stat.label}</p>
                <p className="text-3xl font-semibold text-foreground mt-3">{stat.value.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/70 shadow-sm">{stat.icon}</div>
            </div>
            {stat.key === "completed" && completedInsights[0] ? (
              <p className="text-xs text-muted-foreground mt-4" suppressHydrationWarning>
                Latest: {formatRelativeTime(new Date(completedInsights[0].created_at))}
              </p>
            ) : null}
          </div>
        ))}
      </section>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start border-b border-border/40 bg-transparent rounded-none h-auto p-0">
          <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3">
            All insights
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3">
            Completed
          </TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3">
            Processing
          </TabsTrigger>
          <TabsTrigger value="failed" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3">
            Failed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-5 mt-6">
          {insights.length === 0 ? <EmptyState /> : insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-5 mt-6">
          {completedInsights.length === 0 ? (
            <EmptyState message="No completed insights yet" />
          ) : (
            completedInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-5 mt-6">
          {processingInsights.length === 0 ? (
            <EmptyState message="No insights currently processing" />
          ) : (
            processingInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-5 mt-6">
          {failedInsights.length === 0 ? (
            <EmptyState message="No failed insights" />
          ) : (
            failedInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const formatRelativeTime = (date: Date) => {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const InsightCard = ({ insight }: { insight: InsightRecord }) => {
  const structured = insight.output?.structured ?? null;
  const tokens = insight.output?.tokens_used;
  const rawText = insight.output?.raw_text ?? insight.output?.insights;
  const status = insight.status;

  return (
    <div className="rounded-2xl border border-border/40 bg-background/70 shadow-sm overflow-hidden">
      <header className="flex flex-col gap-2 border-b border-border/40 bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge(status)}
          <span className="text-xs text-muted-foreground">Generated {formatRelativeTime(new Date(insight.created_at))}</span>
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
          {status === "completed" ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs" asChild>
                <Link href={`/api/ai/insights?limit=1&id=${insight.id}`} prefetch={false}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export JSON
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Share2 className="h-3.5 w-3.5 mr-1" />
                Share
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="px-6 py-6 space-y-5">
        {status === "processing" || status === "pending" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Processing your insight...</span>
          </div>
        ) : insight.output?.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            {insight.output.error}
          </div>
        ) : structured ? (
          <StructuredInsight structured={structured} tokens={tokens} />
        ) : rawText ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {rawText}
            {tokens ? <p className="text-xs text-muted-foreground mt-2">Tokens used: {tokens}</p> : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No insight content available.</div>
        )}
      </div>
    </div>
  );
};

const StructuredInsight = ({ structured, tokens }: { structured: StructuredInsightPayload; tokens?: number }) => {
  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-medium text-foreground leading-relaxed">{structured.summary}</p>
        {structured.nextCheckIn ? (
          <p className="text-xs text-muted-foreground mt-1">Next check-in: {structured.nextCheckIn}</p>
        ) : null}
      </section>

      {structured.keyMetrics?.length ? (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Key metrics</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {structured.keyMetrics.map((metric, idx) => (
              <div
                key={`${metric.title}-${idx}`}
                className="rounded-xl border border-border/40 bg-background/50 px-4 py-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.title}</p>
                  <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                  {metric.insight ? <p className="text-xs text-muted-foreground mt-2">{metric.insight}</p> : null}
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
        </section>
      ) : null}

      {structured.recommendations?.length ? (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Recommended actions</h3>
          <div className="space-y-3">
            {structured.recommendations.map((rec, idx) => (
              <div key={`${rec.title}-${idx}`} className="rounded-xl border border-border/30 bg-background/40 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{rec.title}</p>
                  <Badge
                    variant={rec.priority === "high" ? "default" : "outline"}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{rec.action}</p>
                <p className="text-xs text-foreground/70 mt-1">Impact: {rec.impact}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {structured.watchlist?.length ? (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Watchlist</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {structured.watchlist.map((item, idx) => (
              <div key={`${item.issue}-${idx}`} className="rounded-xl border border-amber-300/60 bg-amber-50/60 px-4 py-3 text-sm">
                <p className="font-semibold text-amber-900">{item.issue}</p>
                <p className="text-xs text-amber-900/80">Risk: {item.risk}</p>
                <p className="text-xs text-amber-900/90 mt-1">Suggested action: {item.suggestedAction}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {structured.icebreakers?.length ? (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">One-to-one icebreakers</h3>
          <div className="space-y-3">
            {structured.icebreakers.map((breaker, idx) => (
              <div key={`${breaker.audience}-${idx}`} className="rounded-xl border border-border/30 bg-background/60 px-4 py-3">
                <p className="font-semibold">{breaker.audience}</p>
                <p className="text-xs text-muted-foreground mb-2">Goal: {breaker.conversationGoal}</p>
                <p className="text-sm leading-relaxed text-foreground/90">{breaker.script}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {typeof tokens === "number" ? (
        <p className="text-xs text-muted-foreground">Tokens used: {tokens}</p>
      ) : null}
    </div>
  );
};

const EmptyState = ({ message = "No insights available" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/50 rounded-3xl bg-muted/10">
    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-100 via-blue-100 to-sky-100 flex items-center justify-center mb-5 shadow-sm">
      <Sparkles className="h-10 w-10 text-purple-600" />
    </div>
    <h3 className="text-base font-semibold mb-2">Nothing here yet</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      {message}. Run a new insight to generate tailored recommendations for your teams.
    </p>
  </div>
);

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

