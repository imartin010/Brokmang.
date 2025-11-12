"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const updateCommissionConfigSchema = z.object({
  role: z.enum([
    "sales_agent",
    "team_leader",
    "sales_manager",
    "business_unit_head",
    "finance",
    "ceo",
    "admin",
  ]),
  baseRatePerMillion: z.number().min(0),
  description: z.string().max(500).optional(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const dealValue = searchParams.get("dealValue");

  // Get commission config
  let query = supabase
    .from("commission_config")
    .select("*")
    .eq("organization_id", organization_id)
    .is("effective_to", null)
    .order("effective_from", { ascending: false });

  if (role) {
    query = query.eq("role", role);
  }

  const { data: configData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const configs =
    (configData ?? []) as Database["public"]["Tables"]["commission_config"]["Row"][];

  // If dealValue is provided, calculate commission
  if (dealValue) {
    const dealValueNum = parseFloat(dealValue);
    const calculations = configs.map((config) => {
      const millions = dealValueNum / 1_000_000;
      const commission = millions * Number(config.base_rate_per_million);
      return {
        ...config,
        calculatedCommission: commission,
        dealValue: dealValueNum,
        millions,
      };
    });
    return NextResponse.json({ data: calculations });
  }

  return NextResponse.json({ data: configs });
}

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

  // Only finance and above can update commission config
  if (role !== "finance" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to update commission config" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateCommissionConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // End previous config for this role
  const updatePayload = {
    effective_to: parsed.data.effectiveFrom || new Date().toISOString().split("T")[0],
  } satisfies Database["public"]["Tables"]["commission_config"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("commission_config") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  await (updateFn as any)
    .eq("organization_id", organization_id)
    .eq("role", parsed.data.role)
    .is("effective_to", null);

  // Create new config
  const configPayload = {
    organization_id,
    role: parsed.data.role,
    base_rate_per_million: parsed.data.baseRatePerMillion,
    description: parsed.data.description ?? null,
    effective_from: parsed.data.effectiveFrom || new Date().toISOString().split("T")[0],
  } satisfies Database["public"]["Tables"]["commission_config"]["Insert"];

  const { data: configData, error } = await (supabase
    .from("commission_config")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(configPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: configData }, { status: 201 });
}

