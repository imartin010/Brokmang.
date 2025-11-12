import { NextResponse } from "next/server";

import { ensureProfileForUser } from "@/lib/auth/profiles";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

type ProfileRole = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect_to") ?? "/app";

  if (!code) {
    const errorUrl = new URL("/sign-in", origin);
    errorUrl.searchParams.set("error", "Missing authentication code");
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    const errorUrl = new URL("/sign-in", origin);
    errorUrl.searchParams.set("error", encodeURIComponent(error?.message ?? "Unable to sign in"));
    return NextResponse.redirect(errorUrl);
  }

  await ensureProfileForUser(session.user);

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileData as ProfileRole | null;

  const defaultLanding = profile ? getRoleLandingPath(profile.role) : "/app";
  const destination =
    redirectTo === "/app" || redirectTo === defaultLanding ? defaultLanding : redirectTo;

  return NextResponse.redirect(new URL(destination, origin));
}
