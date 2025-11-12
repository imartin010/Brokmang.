"use server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile and role
  const profileResult = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json(
      { error: profileResult.error?.message ?? "Profile not found" },
      { status: 400 },
    );
  }

  const { role } = profileResult.data;
  const { searchParams } = new URL(request.url);
  const myTeam = searchParams.get("myTeam") === "true";

  // RLS handles organization filtering automatically
  const query = supabase.from("teams").select("*");

  // If myTeam=true, get the team where user is leader
  if (myTeam && role === "team_leader") {
    const { data: teamsData, error } = await query.eq("leader_id", session.user.id).maybeSingle();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data: teamsData || null });
  }

  const { data: teamsData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return single team if myTeam=true, otherwise return array
  if (myTeam) {
    return NextResponse.json({ data: teamsData?.[0] || null });
  }

  return NextResponse.json({ data: teamsData || [] });
}

