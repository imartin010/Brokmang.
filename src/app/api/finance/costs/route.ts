"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createCostSchema = z.object({
  businessUnitId: z.string().uuid().optional(),
  category: z.enum([
    "rent",
    "salary_agent",
    "salary_team_leader",
    "salary_sales_manager",
    "salary_bu_head",
    "salary_finance",
    "salary_ceo",
    "salary_admin",
    "marketing",
    "phone_bills",
    "utilities",
    "software_subscriptions",
    "office_supplies",
    "travel",
    "training",
    "other_fixed",
    "other_variable",
  ]),
  amount: z.number().min(0),
  costMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500).optional(),
  isFixedCost: z.boolean(),
  isRecurring: z.boolean().optional(),
  receiptUrl: z.string().url().optional(),
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

  // Only finance and above can add costs
  if (role !== "finance" && role !== "business_unit_head" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to add costs" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createCostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const costPayload = {
    organization_id,
    business_unit_id: parsed.data.businessUnitId ?? null,
    category: parsed.data.category,
    amount: parsed.data.amount,
    cost_month: parsed.data.costMonth,
    description: parsed.data.description ?? null,
    is_fixed_cost: parsed.data.isFixedCost,
    is_recurring: parsed.data.isRecurring ?? false,
    created_by: session.user.id,
    approval_status: "approved" as const,
    receipt_url: parsed.data.receiptUrl ?? null,
    notes: parsed.data.notes ?? null,
  } satisfies Database["public"]["Tables"]["cost_entries"]["Insert"];

  const { data: costData, error } = await (supabase
    .from("cost_entries")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(costPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: costData }, { status: 201 });
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
    .select("organization_id, role, business_unit_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json(
      { error: profileResult.error?.message ?? "Profile not found" },
      { status: 400 },
    );
  }

  const { organization_id, role, business_unit_id } = profileResult.data;
  const { searchParams } = new URL(request.url);
  const startMonth = searchParams.get("startMonth");
  const endMonth = searchParams.get("endMonth");
  const businessUnitId = searchParams.get("businessUnitId");

  let query = supabase
    .from("cost_entries")
    .select("*")
    .eq("organization_id", organization_id);

  // BU heads see only their BU's costs
  if (role === "business_unit_head" && business_unit_id) {
    query = query.eq("business_unit_id", business_unit_id);
  } else if (businessUnitId && (role === "finance" || role === "ceo")) {
    query = query.eq("business_unit_id", businessUnitId);
  }

  if (startMonth) {
    query = query.gte("cost_month", startMonth);
  }

  if (endMonth) {
    query = query.lte("cost_month", endMonth);
  }

  query = query.order("cost_month", { ascending: false }).order("created_at", { ascending: false });

  const { data: costsData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: costsData });
}

