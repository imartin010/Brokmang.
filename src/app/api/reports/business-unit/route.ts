"use server";

import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile and role
  const { data: profileData } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { organization_id, role } = profileData;
  const { searchParams } = new URL(request.url);
  const buId = searchParams.get("buId");
  const period = searchParams.get("period") || "monthly";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Build query
  let query = supabase
    .from("business_unit_combined_report")
    .select("*")
    .eq("organization_id", organization_id);

  // Apply filters based on role
  if (role === "business_unit_head") {
    // BU heads see their own BU's reports
    const { data: buData } = await supabase
      .from("business_units")
      .select("id")
      .eq("leader_id", session.user.id)
      .maybeSingle();

    if (buData) {
      const businessUnit = buData as Pick<Database["public"]["Tables"]["business_units"]["Row"], "id">;
      query = query.eq("business_unit_id", businessUnit.id);
    } else {
      return NextResponse.json({ data: [], period, startDate, endDate });
    }
  } else if (buId && (role === "ceo" || role === "admin")) {
    // CEO/Admin can filter by specific BU
    query = query.eq("business_unit_id", buId);
  }

  // Apply period filter (report_month is a date field truncated to month)
  if (period === "monthly" && !startDate && !endDate) {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    query = query.gte("report_month", monthStart.toISOString().split("T")[0]);
    query = query.lt(
      "report_month",
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString().split("T")[0],
    );
  } else if (period === "quarterly" && !startDate && !endDate) {
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
    query = query.gte("report_month", quarterStart.toISOString().split("T")[0]);
    query = query.lt("report_month", quarterEnd.toISOString().split("T")[0]);
  } else if (period === "yearly" && !startDate && !endDate) {
    const currentYear = new Date().getFullYear();
    query = query.gte("report_month", `${currentYear}-01-01`);
    query = query.lt("report_month", `${currentYear + 1}-01-01`);
  } else if (period === "custom") {
    // Custom date range
    if (startDate) {
      query = query.gte("report_month", startDate);
    }
    if (endDate) {
      // Add one month to end date to include the entire end month
      const endDateObj = new Date(endDate);
      const endDatePlusOneMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 1);
      query = query.lt("report_month", endDatePlusOneMonth.toISOString().split("T")[0]);
    }
  } else {
    // For weekly and daily, we'll show all available data (can be filtered by custom date range)
    if (startDate) {
      query = query.gte("report_month", startDate);
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      const endDatePlusOneMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 1);
      query = query.lt("report_month", endDatePlusOneMonth.toISOString().split("T")[0]);
    }
  }

  query = query.order("report_month", { ascending: false });

  const { data: reports, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: reports,
    period,
    startDate: startDate || null,
    endDate: endDate || null,
  });
}

