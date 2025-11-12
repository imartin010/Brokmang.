"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createMeetingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  meetingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meetingTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().min(15).max(480).optional(),
  location: z.string().max(200).optional(),
  dealId: z.string().uuid().optional(),
  clientRequestId: z.string().uuid().optional(),
  attendees: z.array(z.string()).optional(),
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
  const parsed = createMeetingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get user profile
  const profileResult = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json(
      { error: profileResult.error?.message ?? "Profile not found" },
      { status: 400 },
    );
  }

  const { organization_id } = profileResult.data;

  const meetingPayload = {
    organization_id,
    agent_id: session.user.id,
    deal_id: parsed.data.dealId ?? null,
    client_request_id: parsed.data.clientRequestId ?? null,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    meeting_date: parsed.data.meetingDate,
    meeting_time: parsed.data.meetingTime,
    duration_minutes: parsed.data.durationMinutes ?? 60,
    location: parsed.data.location ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSONB array type inference limitation
    attendees: parsed.data.attendees ? (parsed.data.attendees as any) : [],
    status: "scheduled" as const,
  } satisfies Database["public"]["Tables"]["meetings"]["Insert"];

  const { data: meetingData, error } = await (supabase
    .from("meetings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(meetingPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: meetingData }, { status: 201 });
}

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

  const { organization_id, role } = profileResult.data;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let query = supabase
    .from("meetings")
    .select("*")
    .eq("organization_id", organization_id);

  // Filter by role
  if (role === "sales_agent") {
    query = query.eq("agent_id", session.user.id);
  } else if (role === "team_leader") {
    // Team leaders see their team's meetings
    const { data: teamData } = await supabase
      .from("teams")
      .select("id")
      .eq("leader_id", session.user.id)
      .maybeSingle();
    
    if (teamData) {
      const team = teamData as Pick<Database["public"]["Tables"]["teams"]["Row"], "id">;
      const { data: membersData } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", team.id);
      
      const members = (membersData ?? []) as Pick<Database["public"]["Tables"]["team_members"]["Row"], "user_id">[];
      const memberIds = members.map(m => m.user_id);
      if (memberIds.length > 0) {
        query = query.in("agent_id", memberIds);
      } else {
        query = query.eq("agent_id", session.user.id); // Only own meetings if no team members
      }
    }
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (startDate) {
    query = query.gte("meeting_date", startDate);
  }

  if (endDate) {
    query = query.lte("meeting_date", endDate);
  }

  query = query.order("meeting_date", { ascending: true }).order("meeting_time", { ascending: true });

  const { data: meetingsData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: meetingsData });
}

