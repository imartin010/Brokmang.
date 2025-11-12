"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createRequestSchema = z.object({
  clientName: z.string().min(2).max(200),
  clientPhone: z.string().min(10).max(20),
  destination: z.string().min(2).max(200),
  clientBudget: z.number().min(0),
  projectNeeded: z.string().min(3).max(500),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(1000).optional(),
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
  const parsed = createRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get user profile, team, and team leader
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

  // Get agent's team_id from team_members
  const { data: teamMemberData } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const teamMember = teamMemberData as
    | Pick<Database["public"]["Tables"]["team_members"]["Row"], "team_id">
    | null;
  const teamId = teamMember?.team_id ?? null;

  // Get team leader_id from teams
  let teamLeaderId: string | null = null;
  if (teamId) {
    const { data: teamData } = await supabase
      .from("teams")
      .select("leader_id")
      .eq("id", teamId)
      .maybeSingle();
    const team = teamData as Pick<Database["public"]["Tables"]["teams"]["Row"], "leader_id"> | null;
    teamLeaderId = team?.leader_id ?? null;
  }

  const requestPayload = {
    organization_id,
    agent_id: session.user.id,
    team_id: teamId,
    team_leader_id: teamLeaderId,
    status: "pending" as const,
    client_name: parsed.data.clientName,
    client_phone: parsed.data.clientPhone,
    destination: parsed.data.destination,
    client_budget: parsed.data.clientBudget,
    project_needed: parsed.data.projectNeeded,
    delivery_date: parsed.data.deliveryDate ?? null,
    agent_notes: parsed.data.notes ?? null,
  } satisfies Database["public"]["Tables"]["client_requests"]["Insert"];

  const { data: requestData, error } = await (supabase
    .from("client_requests")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(requestPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: requestData }, { status: 201 });
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

  let query = supabase
    .from("client_requests")
    .select("*")
    .eq("organization_id", organization_id);

  // Filter by role
  if (role === "sales_agent") {
    // Agents see only their own requests
    query = query.eq("agent_id", session.user.id);
  } else if (role === "team_leader") {
    // Team leaders see their team's requests
    query = query.eq("team_leader_id", session.user.id);
  }
  // Sales managers, BU heads, CEOs see all requests in organization

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false });

  const { data: requestsData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: requestsData });
}

