"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const requestIdParam = z.object({
  id: z.string().uuid(),
});

export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await params;
  const idResult = requestIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the client request
  const { data: requestData } = await supabase
    .from("client_requests")
    .select("*")
    .eq("id", idResult.data.id)
    .eq("status", "approved")
    .maybeSingle();

  if (!requestData) {
    return NextResponse.json(
      { error: "Request not found or not approved" },
      { status: 404 },
    );
  }

  const clientRequest = requestData as Database["public"]["Tables"]["client_requests"]["Row"];

  // Create a deal from the approved request
  const dealPayload = {
    organization_id: clientRequest.organization_id,
    agent_id: clientRequest.agent_id,
    team_id: clientRequest.team_id,
    name: `${clientRequest.client_name} - ${clientRequest.destination}`,
    deal_value: clientRequest.client_budget,
    commission_value: 0, // Will be calculated later
    probability: 50,
    expected_close_date: clientRequest.delivery_date,
    notes: `Converted from client request. Project: ${clientRequest.project_needed}. ${clientRequest.agent_notes ?? ""}`,
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

  // Update the request to mark it as converted
  const updatePayload = {
    status: "converted" as const,
    converted_deal_id: deal.id,
    reviewed_at: new Date().toISOString(),
    reviewed_by: session.user.id,
  } satisfies Database["public"]["Tables"]["client_requests"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("client_requests") as unknown as { update: (payload: any) => any }).update(updatePayload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  await (updateFn as any).eq("id", idResult.data.id);

  return NextResponse.json({ data: deal }, { status: 201 });
}

