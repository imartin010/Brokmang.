"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase";

const createSalarySchema = z.object({
  employeeId: z.string().uuid(),
  monthlySalary: z.number().min(0),
  role: z.enum([
    "sales_agent",
    "team_leader",
    "sales_manager",
    "business_unit_head",
    "finance",
    "ceo",
    "admin",
  ]),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
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

  // Only finance and above can manage salaries
  if (role !== "finance" && role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized to manage salaries" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createSalarySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify employee exists in same organization
  const { data: employeeProfileData, error: employeeError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", parsed.data.employeeId)
    .maybeSingle();

  if (employeeError || !employeeProfileData) {
    return NextResponse.json(
      { error: employeeError?.message ?? "Employee not found" },
      { status: 404 },
    );
  }

  const employeeProfile = employeeProfileData as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "organization_id"
  >;

  if (employeeProfile.organization_id !== organization_id) {
    return NextResponse.json(
      { error: "Employee is not in the same organization" },
      { status: 400 },
    );
  }

  const salaryPayload = {
    organization_id,
    employee_id: parsed.data.employeeId,
    monthly_salary: parsed.data.monthlySalary,
    role: parsed.data.role,
    effective_from: parsed.data.effectiveFrom,
    effective_to: parsed.data.effectiveTo ?? null,
    currency: "EGP",
    notes: parsed.data.notes ?? null,
    created_by: session.user.id,
  } satisfies Database["public"]["Tables"]["employee_salaries"]["Insert"];

  const { data: salaryData, error } = await (supabase
    .from("employee_salaries")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(salaryPayload as any) as any)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: salaryData }, { status: 201 });
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
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const effectiveDate = searchParams.get("effectiveDate") || new Date().toISOString().split("T")[0];

  let query = supabase
    .from("employee_salaries")
    .select("*, profiles(full_name, email, role)")
    .eq("organization_id", organization_id);

  // Employees can see only their own salary
  if (role !== "finance" && role !== "ceo") {
    query = query.eq("employee_id", session.user.id);
  } else if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  // Get current salary (effective on or before the date, and not expired)
  query = query
    .lte("effective_from", effectiveDate)
    .or(`effective_to.is.null,effective_to.gte.${effectiveDate}`)
    .order("effective_from", { ascending: false });

  const { data: salariesData, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: salariesData });
}

