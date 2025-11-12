"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createRatingSchema = z.object({
  agentId: z.string().uuid(),
  appearanceScore: z.number().min(1).max(10),
  professionalismScore: z.number().min(1).max(10),
  honestyScore: z.number().min(1).max(10),
  kindnessScore: z.number().min(1).max(10),
  leadsReceived: z.number().min(0).optional(),
  dealsClosed: z.number().min(0).optional(),
  comments: z.string().max(1000).optional(),
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

  const { organization_id, role } = profileResult.data;

  // Only team leaders can rate agents
  if (role !== "team_leader") {
    return NextResponse.json({ error: "Unauthorized. Only team leaders can rate agents." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createRatingSchema.safeParse(body);

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

  const today = new Date().toISOString().split("T")[0];

  const ratingPayload = {
    organization_id,
    agent_id: parsed.data.agentId,
    rated_by: session.user.id,
    rating_date: today,
    appearance_score: parsed.data.appearanceScore,
    professionalism_score: parsed.data.professionalismScore,
    honesty_score: parsed.data.honestyScore,
    kindness_score: parsed.data.kindnessScore,
    leads_received_count: parsed.data.leadsReceived ?? 0,
    deals_closed_count: parsed.data.dealsClosed ?? 0,
    comments: parsed.data.comments ?? null,
  } satisfies Database["public"]["Tables"]["agent_daily_ratings"]["Insert"];

  const { data: ratingData, error } = await (supabase
    .from("agent_daily_ratings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .upsert(ratingPayload as any, { onConflict: "agent_id,rating_date,rated_by" }) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: ratingData }, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

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

  let query = supabase
    .from("agent_daily_ratings")
    .select("*")
    .eq("organization_id", organization_id);

  // Team leaders can see ratings for their team members
  if (role === "team_leader" && agentId) {
    // Verify agent is in team leader's team
    const { data: teamData } = await supabase
      .from("teams")
      .select("id")
      .eq("leader_id", session.user.id)
      .maybeSingle();
    
    if (teamData) {
      const team = teamData as Pick<Database["public"]["Tables"]["teams"]["Row"], "id">;
      const { data: memberData } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", team.id)
        .eq("user_id", agentId)
        .maybeSingle();
      
      if (!memberData) {
        return NextResponse.json({ error: "Unauthorized to view ratings for this agent" }, { status: 403 });
      }
    }
    query = query.eq("agent_id", agentId);
  } else if (role === "sales_agent") {
    // Agents cannot see their own ratings (as per requirements)
    return NextResponse.json({ error: "Unauthorized to view ratings" }, { status: 403 });
  } else if (agentId) {
    query = query.eq("agent_id", agentId);
  }

  if (startDate) {
    query = query.gte("rating_date", startDate);
  }

  if (endDate) {
    query = query.lte("rating_date", endDate);
  }

  query = query.order("rating_date", { ascending: false });

  const { data: ratingsData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: ratingsData });
}

