"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const leadIdParam = z.object({
  id: z.string().uuid(),
});

const updateLeadSchema = z
  .object({
    status: z.enum(["new", "contacted", "qualified", "unqualified", "converted", "lost"]).optional(),
    clientPhone: z.string().min(10).max(20).optional(),
    clientEmail: z.string().email().optional(),
    destination: z.string().min(2).max(200).optional(),
    estimatedBudget: z.number().min(0).optional(),
    projectType: z.string().max(200).optional(),
    lostReason: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Nothing to update",
  });

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
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

  const body = await request.json().catch(() => ({}));
  const parsed = updateLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the lead exists
  const existingLead = await supabase
    .from("leads")
    .select("agent_id, organization_id")
    .eq("id", idResult.data.id)
    .maybeSingle();

  if (!existingLead.data) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const lead = existingLead.data as Database["public"]["Tables"]["leads"]["Row"];

  // Agents can only update their own leads
  if (lead.agent_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized to update this lead" }, { status: 403 });
  }

  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.status !== undefined) {
    updatePayload.status = parsed.data.status;
    // Update status date fields
    const today = new Date().toISOString().split("T")[0];
    if (parsed.data.status === "contacted") {
      updatePayload.contacted_date = today;
    } else if (parsed.data.status === "qualified") {
      updatePayload.qualified_date = today;
    } else if (parsed.data.status === "converted") {
      updatePayload.converted_date = today;
    } else if (parsed.data.status === "lost") {
      updatePayload.lost_date = today;
    }
  }
  if (parsed.data.clientPhone !== undefined) updatePayload.client_phone = parsed.data.clientPhone;
  if (parsed.data.clientEmail !== undefined) updatePayload.client_email = parsed.data.clientEmail;
  if (parsed.data.destination !== undefined) updatePayload.destination = parsed.data.destination;
  if (parsed.data.estimatedBudget !== undefined) updatePayload.estimated_budget = parsed.data.estimatedBudget;
  if (parsed.data.projectType !== undefined) updatePayload.project_type = parsed.data.projectType;
  if (parsed.data.lostReason !== undefined) updatePayload.lost_reason = parsed.data.lostReason;
  if (parsed.data.notes !== undefined) updatePayload.notes = parsed.data.notes;

  const updatePayloadTyped = updatePayload as Database["public"]["Tables"]["leads"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("leads") as unknown as { update: (payload: any) => any }).update(updatePayloadTyped);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: leadData, error } = await (updateFn as any)
    .eq("id", idResult.data.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: leadData });
}

