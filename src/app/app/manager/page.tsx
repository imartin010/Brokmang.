import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/stat-card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { Badge } from "@/components/ui/badge";

type TeamSummary = Database["public"]["Tables"]["team_leader_dashboard"]["Row"];
type MemberPerformance = Database["public"]["Tables"]["team_member_performance"]["Row"];

const ALLOWED_ROLES: ProfileWithRole["role"][] = ["sales_manager", "business_unit_head", "ceo"];

export default async function ManagerDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/sign-in");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, organization_id, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileData as ProfileWithRole | null;
  if (!profile || !requireRole(profile, ALLOWED_ROLES)) redirect("/app");

  let businessUnitId: string | null = null;
  if (profile.role === "business_unit_head") {
    const { data: buData } = await supabase
      .from("business_units")
      .select("id")
      .eq("leader_id", session.user.id)
      .eq("organization_id", profile.organization_id)
      .maybeSingle();
    businessUnitId = (buData as { id: string } | null)?.id ?? null;
  }

  let teamsQuery = supabase.from("team_leader_dashboard").select("*");
  if (businessUnitId) teamsQuery = teamsQuery.eq("business_unit_id", businessUnitId);

  const { data: teamData } = await teamsQuery.order("team_name", { ascending: true });
  const teams = (teamData ?? []) as TeamSummary[];

  const { data: membersData } = await supabase
    .from("team_member_performance")
    .select("*")
    .order("closed_value", { ascending: false });

  const members = (membersData ?? []) as MemberPerformance[];

  const displayName = profile.full_name ?? "Manager";
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, t) => sum + (t.member_count ?? 0), 0);
  const totalPipeline = teams.reduce((sum, t) => sum + Number(t.weighted_pipeline || 0), 0);
  const totalClosed = teams.reduce((sum, t) => sum + Number(t.total_closed_value || 0), 0);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {greeting}, {displayName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-base">Multi-team performance overview and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Teams" value={totalTeams} subtitle="Active teams" iconName="users" />
        <StatCard title="Total Agents" value={totalMembers} subtitle="Across all teams" iconName="target" />
        <StatCard title="Pipeline" value={`${(totalPipeline / 1000000).toFixed(1)}M EGP`} subtitle="Total weighted" iconName="trending-up" />
        <StatCard title="Closed Value" value={`${(totalClosed / 1000000).toFixed(1)}M EGP`} subtitle="Total revenue" iconName="dollar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetCard title="Teams Comparison" iconName="chart" subtitle={`${totalTeams} teams`}>
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.team_id} className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{team.team_name}</h4>
                  <Badge variant="secondary" className="text-[10px]">{team.member_count} members</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Deals</p><p className="font-semibold">{team.open_deals ?? 0}</p></div>
                  <div><p className="text-muted-foreground">Pipeline</p><p className="font-semibold text-purple-600">{team.weighted_pipeline ? `${(Number(team.weighted_pipeline) / 1000000).toFixed(1)}M` : "0"}</p></div>
                  <div><p className="text-muted-foreground">Closed</p><p className="font-semibold text-green-600">{team.total_closed_value ? `${(Number(team.total_closed_value) / 1000000).toFixed(1)}M` : "0"}</p></div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Top Performers" iconName="star" subtitle="By closed value">
          <div className="space-y-2">
            {members.slice(0, 8).map((member, idx) => (
              <div key={member.agent_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                  <span className="text-xs font-medium">{member.agent_name || "Agent"}</span>
                </div>
                <span className="text-xs font-bold text-green-600">
                  {member.closed_value ? `${(Number(member.closed_value) / 1000000).toFixed(1)}M EGP` : "0"}
                </span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
