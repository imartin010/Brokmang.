"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const updateMetricsSchema = z.object({
  callsCount: z.number().min(0).optional(),
  meetingsCount: z.number().min(0).optional(),
  requestsCount: z.number().min(0).optional(),
  dealsCount: z.number().min(0).optional(),
  mood: z.enum(["great", "good", "okay", "stressed", "difficult"]).optional(),
  notes: z.string().max(1000).optional(),
});

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
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  // Get user profile
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

  // Determine which agent's metrics to fetch
  let targetAgentId = session.user.id;
  if (agentId && (role === "team_leader" || role === "sales_manager" || role === "business_unit_head" || role === "ceo")) {
    targetAgentId = agentId;
  } else if (agentId && agentId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: metricsData, error } = await supabase
    .from("daily_agent_metrics")
    .select("*")
    .eq("agent_id", targetAgentId)
    .eq("work_date", date)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: metricsData });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateMetricsSchema.safeParse(body);

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
  const today = new Date().toISOString().split("T")[0];

  // Check if metrics already exist for today
  const existing = await supabase
    .from("daily_agent_metrics")
    .select("id")
    .eq("agent_id", session.user.id)
    .eq("work_date", today)
    .maybeSingle();

  const metricsPayload = {
    organization_id,
    agent_id: session.user.id,
    work_date: today,
    active_calls_count: parsed.data.callsCount ?? 0,
    meetings_scheduled: parsed.data.meetingsCount ?? 0,
    requests_generated: parsed.data.requestsCount ?? 0,
    deals_closed: parsed.data.dealsCount ?? 0,
    mood: parsed.data.mood ?? null,
    notes: parsed.data.notes ?? null,
  } satisfies Database["public"]["Tables"]["daily_agent_metrics"]["Insert"];

  let result;
  if (existing.data) {
    // Update existing
    const existingMetric = existing.data as Database["public"]["Tables"]["daily_agent_metrics"]["Row"];
    const updatePayload = metricsPayload as Database["public"]["Tables"]["daily_agent_metrics"]["Update"];
    // Supabase type inference limitation - use unknown cast to bypass type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    const updateFn = (supabase.from("daily_agent_metrics") as unknown as { update: (payload: any) => any }).update(updatePayload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    const { data: metricsData, error } = await (updateFn as any)
      .eq("id", existingMetric.id)
      .select("*")
      .maybeSingle();
    result = { data: metricsData, error };
  } else {
    // Create new
    const { data: metricsData, error } = await (supabase
      .from("daily_agent_metrics")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
      .insert(metricsPayload as any) as any)
      .select("*")
      .maybeSingle();
    result = { data: metricsData, error };
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: existing.data ? 200 : 201 });
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateMetricsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Get existing metrics
  const { data: existingData } = await supabase
    .from("daily_agent_metrics")
    .select("*")
    .eq("agent_id", session.user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (!existingData) {
    return NextResponse.json({ error: "No metrics found for today. Use POST to create." }, { status: 404 });
  }

  const existingMetric = existingData as Database["public"]["Tables"]["daily_agent_metrics"]["Row"];

  // Increment counters
  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.callsCount !== undefined) {
    updatePayload.active_calls_count = (existingMetric.active_calls_count || 0) + parsed.data.callsCount;
  }
  if (parsed.data.meetingsCount !== undefined) {
    updatePayload.meetings_scheduled = (existingMetric.meetings_scheduled || 0) + parsed.data.meetingsCount;
  }
  if (parsed.data.requestsCount !== undefined) {
    updatePayload.requests_generated = (existingMetric.requests_generated || 0) + parsed.data.requestsCount;
  }
  if (parsed.data.dealsCount !== undefined) {
    updatePayload.deals_closed = (existingMetric.deals_closed || 0) + parsed.data.dealsCount;
  }
  if (parsed.data.mood !== undefined) {
    updatePayload.mood = parsed.data.mood;
  }
  if (parsed.data.notes !== undefined) {
    updatePayload.notes = parsed.data.notes;
  }

  const updatePayloadTyped = updatePayload as Database["public"]["Tables"]["daily_agent_metrics"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("daily_agent_metrics") as unknown as { update: (payload: any) => any }).update(updatePayloadTyped);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: metricsData, error } = await (updateFn as any)
    .eq("id", existingMetric.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: metricsData });
}

