"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const meetingIdParam = z.object({
  id: z.string().uuid(),
});

const updateMeetingSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    meetingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    durationMinutes: z.number().min(15).max(480).optional(),
    location: z.string().max(200).optional(),
    status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).optional(),
    outcome: z.string().max(500).optional(),
    attendees: z.array(z.string()).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Nothing to update",
  });

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const idResult = meetingIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid meeting id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateMeetingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the meeting exists and user has permission
  const { data: meetingData } = await supabase
    .from("meetings")
    .select("agent_id, organization_id")
    .eq("id", idResult.data.id)
    .maybeSingle();

  if (!meetingData) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const meeting = meetingData as Pick<
    Database["public"]["Tables"]["meetings"]["Row"],
    "agent_id" | "organization_id"
  >;

  // Agents can only update their own meetings
  if (meeting.agent_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized to update this meeting" }, { status: 403 });
  }

  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
  if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
  if (parsed.data.meetingDate !== undefined) updatePayload.meeting_date = parsed.data.meetingDate;
  if (parsed.data.meetingTime !== undefined) updatePayload.meeting_time = parsed.data.meetingTime;
  if (parsed.data.durationMinutes !== undefined) updatePayload.duration_minutes = parsed.data.durationMinutes;
  if (parsed.data.location !== undefined) updatePayload.location = parsed.data.location;
  if (parsed.data.status !== undefined) updatePayload.status = parsed.data.status;
  if (parsed.data.outcome !== undefined) updatePayload.outcome = parsed.data.outcome;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSONB array type inference limitation
  if (parsed.data.attendees !== undefined) updatePayload.attendees = parsed.data.attendees as any;

  const updatePayloadTyped = updatePayload as Database["public"]["Tables"]["meetings"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("meetings") as unknown as { update: (payload: any) => any }).update(updatePayloadTyped);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: meetingResult, error } = await (updateFn as any)
    .eq("id", idResult.data.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: meetingResult });
}

export async function DELETE(request: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const idResult = meetingIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid meeting id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the meeting exists and user has permission
  const { data: meetingData } = await supabase
    .from("meetings")
    .select("agent_id")
    .eq("id", idResult.data.id)
    .maybeSingle();

  if (!meetingData) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const meeting = meetingData as Pick<
    Database["public"]["Tables"]["meetings"]["Row"],
    "agent_id"
  >;

  // Agents can only delete their own meetings
  if (meeting.agent_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized to delete this meeting" }, { status: 403 });
  }

  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", idResult.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Meeting deleted successfully" });
}

