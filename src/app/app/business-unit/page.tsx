import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/stat-card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { PnLStatementClient } from "@/components/finance/pnl-statement-client";

type FinanceOverview = Database["public"]["Tables"]["business_unit_finance_overview"]["Row"];
type TeamSummary = Database["public"]["Tables"]["team_leader_dashboard"]["Row"];

const ALLOWED_ROLES: ProfileWithRole["role"][] = ["business_unit_head", "ceo"];

export default async function BusinessUnitDashboardPage() {
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

  let businessUnitId: string | null = null;
  if (profile.role === "business_unit_head") {
    const { data: buData } = await supabase
      .from("business_units")
      .select("id")
      .eq("leader_id", session.user.id)
      .maybeSingle();
    businessUnitId = (buData as { id: string } | null)?.id ?? null;
  }

  let financeQuery = supabase.from("business_unit_finance_overview").select("*");
  if (businessUnitId) financeQuery = financeQuery.eq("business_unit_id", businessUnitId);

  const { data: financeData } = await financeQuery.order("business_unit_name", { ascending: true });
  const financeOverviews = (financeData ?? []) as FinanceOverview[];

  let teamsQuery = supabase.from("team_leader_dashboard").select("*");
  if (businessUnitId) teamsQuery = teamsQuery.eq("business_unit_id", businessUnitId);

  const { data: teamData } = await teamsQuery.order("team_name", { ascending: true });
  const teams = (teamData ?? []) as TeamSummary[];

  const displayName = profile.full_name ?? "BU Head";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  const totalRevenue = financeOverviews.reduce((sum, f) => sum + Number(f.total_revenue || 0), 0);
  const totalExpenses = financeOverviews.reduce((sum, f) => sum + Number(f.total_expenses || 0), 0);
  const totalMargin = totalRevenue - totalExpenses;
  const totalTeams = teams.length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{greeting}, {displayName.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-base">Business unit performance and financial overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenue" value={`${(totalRevenue / 1000000).toFixed(1)}M EGP`} subtitle="Total revenue" iconName="dollar" />
        <StatCard title="Expenses" value={`${(totalExpenses / 1000000).toFixed(1)}M EGP`} subtitle="Total costs" iconName="trending-down" />
        <StatCard title="Net Margin" value={`${(totalMargin / 1000000).toFixed(1)}M EGP`} subtitle="Profit" iconName="trending-up" />
        <StatCard title="Teams" value={totalTeams} subtitle="Active teams" iconName="users" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetCard title="P&L Overview" iconName="dollar" subtitle="Financial statement">
          <PnLStatementClient businessUnitId={businessUnitId ?? undefined} />
        </WidgetCard>
        <WidgetCard title="Team Performance" iconName="chart" subtitle={`${totalTeams} teams in BU`}>
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.team_id} className="p-3 rounded-xl border border-border/40">
                <h4 className="font-semibold text-sm mb-2">{team.team_name}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Pipeline</p><p className="font-semibold text-purple-600">{team.weighted_pipeline ? `${(Number(team.weighted_pipeline) / 1000000).toFixed(1)}M` : "0"}</p></div>
                  <div><p className="text-muted-foreground">Closed</p><p className="font-semibold text-green-600">{team.total_closed_value ? `${(Number(team.total_closed_value) / 1000000).toFixed(1)}M` : "0"}</p></div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
