import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

type ParsedInsightGroup = {
  name: string;
  metrics: { label: string; value: string }[];
};

type ParsedInsightSection = {
  heading: string;
  groups: ParsedInsightGroup[];
  notes: string[];
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

  if (!profile || profile.role === "sales_agent") {
    redirect("/app");
  }

  const { data: insightsData } = await supabase
    .from("ai_insight_recent")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const insights = (insightsData || []) as Insight[];

  const completedInsights = insights.filter((i) => i.status === "completed");
  const failedInsights = insights.filter((i) => i.status === "failed");
  const processingInsights = insights.filter((i) => i.status === "pending" || i.status === "processing");

  const stats = [
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-sky-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Executive-ready intelligence tailored to your organization&apos;s current performance.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-sky-500 hover:from-purple-700 hover:to-sky-600 text-white shadow-md border-0 h-11 px-6"
        >
          <Link href="/app/insights?generate=1">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Insight
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`rounded-2xl border border-border/40 bg-gradient-to-br ${stat.accent} p-5 shadow-sm`}
          >
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
      </div>

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

function InsightCard({ insight }: { insight: Insight }) {
  const createdAt = new Date(insight.created_at);
  const completedAt = insight.completed_at ? new Date(insight.completed_at) : null;

  const meta: { label: string; value: string }[] = [
    { label: "Scope", value: formatLabel(insight.scope) },
    { label: "Initiated by", value: insight.initiated_by || "System" },
    { label: "Generated", value: formatDateTime(createdAt) },
  ];

  if (completedAt) {
    meta.push({ label: "Turnaround", value: formatDuration(createdAt, completedAt) });
  }

  const statusBadge = getStatusBadge(insight.status);

  return (
    <div className="rounded-2xl border border-border/40 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="px-6 py-5 bg-gradient-to-r from-purple-50/70 via-blue-50/40 to-transparent border-b border-border/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              {statusBadge}
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5" suppressHydrationWarning>
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(createdAt)}
              </p>
            </div>
          </div>
          {insight.output?.model ? (
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                {insight.output.model}
              </p>
              {insight.output.tokens_used ? (
                <p className="text-[11px] text-muted-foreground">{insight.output.tokens_used.toLocaleString()} tokens</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.map((item) => (
            <span
              key={`${insight.id}-${item.label}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 bg-white/70 border border-border/40 px-3 py-1.5 rounded-full"
            >
              <span className="font-medium text-foreground/80">{item.label}:</span>
              <span>{item.value}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {insight.status === "completed" && insight.output?.insights ? (
          <InsightContent text={insight.output.insights} />
        ) : insight.status === "failed" ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{insight.output?.error || "Failed to generate insight"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            Processing latest performance data...
          </div>
        )}
      </div>

      {insight.status === "completed" && (
        <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
}

function InsightContent({ text }: { text: string }) {
  const sections = parseInsightSections(text);

  if (sections.length === 0) {
    return (
      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap border border-border/40 rounded-xl bg-muted/20 px-5 py-4">
        {text}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.heading} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{section.heading}</h3>
              {section.notes.length > 0 ? (
                <p className="text-xs text-muted-foreground">{section.notes.join(" · ")}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            {section.groups.map((group) => {
              const groupMeta = getGroupMeta(group.name);
              return (
                <div
                  key={group.name}
                  className="rounded-2xl border border-border/40 bg-white/80 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-gradient-to-br from-muted/60 to-muted/20 text-muted-foreground">
                        {groupMeta.icon}
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground/70">{groupMeta.label}</p>
                        <h4 className="text-base font-semibold text-foreground">{group.name}</h4>
                      </div>
                    </div>
                    <Badge variant="secondary" className="uppercase tracking-wide text-[10px]">
                      {group.metrics.length} insight{group.metrics.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.metrics.map((metric, idx) => (
                      <div
                        key={`${group.name}-${metric.label}-${idx}`}
                        className="rounded-xl border border-border/30 bg-gradient-to-br from-white to-muted/30 px-4 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                          {metric.label}
                        </p>
                        <p className="text-lg font-semibold text-foreground mt-2">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message = "No insights available" }: { message?: string }) {
  return (
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
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>;
    case "pending":
    case "processing":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function parseInsightSections(text: string): ParsedInsightSection[] {
  const sections: ParsedInsightSection[] = [];

  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let currentSection: ParsedInsightSection | null = null;
  let currentGroup: ParsedInsightGroup | null = null;

  const ensureSection = (heading: string) => {
    if (!currentSection) {
      currentSection = { heading, groups: [], notes: [] };
      sections.push(currentSection);
    }
  };

  lines.forEach((line) => {
    if (line.startsWith("### ")) {
      const heading = line.replace(/^###\s*/, "").trim() || "Insights";
      currentSection = { heading, groups: [], notes: [] };
      sections.push(currentSection);
      currentGroup = null;
      return;
    }

    const groupMatch = line.match(/^[-*]\s*\*\*(.+?)\*\*:?$/);
    if (groupMatch) {
      const groupName = groupMatch[1].trim();
      ensureSection("Highlights");
      currentGroup = { name: groupName, metrics: [] };
      currentSection!.groups.push(currentGroup);
      return;
    }

    const metricMatch = line.match(/^[-*]\s*(.+?):\s*(.+)$/);
    if (metricMatch) {
      const [, rawLabel, rawValue] = metricMatch;
      ensureSection("Highlights");
      if (!currentGroup) {
        currentGroup = { name: "Summary", metrics: [] };
        currentSection!.groups.push(currentGroup);
      }
      currentGroup.metrics.push({ label: cleanMetricLabel(rawLabel), value: rawValue.trim() });
      return;
    }

    if (line.length > 0) {
      ensureSection("Highlights");
      currentSection!.notes.push(line.replace(/^[-*]\s*/, ""));
    }
  });

  return sections;
}

function cleanMetricLabel(label: string) {
  return label.replace(/\*\*/g, "").trim();
}

function getGroupMeta(name: string): { label: string; icon: ReactNode } {
  if (/team/i.test(name)) {
    return { label: "Team overview", icon: <Users className="h-4 w-4" /> };
  }
  if (/agent/i.test(name)) {
    return { label: "Agent focus", icon: <UserCircle2 className="h-4 w-4" /> };
  }
  if (/revenue|pipeline|commission|finance/i.test(name)) {
    return { label: "Financials", icon: <TrendingUp className="h-4 w-4" /> };
  }
  return { label: "Insights", icon: <Sparkles className="h-4 w-4" /> };
}

function formatLabel(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTime(date: Date) {
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
}

function formatDuration(start: Date, end: Date) {
  const diffMs = Math.max(end.getTime() - start.getTime(), 0);
  const totalMinutes = Math.round(diffMs / 60000);

  if (totalMinutes < 60) {
    return `${Math.max(totalMinutes, 1)} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours < 24) {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`;
}

