"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const checkInSchema = z.object({
  location: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = checkInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get user profile and organization
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

  const { organization_id } = profileResult.data;

  // Check if already checked in today
  const today = new Date().toISOString().split("T")[0];
  const { data: existingCheckInData } = await supabase
    .from("attendance_logs")
    .select("id, check_in_time, check_out_time")
    .eq("agent_id", session.user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (existingCheckInData) {
    const checkIn = existingCheckInData as Database["public"]["Tables"]["attendance_logs"]["Row"];
    if (checkIn.check_out_time) {
      return NextResponse.json(
        { error: "Already checked out today. Cannot check in again." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Already checked in today", data: checkIn },
      { status: 400 },
    );
  }

  // Create check-in record
  const checkInPayload = {
    organization_id,
    agent_id: session.user.id,
    check_in_time: new Date().toISOString(),
    work_date: today,
    location_check_in: parsed.data.location ?? null,
    notes: parsed.data.notes ?? null,
  } satisfies Database["public"]["Tables"]["attendance_logs"]["Insert"];

  const { data: attendanceData, error } = await (supabase
    .from("attendance_logs")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(checkInPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: attendanceData }, { status: 201 });
}

