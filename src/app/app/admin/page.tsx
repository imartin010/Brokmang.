import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import type { ProfileWithRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/stat-card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { Badge } from "@/components/ui/badge";

type OrganizationOverview = Database["public"]["Tables"]["organization_overview"]["Row"];

const ALLOWED_ROLES: ProfileWithRole["role"][] = ["admin", "ceo"];

export default async function AdminDashboardPage() {
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

  const { data: usersData } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
  };

  const users = (usersData || []) as UserProfile[];

  const displayName = profile.full_name ?? "Admin";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  const roleCount = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{greeting}, {displayName.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-base">System administration and user management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={orgOverview?.member_count || 0} subtitle="Active members" iconName="users" />
        <StatCard title="Business Units" value={orgOverview?.business_unit_count || 0} subtitle="Active BUs" iconName="building" />
        <StatCard title="Teams" value={orgOverview?.team_count || 0} subtitle="Active teams" iconName="chart" />
        <StatCard title="Roles" value={Object.keys(roleCount || {}).length} subtitle="Unique roles" iconName="user-check" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WidgetCard title="User Management" iconName="users" subtitle={`${users.length} users`}>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:shadow-sm transition-all">
                  <div>
                    <p className="text-sm font-semibold">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px]">{user.role.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          </WidgetCard>
        </div>
        <WidgetCard title="Role Distribution" iconName="chart" subtitle="By role type">
          <div className="space-y-2">
            {Object.entries(roleCount || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-xs font-medium capitalize">{role.replace("_", " ")}</span>
                <Badge variant="secondary" className="text-[10px]">{count}</Badge>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}
