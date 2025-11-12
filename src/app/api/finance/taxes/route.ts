"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const updateTaxConfigSchema = z.object({
  withholdingTaxRate: z.number().min(0).max(1).optional(),
  vatRate: z.number().min(0).max(1).optional(),
  incomeTaxRate: z.number().min(0).max(1).optional(),
  notes: z.string().max(500).optional(),
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
  const revenue = searchParams.get("revenue");

  // Get current tax config
  const { data: taxConfigData, error } = await supabase
    .from("tax_config")
    .select("*")
    .eq("organization_id", organization_id)
    .is("effective_to", null)
    .order("effective_from", { ascending: false })
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taxConfig =
    taxConfigData as Database["public"]["Tables"]["tax_config"]["Row"] | null;

  if (!taxConfig) {
    return NextResponse.json({ error: "Tax config not found" }, { status: 404 });
  }

  // If revenue is provided, calculate taxes
  if (revenue) {
    const revenueNum = parseFloat(revenue);
    const calculations = {
      revenue: revenueNum,
      withholdingTax: revenueNum * Number(taxConfig.withholding_tax_rate),
      vat: revenueNum * Number(taxConfig.vat_rate),
      incomeTax: revenueNum * Number(taxConfig.income_tax_rate),
      totalTaxes:
        revenueNum *
        (Number(taxConfig.withholding_tax_rate) +
          Number(taxConfig.vat_rate) +
          Number(taxConfig.income_tax_rate)),
      netRevenue:
        revenueNum *
        (1 -
          Number(taxConfig.withholding_tax_rate) -
          Number(taxConfig.vat_rate) -
          Number(taxConfig.income_tax_rate)),
      config: taxConfig,
    };
    return NextResponse.json({ data: calculations });
  }

  return NextResponse.json({ data: taxConfig });
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

  // Only finance and above can update tax config
  if (role !== "finance" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to update tax config" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateTaxConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get current config to preserve values
  const currentConfig = await supabase
    .from("tax_config")
    .select("*")
    .eq("organization_id", organization_id)
    .is("effective_to", null)
    .maybeSingle();

  // End previous config
  const updatePayload = {
    effective_to: parsed.data.effectiveFrom || new Date().toISOString().split("T")[0],
  } satisfies Database["public"]["Tables"]["tax_config"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("tax_config") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  await (updateFn as any)
    .eq("organization_id", organization_id)
    .is("effective_to", null);

  // Create new config
  const currentConfigData = currentConfig.data as
    | Database["public"]["Tables"]["tax_config"]["Row"]
    | null;
  const configPayload = {
    organization_id,
    withholding_tax_rate:
      parsed.data.withholdingTaxRate ?? Number(currentConfigData?.withholding_tax_rate) ?? 0.05,
    vat_rate: parsed.data.vatRate ?? Number(currentConfigData?.vat_rate) ?? 0.14,
    income_tax_rate:
      parsed.data.incomeTaxRate ?? Number(currentConfigData?.income_tax_rate) ?? 0,
    notes: parsed.data.notes ?? null,
    effective_from: parsed.data.effectiveFrom || new Date().toISOString().split("T")[0],
  } satisfies Database["public"]["Tables"]["tax_config"]["Insert"];

  const { data: configData, error } = await (supabase
    .from("tax_config")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(configPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: configData }, { status: 201 });
}

