"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { recordActivity } from "@/lib/activity-log";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const dealIdParam = z.object({
  id: z.string().uuid(),
});

const updateDealSchema = z
  .object({
    name: z.string().min(3).max(200).optional(),
    dealValue: z.number().min(0).optional(),
    commissionValue: z.number().min(0).optional(),
    probability: z.number().min(0).max(100).optional(),
    expectedCloseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    stage: z
      .enum(["prospecting", "qualified", "negotiation", "contract_sent", "won", "lost"])
      .optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Nothing to update",
  });

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const idResult = dealIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid deal id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
  if (parsed.data.dealValue !== undefined) updatePayload.deal_value = parsed.data.dealValue;
  if (parsed.data.commissionValue !== undefined)
    updatePayload.commission_value = parsed.data.commissionValue;
  if (parsed.data.probability !== undefined) updatePayload.probability = parsed.data.probability;
  if (parsed.data.expectedCloseDate !== undefined)
    updatePayload.expected_close_date = parsed.data.expectedCloseDate;
  if (parsed.data.stage !== undefined) updatePayload.stage = parsed.data.stage;
  if (parsed.data.notes !== undefined) updatePayload.notes = parsed.data.notes;

  const { data: dealData, error } = await supabase
    .from("deals")
    // @ts-expect-error - Supabase type inference issue with dynamic update payloads
    .update(updatePayload)
    .eq("id", idResult.data.id)
    .eq("agent_id", session.user.id)
    .select("*")
    .maybeSingle();

  const data = dealData as Database["public"]["Tables"]["deals"]["Row"] | null;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data) {
    await recordActivity({
      supabase,
      organizationId: data.organization_id,
      actorId: session.user.id,
      action: "deal_updated",
      entityType: "deal",
      entityId: data.id,
      metadata: {
        updated_fields: Object.keys(updatePayload),
      },
    });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const idResult = dealIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid deal id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await supabase
    .from("deals")
    .select("id, organization_id, name")
    .eq("id", idResult.data.id)
    .eq("agent_id", session.user.id)
    .maybeSingle();

  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 500 });
  }

  const existingDeal = existing.data as Pick<Database["public"]["Tables"]["deals"]["Row"], "id" | "organization_id" | "name"> | null;

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", idResult.data.id)
    .eq("agent_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existingDeal) {
    await recordActivity({
      supabase,
      organizationId: existingDeal.organization_id,
      actorId: session.user.id,
      action: "deal_deleted",
      entityType: "deal",
      entityId: idResult.data.id,
      metadata: {
        name: existingDeal.name,
      },
    });
  }

  return NextResponse.json({ success: true });
}


