"use server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agentIdParam = searchParams.get("agentId");

  // Get user profile to check role
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

  const { organization_id, role } = profileResult.data;
  const today = new Date().toISOString().split("T")[0];

  // For agents: get their own attendance
  // For leaders/managers: get team/organization attendance
  if (role === "sales_agent") {
    const { data: attendanceData, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("agent_id", session.user.id)
      .eq("work_date", today)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const attendance =
      attendanceData as Database["public"]["Tables"]["attendance_logs"]["Row"] | null;

    return NextResponse.json({
      data: attendance,
      isCheckedIn: !!attendance?.check_in_time,
      isCheckedOut: !!attendance?.check_out_time,
    });
  }

  // For team leaders and above: get today's attendance view
  if (agentIdParam) {
    const { data: attendanceData, error } = await supabase
      .from("attendance_today")
      .select("*")
      .eq("organization_id", organization_id)
      .eq("agent_id", agentIdParam)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: attendanceData });
  }

  const { data: attendanceData, error } = await supabase
    .from("attendance_today")
    .select("*")
    .eq("organization_id", organization_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: attendanceData });
}

