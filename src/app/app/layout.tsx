import { redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getRoleLabel, type UserRole } from "@/lib/auth";
import { ensureProfileForUser } from "@/lib/auth/profiles";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

type ProfileSummary = Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "role">;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const profile = await ensureProfileForUser(session.user);

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", session.user.id)
    .maybeSingle();

  const profileDetails = profileData as ProfileSummary | null;

  const displayName =
    profileDetails?.full_name ?? session.user.email ?? session.user.user_metadata?.name ?? "User";
  const roleLabel = getRoleLabel(profileDetails?.role ?? profile?.role ?? null);
  const userRole = (profileDetails?.role ?? profile?.role ?? null) as UserRole | null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        userRole={userRole}
        userName={displayName}
        userEmail={session.user.email ?? null}
      />
      <div className="flex-1 flex flex-col lg:pl-64">
        <DashboardHeader userName={displayName} userRole={roleLabel} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
