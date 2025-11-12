"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const requestIdParam = z.object({
  id: z.string().uuid(),
});

const updateRequestSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected", "converted"]).optional(),
    leaderNotes: z.string().max(1000).optional(),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Nothing to update",
  });

export async function PATCH(request: Request, { params }: { params: Promise<unknown> }) {
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

  const { role } = profileResult.data;

  // Only team leaders and above can approve/reject requests
  if (role !== "team_leader" && role !== "sales_manager" && role !== "business_unit_head" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to update requests" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = updateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the request exists and user has permission
  const { data: requestData } = await supabase
    .from("client_requests")
    .select("team_leader_id, organization_id")
    .eq("id", idResult.data.id)
    .maybeSingle();

  if (!requestData) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const clientRequest = requestData as Pick<
    Database["public"]["Tables"]["client_requests"]["Row"],
    "team_leader_id" | "organization_id"
  >;

  // Team leaders can only approve their own team's requests
  if (role === "team_leader" && clientRequest.team_leader_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized to update this request" }, { status: 403 });
  }

  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.status !== undefined) {
    updatePayload.status = parsed.data.status;
    updatePayload.reviewed_at = new Date().toISOString();
    updatePayload.reviewed_by = session.user.id;
  }
  if (parsed.data.leaderNotes !== undefined) {
    updatePayload.leader_notes = parsed.data.leaderNotes;
  }
  if (parsed.data.rejectionReason !== undefined) {
    updatePayload.rejection_reason = parsed.data.rejectionReason;
  }

  const updatePayloadTyped = updatePayload as Database["public"]["Tables"]["client_requests"]["Update"];

  // Supabase type inference limitation - use unknown cast to bypass type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const updateFn = (supabase.from("client_requests") as unknown as { update: (payload: any) => any }).update(updatePayloadTyped);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
  const { data: requestResult, error } = await (updateFn as any)
    .eq("id", idResult.data.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: requestResult });
}

