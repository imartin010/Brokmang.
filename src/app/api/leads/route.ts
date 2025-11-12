"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createLeadSchema = z.object({
  clientName: z.string().min(2).max(200),
  clientPhone: z.string().min(10).max(20).optional(),
  clientEmail: z.string().email().optional(),
  destination: z.string().min(2).max(200).optional(),
  estimatedBudget: z.number().min(0).optional(),
  projectType: z.string().max(200).optional(),
  sourceId: z.string().uuid().optional(),
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
  const parsed = createLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get user profile, team
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

  // Get agent's team
  const { data: teamMemberData } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const teamMember = teamMemberData as
    | Pick<Database["public"]["Tables"]["team_members"]["Row"], "team_id">
    | null;
  const teamId = teamMember?.team_id ?? null;

  const leadPayload = {
    organization_id,
    agent_id: session.user.id,
    team_id: teamId,
    source_id: parsed.data.sourceId ?? null,
    client_name: parsed.data.clientName,
    client_phone: parsed.data.clientPhone ?? null,
    client_email: parsed.data.clientEmail ?? null,
    destination: parsed.data.destination ?? null,
    estimated_budget: parsed.data.estimatedBudget ?? null,
    project_type: parsed.data.projectType ?? null,
    status: "new" as const,
    received_date: new Date().toISOString().split("T")[0],
    notes: parsed.data.notes ?? null,
  } satisfies Database["public"]["Tables"]["leads"]["Insert"];

  const { data: leadData, error } = await (supabase
    .from("leads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(leadPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error || !leadData) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create lead" },
      { status: 500 },
    );
  }

  const lead = leadData as Database["public"]["Tables"]["leads"]["Row"];

  return NextResponse.json({ data: lead }, { status: 201 });
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
  const agentId = searchParams.get("agentId");

  let query = supabase
    .from("leads")
    .select("*")
    .eq("organization_id", organization_id);

  // Filter by role
  if (role === "sales_agent") {
    query = query.eq("agent_id", session.user.id);
  } else if (role === "team_leader") {
    // Team leaders see their team's leads
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
        query = query.eq("agent_id", session.user.id);
      }
    }
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (agentId && (role === "team_leader" || role === "sales_manager" || role === "business_unit_head" || role === "ceo")) {
    query = query.eq("agent_id", agentId);
  }

  query = query.order("received_date", { ascending: false }).order("created_at", { ascending: false });

  const { data: leadsData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: leadsData });
}

