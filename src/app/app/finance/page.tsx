import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { StatCard } from "@/components/dashboard/stat-card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { CostEntryForm } from "@/components/finance/cost-entry-form";
import { SalaryManagement } from "@/components/finance/salary-management";
import { CommissionConfig } from "@/components/finance/commission-config";
import { TaxConfig } from "@/components/finance/tax-config";
import { PnLStatement } from "@/components/finance/pnl-statement";

const ALLOWED_ROLES: ProfileWithRole["role"][] = ["finance", "ceo"];

export default async function FinanceDashboardPage() {
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

  const displayName = profile.full_name ?? "Finance";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{greeting}, {displayName.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-base">Financial management and reporting</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenue" value="0 EGP" subtitle="Total revenue" iconName="dollar" />
        <StatCard title="Costs" value="0 EGP" subtitle="Total expenses" iconName="trending-down" />
        <StatCard title="Salaries" value="0 EGP" subtitle="Employee costs" iconName="users" />
        <StatCard title="Margin" value="0 EGP" subtitle="Net profit" iconName="trending-up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetCard title="Cost Management" iconName="dollar" subtitle="Add fixed & variable costs">
          <CostEntryForm />
        </WidgetCard>
        <WidgetCard title="P&L Statement" iconName="chart" subtitle="Profit & Loss overview">
          <PnLStatement />
        </WidgetCard>
        <WidgetCard title="Salary Management" iconName="users" subtitle="Employee salaries">
          <SalaryManagement />
        </WidgetCard>
        <div className="space-y-6">
          <WidgetCard title="Commission Rates" iconName="trending-up" subtitle="Configure commissions">
            <CommissionConfig />
          </WidgetCard>
          <WidgetCard title="Tax Configuration" iconName="file" subtitle="Tax settings">
            <TaxConfig />
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
