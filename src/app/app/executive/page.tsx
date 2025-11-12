import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/stat-card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { Badge } from "@/components/ui/badge";

type OrganizationOverview = Database["public"]["Tables"]["organization_overview"]["Row"];
type FinanceOverview = Database["public"]["Tables"]["business_unit_finance_overview"]["Row"];
type TeamSummary = Database["public"]["Tables"]["team_leader_dashboard"]["Row"];

const ALLOWED_ROLES: ProfileWithRole["role"][] = ["ceo", "admin"];

export default async function ExecutiveDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/sign-in");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, organization_id, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileData as ProfileWithRole | null;
  if (!profile || !requireRole(profile, ALLOWED_ROLES)) redirect("/app");

  const { data: orgData } = await supabase
    .from("organization_overview")
    .select("*")
    .eq("id", profile.organization_id)
    .maybeSingle();

  const orgOverview = orgData as OrganizationOverview | null;

  const { data: financeData } = await supabase
    .from("business_unit_finance_overview")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("business_unit_name", { ascending: true });

  const financeOverviews = (financeData ?? []) as FinanceOverview[];

  const { data: teamData } = await supabase
    .from("team_leader_dashboard")
    .select("*")
    .order("team_name", { ascending: true });

  const teams = (teamData ?? []) as TeamSummary[];

  const displayName = profile.full_name ?? "CEO";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{greeting}, {displayName.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-base">Executive overview of organizational performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Members" value={orgOverview?.member_count || 0} subtitle="Organization-wide" iconName="users" />
        <StatCard title="Business Units" value={orgOverview?.business_unit_count || 0} subtitle="Active BUs" iconName="building" />
        <StatCard title="Teams" value={orgOverview?.team_count || 0} subtitle="Active teams" iconName="chart" />
        <StatCard title="Revenue" value={orgOverview?.total_revenue ? `${(Number(orgOverview.total_revenue) / 1000000).toFixed(1)}M EGP` : "0 EGP"} subtitle="Total revenue" iconName="dollar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetCard title="Business Units" iconName="building" subtitle={`${financeOverviews.length} BUs`}>
          <div className="space-y-3">
            {financeOverviews.map((bu) => (
              <div key={bu.business_unit_id} className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all">
                <h4 className="font-semibold text-sm mb-2">{bu.business_unit_name}</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Revenue</p><p className="font-semibold text-green-600">{bu.total_revenue ? `${(Number(bu.total_revenue) / 1000000).toFixed(1)}M` : "0"}</p></div>
                  <div><p className="text-muted-foreground">Expenses</p><p className="font-semibold text-red-600">{bu.total_expenses ? `${(Number(bu.total_expenses) / 1000000).toFixed(1)}M` : "0"}</p></div>
                  <div><p className="text-muted-foreground">Margin</p><p className="font-semibold text-purple-600">{bu.total_margin ? `${(Number(bu.total_margin) / 1000000).toFixed(1)}M` : "0"}</p></div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Teams Overview" iconName="users" subtitle={`${teams.length} teams`}>
          <div className="space-y-2">
            {teams.slice(0, 6).map((team) => (
              <div key={team.team_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div><p className="text-xs font-medium">{team.team_name}</p><p className="text-[10px] text-muted-foreground">{team.member_count} members</p></div>
                <div className="text-right"><p className="text-xs font-bold text-purple-600">{team.weighted_pipeline ? `${(Number(team.weighted_pipeline) / 1000000).toFixed(1)}M` : "0"}</p></div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
