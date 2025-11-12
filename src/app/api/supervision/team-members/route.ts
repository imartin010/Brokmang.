"use server";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's team
  const { data: teamData } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_id", session.user.id)
    .maybeSingle();

  const team = teamData as { id: string } | null;

  if (!team) {
    return NextResponse.json({ data: [] });
  }

  // Get team members with their profiles
  const { data: membersData, error } = await supabase
    .from("team_members")
    .select(`
      user_id,
      profiles:user_id (
        id,
        full_name,
        email,
        under_supervision,
        supervised_by,
        supervision_started_at
      )
    `)
    .eq("team_id", team.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the data
  const agents = (membersData || []).map((m: any) => m.profiles).filter(Boolean);

  return NextResponse.json({ data: agents });
}

