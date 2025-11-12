"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const checkOutSchema = z.object({
  location: z.string().optional(),
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
  const parsed = checkOutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Find today's check-in record
  const today = new Date().toISOString().split("T")[0];
  const { data: existingCheckInData } = await supabase
    .from("attendance_logs")
    .select("id, check_in_time, check_out_time")
    .eq("agent_id", session.user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (!existingCheckInData) {
    return NextResponse.json(
      { error: "No check-in found for today. Please check in first." },
      { status: 400 },
    );
  }

  const checkIn = existingCheckInData as Database["public"]["Tables"]["attendance_logs"]["Row"];

  if (checkIn.check_out_time) {
    return NextResponse.json(
      { error: "Already checked out today", data: checkIn },
      { status: 400 },
    );
  }

  // Update with check-out time
  const updatePayload = {
    check_out_time: new Date().toISOString(),
    location_check_out: parsed.data.location ?? null,
  } satisfies Database["public"]["Tables"]["attendance_logs"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("attendance_logs") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: attendanceData, error } = await (updateFn as any)
    .eq("id", checkIn.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: attendanceData }, { status: 200 });
}

