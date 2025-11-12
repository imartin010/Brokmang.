import { notFound, redirect } from "next/navigation";

import { getRoleLabel, getRoleLandingPath, ROLE_LANDING_PATHS } from "@/lib/auth/roles";
import { requireRole, type ProfileWithRole } from "@/lib/auth/guards";
import type { UserRole } from "@/lib/auth/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

type ProfileSummary = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role" | "full_name" | "organization_id"
>;

const SEGMENT_TO_ROLE: Record<string, UserRole> = {
  agent: "sales_agent",
  leader: "team_leader",
  manager: "sales_manager",
  finance: "finance",
  "business-unit": "business_unit_head",
  executive: "ceo",
  admin: "admin",
};

type RolePageProps = {
  params: Promise<{ segment: string }>;
};

export default async function RoleWorkspacePage({ params }: RolePageProps) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const resolvedParams = await params;
  const role = SEGMENT_TO_ROLE[resolvedParams.segment];
  if (!role) {
    notFound();
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name, organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileData as ProfileWithRole | null;

  if (!profile) {
    redirect("/app");
  }

  if (!requireRole(profile, [role])) {
    const fallbackPath = getRoleLandingPath(profile.role);
    redirect(fallbackPath);
  }

  const expectedPath = getRoleLandingPath(profile.role);
  if (ROLE_LANDING_PATHS[profile.role] && expectedPath !== `/app/${resolvedParams.segment}`) {
    redirect(expectedPath);
  }

  const roleLabel = getRoleLabel(profile.role);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-muted-foreground text-sm">{roleLabel} workspace</p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Welcome back{profile.full_name ? `, ${profile.full_name}` : ""} 👋
        </h2>
        <p className="text-muted-foreground text-sm">
          This page will soon hold dashboards tailored for your role. In the meantime, confirm your
          access and explore upcoming workflows.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="border-border bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="text-lg font-medium">What&apos;s coming next</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            We&apos;re building role-specific analytics, guided workflows, and AI-assisted
            recommendations to help you hit targets faster.
          </p>
        </article>

        <article className="border-border bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="text-lg font-medium">Need something added?</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Share your requirements with the product team so we can wire the data and visualisations
            you rely on.
          </p>
        </article>
      </div>
    </section>
  );
}
