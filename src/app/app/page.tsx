import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

type ProfileRole = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

export default async function ProtectedHome() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileData as ProfileRole | null;

  const destination = getRoleLandingPath(profile?.role);
  if (destination !== "/app") {
    redirect(destination);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Welcome to brokmang.</h2>
      <p className="text-muted-foreground">
        Your profile is set up, but we don&apos;t have a role-specific workspace yet. Please contact
        your administrator.
      </p>
    </section>
  );
}
