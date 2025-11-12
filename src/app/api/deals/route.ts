"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { recordActivity } from "@/lib/activity-log";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createDealSchema = z.object({
  name: z.string().min(3).max(200),
  dealValue: z.number().min(0),
  commissionValue: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().max(2000).optional(),
  sourceId: z.string().uuid().optional(),
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
  const parsed = createDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profileResult = await supabase
    .from("profiles")
    .select("organization_id, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json(
      { error: profileResult.error?.message ?? "Profile not found" },
      { status: 400 },
    );
  }

  const { organization_id } = profileResult.data;

  const dealPayload = {
    name: parsed.data.name,
    organization_id,
    agent_id: session.user.id,
    deal_value: parsed.data.dealValue,
    commission_value: parsed.data.commissionValue ?? 0,
    probability: parsed.data.probability ?? 0,
    expected_close_date: parsed.data.expectedCloseDate ?? null,
    notes: parsed.data.notes ?? null,
    source_id: parsed.data.sourceId ?? null,
  } satisfies Database["public"]["Tables"]["deals"]["Insert"];

  const { data: dealData, error } = await (supabase
    .from("deals")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(dealPayload as any) as any)
    .select("*")
    .maybeSingle();

  const data = dealData as Database["public"]["Tables"]["deals"]["Row"] | null;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordActivity({
    supabase,
    organizationId: organization_id,
    actorId: session.user.id,
    action: "deal_created",
    entityType: "deal",
    entityId: data?.id ?? null,
    metadata: {
      name: parsed.data.name,
      deal_value: parsed.data.dealValue,
      probability: parsed.data.probability ?? 0,
    },
  });

  return NextResponse.json({ data }, { status: 201 });
}


