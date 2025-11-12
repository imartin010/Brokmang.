import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const updateMetricsSchema = z.object({
  callsCount: z.number().min(0).optional(),
  leadsCount: z.number().min(0).optional(),
  coldCallsCount: z.number().min(0).optional(),
  meetingsCount: z.number().min(0).optional(),
  meetingsCompletedCount: z.number().min(0).optional(),
  requestsCount: z.number().min(0).optional(),
  dealsCount: z.number().min(0).optional(),
  orientation: z.enum(["team", "developer"]).nullable().optional(),
  mood: z.enum(["great", "good", "okay", "stressed", "difficult"]).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

const WORKFLOW_METADATA_VERSION = 1;

type OrientationType = "team" | "developer";

type WorkflowMetadata = {
  version: typeof WORKFLOW_METADATA_VERSION;
  userNotes?: string | null;
  leadsTaken?: number | null;
  coldCalls?: number | null;
  meetingsCompleted?: number | null;
  orientation?: OrientationType | null;
};

const hasOwn = <T extends object>(obj: T, key: keyof any): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const parseWorkflowMetadata = (raw: string | null | undefined): WorkflowMetadata | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WorkflowMetadata;
    if (parsed && typeof parsed === "object" && parsed.version === WORKFLOW_METADATA_VERSION) {
      return {
        version: WORKFLOW_METADATA_VERSION,
        userNotes: parsed.userNotes ?? null,
        leadsTaken: parsed.leadsTaken ?? null,
        coldCalls: parsed.coldCalls ?? null,
        meetingsCompleted: parsed.meetingsCompleted ?? null,
        orientation:
          parsed.orientation === "team" || parsed.orientation === "developer"
            ? parsed.orientation
            : null,
      };
    }
  } catch {
    return {
      version: WORKFLOW_METADATA_VERSION,
      userNotes: raw,
    };
  }

  return {
    version: WORKFLOW_METADATA_VERSION,
    userNotes: raw,
  };
};

const serializeWorkflowMetadata = (meta: WorkflowMetadata | null): string | null => {
  if (!meta) {
    return null;
  }

  const payload: WorkflowMetadata = {
    version: WORKFLOW_METADATA_VERSION,
    userNotes: meta.userNotes ?? null,
    leadsTaken: meta.leadsTaken ?? null,
    coldCalls: meta.coldCalls ?? null,
    meetingsCompleted: meta.meetingsCompleted ?? null,
    orientation: meta.orientation ?? null,
  };

  const hasStructuredFields =
    payload.leadsTaken !== null ||
    payload.coldCalls !== null ||
    payload.meetingsCompleted !== null ||
    payload.orientation !== null;

  if (!hasStructuredFields) {
    return payload.userNotes ?? null;
  }

  return JSON.stringify(payload);
};

const augmentMetricsRow = (
  row: Database["public"]["Tables"]["daily_agent_metrics"]["Row"] | null,
): Record<string, unknown> | null => {
  if (!row) {
    return null;
  }

  const metadata = parseWorkflowMetadata(row.notes);

  return {
    ...row,
    notes: metadata?.userNotes ?? null,
    orientation: metadata?.orientation ?? null,
    leads_taken_count: metadata?.leadsTaken ?? 0,
    cold_calls_count: metadata?.coldCalls ?? 0,
    meetings_completed: metadata?.meetingsCompleted ?? 0,
  };
};

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

  return NextResponse.json({ data: augmentMetricsRow(metricsData) });
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

  const existingResult = await supabase
    .from("daily_agent_metrics")
    .select("*")
    .eq("agent_id", session.user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (existingResult.error) {
    return NextResponse.json({ error: existingResult.error.message }, { status: 500 });
  }

  const existingMetric = existingResult.data as
    | Database["public"]["Tables"]["daily_agent_metrics"]["Row"]
    | null;
  const existingMetadata = parseWorkflowMetadata(existingMetric?.notes);

  const metadata: WorkflowMetadata = {
    version: WORKFLOW_METADATA_VERSION,
    userNotes: hasOwn(parsed.data, "notes")
      ? parsed.data.notes ?? null
      : existingMetadata?.userNotes ?? null,
    leadsTaken: hasOwn(parsed.data, "leadsCount")
      ? parsed.data.leadsCount ?? null
      : existingMetadata?.leadsTaken ?? null,
    coldCalls: hasOwn(parsed.data, "coldCallsCount")
      ? parsed.data.coldCallsCount ?? null
      : existingMetadata?.coldCalls ?? null,
    meetingsCompleted: hasOwn(parsed.data, "meetingsCompletedCount")
      ? parsed.data.meetingsCompletedCount ?? null
      : existingMetadata?.meetingsCompleted ?? null,
    orientation: hasOwn(parsed.data, "orientation")
      ? parsed.data.orientation ?? null
      : existingMetadata?.orientation ?? null,
  };

  const metricsPayload = {
    organization_id,
    agent_id: session.user.id,
    work_date: today,
    active_calls_count: parsed.data.callsCount ?? existingMetric?.active_calls_count ?? 0,
    meetings_scheduled: parsed.data.meetingsCount ?? existingMetric?.meetings_scheduled ?? 0,
    requests_generated: parsed.data.requestsCount ?? existingMetric?.requests_generated ?? 0,
    deals_closed: parsed.data.dealsCount ?? existingMetric?.deals_closed ?? 0,
    mood: parsed.data.mood ?? existingMetric?.mood ?? null,
    notes: serializeWorkflowMetadata(metadata),
  } satisfies Database["public"]["Tables"]["daily_agent_metrics"]["Insert"];

  const { data: metricsData, error } = await (supabase
    .from("daily_agent_metrics")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .upsert(metricsPayload as any, { onConflict: "agent_id,work_date" }) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: augmentMetricsRow(metricsData) }, { status: existingMetric ? 200 : 201 });
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

  const { data: existingData, error: existingError } = await supabase
    .from("daily_agent_metrics")
    .select("*")
    .eq("agent_id", session.user.id)
    .eq("work_date", today)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existingData) {
    return NextResponse.json({ error: "No metrics found for today. Use POST to create." }, { status: 404 });
  }

  const existingMetric = existingData as Database["public"]["Tables"]["daily_agent_metrics"]["Row"];
  const existingMetadata = parseWorkflowMetadata(existingMetric.notes);

  const metadata: WorkflowMetadata = {
    version: WORKFLOW_METADATA_VERSION,
    userNotes:
      parsed.data.notes !== undefined ? parsed.data.notes ?? null : existingMetadata?.userNotes ?? null,
    orientation:
      parsed.data.orientation !== undefined
        ? parsed.data.orientation ?? null
        : existingMetadata?.orientation ?? null,
    leadsTaken:
      parsed.data.leadsCount !== undefined
        ? (existingMetadata?.leadsTaken ?? 0) + parsed.data.leadsCount
        : existingMetadata?.leadsTaken ?? null,
    coldCalls:
      parsed.data.coldCallsCount !== undefined
        ? (existingMetadata?.coldCalls ?? 0) + parsed.data.coldCallsCount
        : existingMetadata?.coldCalls ?? null,
    meetingsCompleted:
      parsed.data.meetingsCompletedCount !== undefined
        ? (existingMetadata?.meetingsCompleted ?? 0) + parsed.data.meetingsCompletedCount
        : existingMetadata?.meetingsCompleted ?? null,
  };

  const updatePayload: Record<string, unknown> = {
    notes: serializeWorkflowMetadata(metadata),
  };

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

  const updatePayloadTyped = updatePayload as Database["public"]["Tables"]["daily_agent_metrics"]["Update"];

  const updateFn = (supabase.from("daily_agent_metrics") as unknown as { update: (payload: any) => any }).update(updatePayloadTyped);
  const { data: metricsData, error } = await (updateFn as any)
    .eq("id", existingMetric.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: augmentMetricsRow(metricsData) });
}

