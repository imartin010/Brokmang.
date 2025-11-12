"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { recordActivity } from "@/lib/activity-log";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const createActivitySchema = z.object({
  activityType: z.string().min(2).max(100),
  summary: z.string().min(3).max(1000),
  activityAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const parsedParams = paramsSchema.safeParse(resolvedParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid deal id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsedBody = createActivitySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .select("id, organization_id, name")
    .eq("id", parsedParams.data.id)
    .eq("agent_id", session.user.id)
    .maybeSingle();

  if (dealError || !dealData) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const deal = dealData as Pick<Database["public"]["Tables"]["deals"]["Row"], "id" | "organization_id" | "name">;

  const activityPayload = {
    deal_id: parsedParams.data.id,
    performed_by: session.user.id,
    activity_type: parsedBody.data.activityType,
    summary: parsedBody.data.summary,
    activity_at: parsedBody.data.activityAt ?? new Date().toISOString(),
  } satisfies Database["public"]["Tables"]["deal_activities"]["Insert"];

  const { data, error } = await (supabase
    .from("deal_activities")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(activityPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (deal) {
    await recordActivity({
      supabase,
      organizationId: deal.organization_id,
      actorId: session.user.id,
      action: "deal_activity_logged",
      entityType: "deal",
      entityId: deal.id,
      metadata: {
        activity_type: parsedBody.data.activityType,
      },
    });
  }

  return NextResponse.json({ data }, { status: 201 });
}


