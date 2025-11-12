import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { AgentKPICards } from "./agent-kpi-cards";
import { AgentOverviewTab } from "./tabs/overview-tab";

type AgentSummary = Database["public"]["Tables"]["agent_dashboard_summary"]["Row"];
type AgentActivity = Database["public"]["Tables"]["agent_daily_activity"]["Row"];

const ALLOWED_AGENT_ROLES: ProfileWithRole["role"][] = ["sales_agent"];

export default async function AgentDashboardPage() {
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

  const profile = profileData as ProfileWithRole | null;

  if (!profile || !requireRole(profile, ALLOWED_AGENT_ROLES)) {
    redirect("/app");
  }

  const { data: summaryData } = await supabase
    .from("agent_dashboard_summary")
    .select("*")
    .eq("agent_id", session.user.id)
    .maybeSingle();

  const summary = summaryData as AgentSummary | null;

  const { data: activityData } = await supabase
    .from("agent_daily_activity")
    .select("*")
    .eq("agent_id", session.user.id)
    .order("activity_date", { ascending: false })
    .limit(10);

  const activity = (activityData ?? []) as AgentActivity[];

  const displayName = profile.full_name ?? session.user.email ?? "Agent";

  // Get current date info
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {greeting}, {displayName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-base">
          Here's your performance overview for today
        </p>
      </div>

      {/* KPI Cards - Live from Daily Workflow */}
      <AgentKPICards />

      {/* Main Content - Overview Only */}
      <AgentOverviewTab summary={summary} activity={activity} userId={session.user.id} />
    </div>
  );
}
