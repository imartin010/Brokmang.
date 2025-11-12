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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchTerm = `%${query.trim()}%`;

  try {
    // Get user's organization
    const { data: profileData } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profileData) {
      return NextResponse.json({ results: [] });
    }

    const profile = profileData as { organization_id: string; role: string };
    const { organization_id, role } = profile;
    const results: Array<{
      id: string;
      type: "deal" | "contact" | "activity" | "organization";
      title: string;
      subtitle?: string;
      href: string;
    }> = [];

    // Search deals
    let dealsQuery = supabase
      .from("deals")
      .select("id, name, stage, deal_value, created_at")
      .eq("organization_id", organization_id)
      .ilike("name", searchTerm)
      .limit(5);

    // Agents can only see their own deals
    if (role === "sales_agent") {
      dealsQuery = dealsQuery.eq("agent_id", session.user.id);
    }

    const { data: dealsData } = await dealsQuery;

    if (dealsData) {
      dealsData.forEach((deal: any) => {
        results.push({
          id: deal.id,
          type: "deal" as const,
          title: deal.name,
          subtitle: `Stage: ${deal.stage || "N/A"} • $${Number(deal.deal_value || 0).toLocaleString()}`,
          href: `/app/agent`, // Navigate to agent dashboard where deals are shown
        });
      });
    }

    // Search leads (contacts) - search by name, phone, or email
    let leadsQuery = supabase
      .from("leads")
      .select("id, client_name, client_phone, client_email, status, created_at")
      .eq("organization_id", organization_id);

    if (role === "sales_agent") {
      leadsQuery = leadsQuery.eq("agent_id", session.user.id);
    }

    // Search by name
    const { data: leadsByName } = await leadsQuery
      .ilike("client_name", searchTerm)
      .limit(5);

    // Search by phone
    let leadsByPhoneQuery = supabase
      .from("leads")
      .select("id, client_name, client_phone, client_email, status, created_at")
      .eq("organization_id", organization_id);
    if (role === "sales_agent") {
      leadsByPhoneQuery = leadsByPhoneQuery.eq("agent_id", session.user.id);
    }
    const { data: leadsByPhone } = await leadsByPhoneQuery
      .ilike("client_phone", searchTerm)
      .limit(5);

    // Search by email
    let leadsByEmailQuery = supabase
      .from("leads")
      .select("id, client_name, client_phone, client_email, status, created_at")
      .eq("organization_id", organization_id);
    if (role === "sales_agent") {
      leadsByEmailQuery = leadsByEmailQuery.eq("agent_id", session.user.id);
    }
    const { data: leadsByEmail } = await leadsByEmailQuery
      .ilike("client_email", searchTerm)
      .limit(5);

    // Combine and deduplicate leads
    const allLeads = new Map<string, any>();
    [leadsByName, leadsByPhone, leadsByEmail].forEach((leadArray) => {
      leadArray?.forEach((lead: any) => {
        if (lead) allLeads.set(lead.id, lead);
      });
    });

    Array.from(allLeads.values()).forEach((lead: any) => {
      results.push({
        id: lead.id,
        type: "contact" as const,
        title: lead.client_name || lead.client_email || "Unknown",
        subtitle: lead.client_phone || lead.client_email || "",
        href: `/app/agent`,
      });
    });

    // Search client requests (contacts)
    let requestsQuery = supabase
      .from("client_requests")
      .select("id, client_name, client_phone, destination, status, created_at")
      .eq("organization_id", organization_id);

    if (role === "sales_agent") {
      requestsQuery = requestsQuery.eq("agent_id", session.user.id);
    }

    const { data: requestsByName } = await requestsQuery
      .ilike("client_name", searchTerm)
      .limit(5);

    // Search by phone
    let requestsByPhoneQuery = supabase
      .from("client_requests")
      .select("id, client_name, client_phone, destination, status, created_at")
      .eq("organization_id", organization_id);
    if (role === "sales_agent") {
      requestsByPhoneQuery = requestsByPhoneQuery.eq("agent_id", session.user.id);
    }
    const { data: requestsByPhone } = await requestsByPhoneQuery
      .ilike("client_phone", searchTerm)
      .limit(5);

    // Combine and deduplicate requests
    const allRequests = new Map<string, any>();
    [requestsByName, requestsByPhone].forEach((requestArray) => {
      requestArray?.forEach((request: any) => {
        if (request) allRequests.set(request.id, request);
      });
    });

    Array.from(allRequests.values()).forEach((request: any) => {
      results.push({
        id: request.id,
        type: "contact" as const,
        title: request.client_name || "Unknown",
        subtitle: `${request.destination || ""} • ${request.client_phone || ""}`,
        href: `/app/agent`,
      });
    });

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

