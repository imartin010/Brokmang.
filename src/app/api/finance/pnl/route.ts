"use server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

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
  const buId = searchParams.get("buId");
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM

  // Determine which P&L to fetch
  if (role === "business_unit_head" && business_unit_id) {
    // BU head sees their BU's P&L
    const { data: pnlData, error } = await supabase
      .from("business_unit_pnl")
      .select("*")
      .eq("business_unit_id", business_unit_id)
      .eq("period_month", `${month}-01`)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: pnlData });
  } else if (role === "ceo" || role === "finance") {
    // CEO/Finance can see organization-wide or specific BU P&L
    if (buId) {
      const { data: pnlData, error } = await supabase
        .from("business_unit_pnl")
        .select("*")
        .eq("business_unit_id", buId)
        .eq("period_month", `${month}-01`)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: pnlData });
    } else {
      // Organization-wide P&L
      const { data: pnlData, error } = await supabase
        .from("organization_pnl")
        .select("*")
        .eq("organization_id", organization_id)
        .eq("period_month", `${month}-01`)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: pnlData });
    }
  }

  return NextResponse.json({ error: "Unauthorized to view P&L" }, { status: 403 });
}

