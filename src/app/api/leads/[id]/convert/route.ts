"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const leadIdParam = z.object({
  id: z.string().uuid(),
});

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const idResult = leadIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the lead
  const leadResult = await supabase
    .from("leads")
    .select("*")
    .eq("id", idResult.data.id)
    .eq("agent_id", session.user.id)
    .maybeSingle();

  if (!leadResult.data) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const lead = leadResult.data as Database["public"]["Tables"]["leads"]["Row"];

  // Create a deal from the lead
  const dealPayload = {
    organization_id: lead.organization_id,
    agent_id: lead.agent_id,
    team_id: lead.team_id,
    name: `${lead.client_name} - ${lead.destination || "Project"}`,
    deal_value: lead.estimated_budget ?? 0,
    commission_value: 0, // Will be calculated later
    probability: lead.status === "qualified" ? 75 : 50,
    expected_close_date: null,
    notes: `Converted from lead. Project Type: ${lead.project_type || "N/A"}. ${lead.notes ?? ""}`,
    stage: "qualified" as const,
  } satisfies Database["public"]["Tables"]["deals"]["Insert"];

  const { data: dealData, error: dealError } = await (supabase
    .from("deals")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(dealPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (dealError || !dealData) {
    return NextResponse.json(
      { error: dealError?.message ?? "Failed to create deal" },
      { status: 500 },
    );
  }

  const deal = dealData as Database["public"]["Tables"]["deals"]["Row"];

  // Update the lead to mark it as converted
  const updatePayload = {
    status: "converted" as const,
    converted_deal_id: deal.id,
    converted_date: new Date().toISOString().split("T")[0],
  } satisfies Database["public"]["Tables"]["leads"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("leads") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  await (updateFn as any).eq("id", idResult.data.id);

  return NextResponse.json({ data: deal }, { status: 201 });
}

