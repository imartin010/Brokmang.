import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { Sparkles, TrendingUp, Clock, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  // Fetch all insights
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Personalized recommendations and strategic analysis
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm h-10"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Insight
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/40 bg-gradient-to-br from-green-50 to-green-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700/70 font-medium uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{completedInsights.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600/40" />
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/40 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700/70 font-medium uppercase tracking-wide">Processing</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{processingInsights.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600/40" />
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/40 bg-gradient-to-br from-gray-50 to-gray-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-700/70 font-medium uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{insights.length}</p>
            </div>
            <Sparkles className="h-8 w-8 text-gray-600/40" />
          </div>
        </div>
      </div>

      {/* Insights List with Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start border-b border-border/40 bg-transparent rounded-none h-auto p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
          >
            All Insights
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
          >
            Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {insights.length === 0 ? (
            <EmptyState />
          ) : (
            insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedInsights.length === 0 ? (
            <EmptyState message="No completed insights yet" />
          ) : (
            completedInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4 mt-6">
          {processingInsights.length === 0 ? (
            <EmptyState message="No insights currently processing" />
          ) : (
            processingInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "pending":
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 via-blue-50/50 to-transparent border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              {getStatusBadge(insight.status)}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {new Date(insight.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          {insight.output?.model && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                {insight.output.model}
              </p>
              {insight.output.tokens_used && (
                <p className="text-[10px] text-muted-foreground">
                  {insight.output.tokens_used.toLocaleString()} tokens
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {insight.status === "completed" && insight.output?.insights ? (
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {insight.output.insights}
            </div>
          </div>
        ) : insight.status === "failed" ? (
          <div className="text-sm text-red-600">{insight.output?.error || "Failed to generate insight"}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Processing...</div>
        )}
      </div>

      {/* Actions */}
      {insight.status === "completed" && (
        <div className="px-6 py-4 bg-muted/20 border-t border-border/40 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Download className="mr-1.5 h-3 w-3" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Share2 className="mr-1.5 h-3 w-3" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message = "No insights available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-5 shadow-sm">
        <Sparkles className="h-10 w-10 text-purple-600" />
      </div>
      <h3 className="text-base font-semibold mb-2">No Insights Yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {message}. Generate your first insight to get started with AI-powered recommendations.
      </p>
    </div>
  );
}

