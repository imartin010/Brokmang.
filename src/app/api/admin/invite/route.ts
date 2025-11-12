"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { recordActivity } from "@/lib/activity-log";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin-client";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";
import { env } from "@/env";

type ProfileData = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role" | "organization_id" | "full_name">;

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(200).optional(),
  role: z.enum(["sales_agent", "team_leader", "sales_manager", "finance", "business_unit_head", "ceo", "admin"]),
});

const ADMIN_ROLES = new Set(["admin", "ceo"]);

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, organization_id, full_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  const profile = profileData as ProfileData;

  if (!ADMIN_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const serviceClient = getSupabaseServiceRoleClient();
  const inviteResponse = await serviceClient.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      invited_by: session.user.id,
      requested_role: parsed.data.role,
      full_name: parsed.data.fullName ?? null,
    },
    redirectTo: `${env.APP_URL}/auth/callback`,
  });

  if (inviteResponse.error) {
    return NextResponse.json({ error: inviteResponse.error.message }, { status: 400 });
  }

  const invitedUser = inviteResponse.data.user;

  if (!invitedUser) {
    return NextResponse.json({ error: "Invite failed" }, { status: 400 });
  }

  const profilePayload = {
    id: invitedUser.id,
    organization_id: profile.organization_id,
    full_name: parsed.data.fullName ?? invitedUser.email ?? "New teammate",
    preferred_name: null,
    email: invitedUser.email ?? null,
    role: parsed.data.role,
    avatar_url: null,
    metadata: invitedUser.user_metadata ?? {},
  } satisfies Database["public"]["Tables"]["profiles"]["Insert"];

  const upsertProfileResult = await (serviceClient
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .upsert(profilePayload as any, { onConflict: "id" }) as any)
    .select("id")
    .maybeSingle();

  if (upsertProfileResult.error) {
    return NextResponse.json({ error: upsertProfileResult.error.message }, { status: 500 });
  }

  await recordActivity({
    supabase: serviceClient,
    organizationId: profile.organization_id,
    actorId: session.user.id,
    action: "invited_user",
    entityType: "profile",
    entityId: invitedUser.id,
    metadata: {
      email: invitedUser.email,
      role: parsed.data.role,
    },
  });

  return NextResponse.json({
    message: "Invitation sent",
    userId: invitedUser.id,
  });
}


