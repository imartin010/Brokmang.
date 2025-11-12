import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { TeamLeaderKPICards } from "./team-leader-kpi-cards";
import { TeamLeaderOverview } from "./tabs/overview-tab";
import { SupervisionDashboard } from "@/components/leader/supervision-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TeamSummary = Database["public"]["Tables"]["team_leader_dashboard"]["Row"];
type MemberPerformance = Database["public"]["Tables"]["team_member_performance"]["Row"];

const ALLOWED_ROLES: ProfileWithRole["role"][] = [
  "team_leader",
  "sales_manager",
  "business_unit_head",
  "ceo",
];

export default async function LeaderDashboardPage() {
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

  if (!profile || !requireRole(profile, ALLOWED_ROLES)) {
    redirect("/app");
  }

  // Get team ID for team leaders
  let teamLeaderTeamId: string | undefined;
  if (profile.role === "team_leader") {
    const { data: teamLeaderData } = await supabase
      .from("teams")
      .select("id")
      .eq("leader_id", session.user.id)
      .maybeSingle();
    teamLeaderTeamId = (teamLeaderData as { id: string } | null)?.id;
  }

  const { data: teamData } = await supabase
    .from("team_leader_dashboard")
    .select("*")
    .order("team_name", { ascending: true });

  const teams = (teamData ?? []) as TeamSummary[];

  const { data: membersData } = await supabase
    .from("team_member_performance")
    .select("*")
    .order("team_id", { ascending: true })
    .order("closed_value", { ascending: false });

  const members = (membersData ?? []) as MemberPerformance[];

  const displayName = profile.full_name ?? session.user.email ?? "Leader";
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
          Manage your team and support your agents
        </p>
      </div>

      {/* KPI Cards */}
      <TeamLeaderKPICards teams={teams} members={members} />

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-xl h-auto">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5">
            Daily Routine
          </TabsTrigger>
          <TabsTrigger value="supervision" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5">
            Agent Supervision
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
          <TeamLeaderOverview userId={session.user.id} />
        </TabsContent>

        <TabsContent value="supervision" className="mt-8">
          <SupervisionDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
