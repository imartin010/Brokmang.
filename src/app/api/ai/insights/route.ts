import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin-client";
import type { Database } from "@/lib/supabase";

const INSIGHT_LIMIT = 5;

// Initialize OpenAI client (optional - only if API key is available)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

// Role-specific prompt templates
const getPromptForRole = async (
  role: string,
  scope: string,
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  organizationId: string,
): Promise<string> => {
  // Fetch relevant data based on role and scope
  let contextData = "";

  switch (role) {
    case "team_leader": {
      // Get team performance data
      const { data: teamData } = await supabase
        .from("team_leader_dashboard")
        .select("*")
        .limit(1);

      const { data: memberData } = await supabase
        .from("team_member_performance")
        .select("*")
        .limit(10);

      contextData = `Team Performance: ${JSON.stringify(teamData || [])}\nMember Performance: ${JSON.stringify(memberData || [])}`;

      return `You are an AI assistant helping a team leader in a brokerage firm. Analyze the following team performance data and provide actionable insights:

${contextData}

Please provide:
1. Key performance highlights
2. Agents who need coaching or support
3. Recommended actions to improve team performance
4. Trends and patterns you notice

Keep the response concise and actionable (max 500 words).`;
    }

    case "sales_manager": {
      // Get multi-team data
      const { data: teamData } = await supabase
        .from("team_leader_dashboard")
        .select("*")
        .limit(20);

      contextData = `Teams Performance: ${JSON.stringify(teamData || [])}`;

      return `You are an AI assistant helping a sales manager overseeing multiple teams. Analyze the following team performance data and provide strategic insights:

${contextData}

Please provide:
1. Team comparison and rankings
2. Resource allocation recommendations
3. Teams that need attention
4. Strategic recommendations for improving overall performance

Keep the response concise and strategic (max 500 words).`;
    }

    case "finance": {
      // Get financial data
      const { data: pnlData } = await supabase
        .from("pnl_overview")
        .select("*")
        .eq("organization_id", organizationId)
        .limit(10);

      contextData = `Financial Data: ${JSON.stringify(pnlData || [])}`;

      return `You are an AI assistant helping a finance team. Analyze the following financial data and provide insights:

${contextData}

Please provide:
1. Cost optimization opportunities
2. Revenue forecasting insights
3. Budget recommendations
4. Financial health assessment

Keep the response concise and focused on financial metrics (max 500 words).`;
    }

    case "business_unit_head": {
      // Get BU performance and financial data
      const { data: buData } = await supabase
        .from("business_unit_finance_overview")
        .select("*")
        .eq("organization_id", organizationId)
        .limit(5);

      contextData = `Business Unit Data: ${JSON.stringify(buData || [])}`;

      return `You are an AI assistant helping a business unit head. Analyze the following BU data and provide strategic insights:

${contextData}

Please provide:
1. Business unit health assessment
2. Performance vs. financial metrics alignment
3. Strategic recommendations
4. Areas needing attention

Keep the response concise and strategic (max 500 words).`;
    }

    case "ceo":
    case "admin": {
      // Get organization-wide data
      const { data: orgData } = await supabase
        .from("organization_overview")
        .select("*")
        .eq("id", organizationId)
        .maybeSingle();

      const { data: buData } = await supabase
        .from("business_unit_finance_overview")
        .select("*")
        .eq("organization_id", organizationId)
        .limit(20);

      contextData = `Organization Overview: ${JSON.stringify(orgData || {})}\nBusiness Units: ${JSON.stringify(buData || [])}`;

      return `You are an AI assistant helping a CEO/Executive. Analyze the following organization-wide data and provide executive insights:

${contextData}

Please provide:
1. Executive summary of organizational health
2. Cross-BU insights and comparisons
3. Strategic recommendations
4. Key areas requiring executive attention

Keep the response concise and executive-focused (max 500 words).`;
    }

    default:
      return `Analyze the following data and provide insights: ${contextData}`;
  }
};

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile to determine role
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileData as { role: string; organization_id: string };
  const { role, organization_id } = profile;

  // Agents don't get AI insights
  if (role === "sales_agent") {
    return NextResponse.json({ error: "AI insights not available for sales agents" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const scope = typeof body.scope === "string" ? body.scope : "organization";

  // Check if OpenAI is available
  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json(
      { error: "AI insights are not available. OpenAI API key is not configured." },
      { status: 503 },
    );
  }

  if (!organization_id) {
    return NextResponse.json({ error: "Organization not found" }, { status: 400 });
  }

  // Create insight record
  const insightPayload = {
    organization_id: organization_id,
    initiated_by: session.user.id,
    scope,
    input: body.input ?? {},
    status: "pending",
  } satisfies Database["public"]["Tables"]["ai_insight_runs"]["Insert"];

  // Use service role client for inserts to avoid RLS and type inference issues with JSONB
  const serviceClient = getSupabaseServiceRoleClient();
  const { data: insightRecordData, error: insertError } = await (serviceClient
    .from("ai_insight_runs")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase JSONB type inference limitation
    .insert(insightPayload as any) as any)
    .select("id")
    .maybeSingle();

  if (insertError || !insightRecordData) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to create insight record" }, { status: 500 });
  }

  const insightRecord = insightRecordData as { id: string };

  try {
    // Generate prompt based on role
    const prompt = await getPromptForRole(role, scope, supabase, organization_id);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "chatgpt-5",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that provides actionable insights for brokerage management.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? "No insights generated.";

    // Update insight record with output
    const updatePayload = {
      status: "completed" as const,
      output: { insights: aiResponse, model: "chatgpt-5", tokens_used: completion.usage?.total_tokens ?? 0 },
      completed_at: new Date().toISOString(),
    };

    // Use service role client to avoid RLS and type issues  
    const serviceClient = getSupabaseServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateQuery = serviceClient.from("ai_insight_runs") as any;
    const { error: updateError } = await updateQuery
      .update(updatePayload as Database["public"]["Tables"]["ai_insight_runs"]["Update"])
      .eq("id", insightRecord.id);

    if (updateError) {
      console.error("Failed to update insight record:", updateError);
      return NextResponse.json({ error: "Failed to save insights" }, { status: 500 });
    }

    return NextResponse.json({
      id: insightRecord.id,
      status: "completed",
      output: updatePayload.output,
      message: "Insights generated successfully",
    });
  } catch (error) {
    // Update insight record with error
    const errorPayload = {
      status: "failed" as const,
      output: { error: error instanceof Error ? error.message : "Unknown error" },
      error_message: error instanceof Error ? error.message : "Unknown error",
      completed_at: new Date().toISOString(),
    };

    // Use service role client to avoid RLS and type issues
    const serviceClient = getSupabaseServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateQuery = serviceClient.from("ai_insight_runs") as any;
    const { error: updateError } = await updateQuery
      .update(errorPayload as Database["public"]["Tables"]["ai_insight_runs"]["Update"])
      .eq("id", insightRecord.id);

    if (updateError) {
      console.error("Failed to update insight record with error:", updateError);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate insights" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile to filter by organization
  const { data: profileData } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileData as { organization_id: string; role: string };
  const { organization_id } = profile;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || String(INSIGHT_LIMIT), 10);

  const query = supabase
    .from("ai_insight_recent")
    .select("*")
    .eq("organization_id", organization_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

