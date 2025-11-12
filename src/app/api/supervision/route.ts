"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const enableSupervisionSchema = z.object({
  agentId: z.string().min(1), // Relaxed from .uuid() for flexibility
});

export async function POST(request: Request) {
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

  // Only team leaders can enable supervision
  if (role !== "team_leader") {
    return NextResponse.json({ error: "Unauthorized. Only team leaders can enable supervision." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = enableSupervisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the agent is in the team leader's team
  const { data: teamData } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_id", session.user.id)
    .maybeSingle();

  if (!teamData) {
    return NextResponse.json({ error: "You are not a team leader" }, { status: 400 });
  }

  const team = teamData as Pick<Database["public"]["Tables"]["teams"]["Row"], "id">;

  const { data: memberData } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", team.id)
    .eq("user_id", parsed.data.agentId)
    .maybeSingle();

  if (!memberData) {
    return NextResponse.json({ error: "Agent is not in your team" }, { status: 403 });
  }

  // Enable supervision for the agent
  const updatePayload = {
    under_supervision: true,
    supervised_by: session.user.id,
    supervision_started_at: new Date().toISOString(),
  } satisfies Database["public"]["Tables"]["profiles"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("profiles") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: agentData, error } = await (updateFn as any)
    .eq("id", parsed.data.agentId)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: agentData });
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

  const { role } = profileResult.data;

  // Only team leaders can view supervised agents
  if (role !== "team_leader") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get all agents under supervision by this team leader
  const { data: supervisedAgents, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("supervised_by", session.user.id)
    .eq("under_supervision", true)
    .eq("role", "sales_agent");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: supervisedAgents });
}

export async function DELETE(request: Request) {
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

  // Only team leaders can disable supervision
  if (role !== "team_leader") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  // Verify the agent is supervised by this team leader
  const { data: agentProfileData } = await supabase
    .from("profiles")
    .select("supervised_by")
    .eq("id", agentId)
    .eq("supervised_by", session.user.id)
    .maybeSingle();

  if (!agentProfileData) {
    return NextResponse.json({ error: "Agent is not under your supervision" }, { status: 403 });
  }

  // Disable supervision
  const updatePayload = {
    under_supervision: false,
    supervised_by: null,
    supervision_started_at: null,
  } satisfies Database["public"]["Tables"]["profiles"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("profiles") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: agentData, error } = await (updateFn as any)
    .eq("id", agentId)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: agentData });
}

