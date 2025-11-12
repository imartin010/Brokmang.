"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const teamIdParam = z.object({
  id: z.string().min(1),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: Request, context: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await context.params;
  const idResult = teamIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid team id", details: idResult.error.flatten() }, { status: 400 });
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

  // Only team leaders and above can manage team members
  if (role !== "team_leader" && role !== "sales_manager" && role !== "business_unit_head" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to manage team members" }, { status: 403 });
  }

  // Verify team exists and user has permission
  const { data: teamData } = await supabase
    .from("teams")
    .select("leader_id, business_unit_id")
    .eq("id", idResult.data.id)
    .maybeSingle();

  if (!teamData) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const team = teamData as Pick<
    Database["public"]["Tables"]["teams"]["Row"],
    "leader_id" | "business_unit_id"
  >;

  // Team leaders can only manage their own team
  if (role === "team_leader" && team.leader_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized to manage this team" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = addMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify user exists and is in same organization
  // Get team's organization_id through business_unit
  const { data: buData } = await supabase
    .from("business_units")
    .select("organization_id")
    .eq("id", team.business_unit_id)
    .maybeSingle();

  if (!buData) {
    return NextResponse.json({ error: "Business unit not found" }, { status: 404 });
  }

  const businessUnit = buData as Pick<
    Database["public"]["Tables"]["business_units"]["Row"],
    "organization_id"
  >;

  const { data: userProfileData } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (!userProfileData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userProfile = userProfileData as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "organization_id" | "role"
  >;

  if (userProfile.organization_id !== businessUnit.organization_id) {
    return NextResponse.json({ error: "User is not in the same organization" }, { status: 400 });
  }

  // Check if user is already in the team
  const { data: existingMemberData } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", idResult.data.id)
    .eq("user_id", parsed.data.userId)
    .maybeSingle();

  if (existingMemberData) {
    return NextResponse.json({ error: "User is already in this team" }, { status: 400 });
  }

  // Add member to team
  const memberPayload = {
    team_id: idResult.data.id,
    user_id: parsed.data.userId,
  } satisfies Database["public"]["Tables"]["team_members"]["Insert"];

  const { data: memberData, error } = await (supabase
    .from("team_members")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(memberPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: memberData }, { status: 201 });
}

export async function GET(request: Request, context: { params: Promise<unknown> }) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await context.params;
  const idResult = teamIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid team id", details: idResult.error.flatten() }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membersData, error } = await supabase
    .from("team_members")
    .select("*, profiles(*)")
    .eq("team_id", idResult.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: membersData });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<unknown> },
) {
  const supabase = await getSupabaseServerClient();
  const resolvedParams = await context.params;
  const idResult = teamIdParam.safeParse(resolvedParams);

  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid team id", details: idResult.error.flatten() }, { status: 400 });
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

  // Only team leaders and above can manage team members
  if (role !== "team_leader" && role !== "sales_manager" && role !== "business_unit_head" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to manage team members" }, { status: 403 });
  }

  // Verify team exists and user has permission
  const { data: teamData } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", idResult.data.id)
    .maybeSingle();

  if (!teamData) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const team = teamData as Pick<Database["public"]["Tables"]["teams"]["Row"], "leader_id">;

  // Team leaders can only manage their own team
  if (role === "team_leader" && team.leader_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized to manage this team" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", idResult.data.id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Member removed from team successfully" });
}

