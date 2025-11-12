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

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const type = searchParams.get("type"); // requests, meetings, deals

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  // Verify the agent is supervised by this team leader
  const { data: agentProfile } = await supabase
    .from("profiles")
    .select("id, supervised_by")
    .eq("id", agentId)
    .eq("supervised_by", session.user.id)
    .eq("under_supervision", true)
    .maybeSingle();

  if (!agentProfile) {
    return NextResponse.json({ error: "Agent is not under your supervision" }, { status: 403 });
  }

  try {
    switch (type) {
      case "requests": {
        const { data, error } = await supabase
          .from("client_requests")
          .select("*")
          .eq("agent_id", agentId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        return NextResponse.json({ data: data || [] });
      }

      case "meetings": {
        const { data, error } = await supabase
          .from("meetings")
          .select("*")
          .eq("agent_id", agentId)
          .order("meeting_date", { ascending: false })
          .limit(20);

        if (error) throw error;
        return NextResponse.json({ data: data || [] });
      }

      case "deals": {
        const { data, error } = await supabase
          .from("deals")
          .select("*")
          .eq("agent_id", agentId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        return NextResponse.json({ data: data || [] });
      }

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Failed to fetch agent activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

