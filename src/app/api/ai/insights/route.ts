import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin-client";
import type { Database } from "@/lib/supabase";

type SupportedRole = "team_leader" | "sales_manager" | "business_unit_head" | "ceo";

const SUPPORTED_AI_ROLES: SupportedRole[] = ["team_leader", "sales_manager", "business_unit_head", "ceo"];
const PRIMARY_MODEL = process.env.OPENAI_INSIGHTS_MODEL ?? "chatgpt-5";
const FALLBACK_MODEL = process.env.OPENAI_INSIGHTS_FALLBACK_MODEL ?? "chatgpt-4o-latest";

type KeyMetric = {
  title: string;
  value: string;
  trend?: string;
  insight?: string;
};

type Recommendation = {
  priority: "high" | "medium" | "low";
  title: string;
  action: string;
  impact: string;
};

type WatchItem = {
  issue: string;
  risk: string;
  suggestedAction: string;
};

type Icebreaker = {
  audience: string;
  conversationGoal: string;
  script: string;
};

type StructuredInsightPayload = {
  role: string;
  generatedAt: string;
  summary: string;
  keyMetrics: KeyMetric[];
  recommendations: Recommendation[];
  watchlist?: WatchItem[];
  icebreakers: Icebreaker[];
  nextCheckIn?: string;
};

type RoleContext = {
  role: SupportedRole | string;
  organizationId: string;
  dataSources: Record<string, unknown>;
  primaryFocus: string;
  relationshipTargets: IcebreakerTarget[];
};

type IcebreakerTarget = {
  name: string;
  relationship: string;
  context: string;
};

const INSIGHT_LIMIT = 5;

// Initialize OpenAI client (optional - only if API key is available)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

const ROLE_LABEL: Record<SupportedRole | "admin", string> = {
  team_leader: "Team Leader",
  sales_manager: "Sales Manager",
  business_unit_head: "Business Unit Head",
  ceo: "CEO",
  admin: "Administrator",
};

const STRUCTURED_RESPONSE_SCHEMA = `
Return ONLY valid JSON (no markdown, code fences, or commentary) with the following structure:
{
  "summary": "One-paragraph executive summary tailored to the role.",
  "keyMetrics": [
    {
      "title": "Descriptive metric name",
      "value": "Readable value (include currency/percent when relevant)",
      "trend": "Short trend label such as '↑ 8% vs. last week'",
      "insight": "Why this matters for the role"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "Actionable headline",
      "action": "Specific next step with ownership where possible",
      "impact": "What positive result the action drives"
    }
  ],
  "watchlist": [
    {
      "issue": "Emerging risk or bottleneck",
      "risk": "Potential consequence if ignored",
      "suggestedAction": "Preventive or corrective step"
    }
  ],
  "icebreakers": [
    {
      "audience": "Person or group to meet (e.g., Agent Martin, Team Alpha)",
      "conversationGoal": "Desired outcome or focus area",
      "script": "Natural language opener and guidance for a one-to-one conversation"
    }
  ],
  "nextCheckIn": "Concrete follow-up or cadence recommendation with timeframe."
}
If a section has no content, return an empty array for it (except summary and nextCheckIn which must always be strings).`;

const sanitizeForPrompt = (value: unknown) => {
  const stringifySafe = (input: unknown) => {
    try {
      return JSON.stringify(input, null, 2);
    } catch {
      return JSON.stringify(String(input));
    }
  };

  if (Array.isArray(value)) {
    return value.slice(0, 12).map((item) => JSON.parse(stringifySafe(item)));
  }

  if (value && typeof value === "object") {
    return JSON.parse(stringifySafe(value));
  }

  return value;
};

const gatherRoleContext = async (
  role: SupportedRole,
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
  organizationId: string,
): Promise<RoleContext> => {
  const dataSources: Record<string, unknown> = {};
  const relationshipTargets: IcebreakerTarget[] = [];

  if (role === "team_leader") {
    const { data: teamSummary } = await supabase
      .from("team_leader_dashboard")
      .select("*")
      .eq("leader_id", userId)
      .maybeSingle();

    if (teamSummary) {
      dataSources.teamDashboard = sanitizeForPrompt(teamSummary);
      const { team_id: teamId } = teamSummary as { team_id: string };

      if (teamId) {
        const { data: members } = await supabase
          .from("team_member_performance")
          .select("*")
          .eq("team_id", teamId)
          .limit(12);

        if (members) {
          dataSources.teamMembers = sanitizeForPrompt(members);
          relationshipTargets.push(
            ...members.slice(0, 6).map((member) => ({
              name: (member as Record<string, unknown>).agent_name as string,
              relationship: "Sales Agent",
              context: `Deals open: ${(member as Record<string, unknown>).open_deals}, Closed value: ${(member as Record<string, unknown>).closed_value}`,
            })),
          );
        }
      }
    }

    const { data: pendingRequests } = await supabase
      .from("client_requests")
      .select("id, client_name, status, destination, client_budget, project_needed, agent_id")
      .eq("status", "pending")
      .limit(10);

    if (pendingRequests) {
      dataSources.pendingRequests = sanitizeForPrompt(pendingRequests);
    }

    return {
      role,
      organizationId,
      dataSources,
      primaryFocus: "Coach agents, remove blockers, and progress deals effectively.",
      relationshipTargets,
    };
  }

  if (role === "sales_manager") {
    const { data: teams } = await supabase.from("team_leader_dashboard").select("*").limit(25);
    if (teams) {
      dataSources.teams = sanitizeForPrompt(teams);
      relationshipTargets.push(
        ...teams.slice(0, 6).map((team) => ({
          name: (team as Record<string, unknown>).team_name as string,
          relationship: "Team Leader",
          context: `Weighted pipeline: ${(team as Record<string, unknown>).weighted_pipeline}, Closed value: ${(team as Record<string, unknown>).total_closed_value}`,
        })),
      );
    }

    const { data: finance } = await supabase
      .from("business_unit_finance_overview")
      .select("*")
      .eq("organization_id", organizationId)
      .limit(10);

    if (finance) {
      dataSources.businessUnits = sanitizeForPrompt(finance);
    }

    return {
      role,
      organizationId,
      dataSources,
      primaryFocus: "Optimize performance across teams and allocate support where impact is highest.",
      relationshipTargets,
    };
  }

  if (role === "business_unit_head") {
    const { data: businessUnit } = await supabase
      .from("business_units")
      .select("id, name")
      .eq("leader_id", userId)
      .maybeSingle();

    if (businessUnit) {
      const buId = (businessUnit as { id: string }).id;
      dataSources.businessUnitProfile = sanitizeForPrompt(businessUnit);

      const { data: buFinance } = await supabase
        .from("business_unit_finance_overview")
        .select("*")
        .eq("business_unit_id", buId)
        .limit(10);

      if (buFinance) {
        dataSources.financials = sanitizeForPrompt(buFinance);
      }

      const { data: teams } = await supabase
        .from("team_leader_dashboard")
        .select("*")
        .eq("business_unit_id", buId)
        .limit(20);

      if (teams) {
        dataSources.teams = sanitizeForPrompt(teams);
        relationshipTargets.push(
          ...teams.slice(0, 6).map((team) => ({
            name: (team as Record<string, unknown>).team_name as string,
            relationship: "Team Leader",
            context: `Member count: ${(team as Record<string, unknown>).member_count}, Pipeline: ${(team as Record<string, unknown>).weighted_pipeline}`,
          })),
        );
      }
    }

    return {
      role,
      organizationId,
      dataSources,
      primaryFocus: "Drive business unit profitability and align teams with financial objectives.",
      relationshipTargets,
    };
  }

  // CEO and admin share executive overview
  const { data: orgOverview } = await supabase
    .from("organization_overview")
    .select("*")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgOverview) {
    dataSources.organizationOverview = sanitizeForPrompt(orgOverview);
  }

  const { data: businessUnits } = await supabase
    .from("business_unit_finance_overview")
    .select("*")
    .eq("organization_id", organizationId)
    .limit(20);

  if (businessUnits) {
    dataSources.businessUnits = sanitizeForPrompt(businessUnits);
    relationshipTargets.push(
      ...businessUnits.slice(0, 6).map((bu) => ({
        name: (bu as Record<string, unknown>).business_unit_name as string,
        relationship: "Business Unit Head",
        context: `Revenue: ${(bu as Record<string, unknown>).total_revenue}, Margin: ${(bu as Record<string, unknown>).total_margin}`,
      })),
    );
  }

  return {
    role,
    organizationId,
    dataSources,
    primaryFocus: "Steer the organization, balance growth with profitability, and anticipate risks.",
    relationshipTargets,
  };
};

const buildPrompt = (context: RoleContext): string => {
  const roleLabel = ROLE_LABEL[context.role as SupportedRole] ?? ROLE_LABEL.admin;

  const baseBrief = {
    role: roleLabel,
    organizationId: context.organizationId,
    primaryFocus: context.primaryFocus,
    relationshipTargets: context.relationshipTargets,
    dataSources: context.dataSources,
  };

  return [
    `You are an elite strategy copilot assisting the ${roleLabel} of a high-performing brokerage.` +
      " Deliver an insightful, encouraging, and action-ready briefing that the leader can immediately use.",
    "Use the provided context to identify signal, not noise. Highlight urgent wins, emerging risks, and opportunities to coach or collaborate.",
    "Craft the response in clear business language. Provide realistic numbers, trends, and recommendations grounded in the data.",
    "Always include engaging one-to-one icebreaker scripts that help the leader start productive conversations.",
    "If data is missing, make reasonable assumptions and call them out explicitly in the watchlist.",
    "Respond in English.",
    "Context JSON:",
    JSON.stringify(baseBrief, null, 2),
    STRUCTURED_RESPONSE_SCHEMA,
  ].join("\n\n");
};

const parseStructuredInsight = (raw: string): StructuredInsightPayload | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const clean = trimmed
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(clean) as StructuredInsightPayload;
    if (
      typeof parsed.summary === "string" &&
      Array.isArray(parsed.keyMetrics) &&
      Array.isArray(parsed.recommendations) &&
      Array.isArray(parsed.icebreakers)
    ) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to parse structured insight payload:", error);
  }

  return null;
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

  if (!SUPPORTED_AI_ROLES.includes(role as SupportedRole)) {
    return NextResponse.json({ error: "AI insights are currently available for team leaders, managers, business unit heads, and the CEO." }, { status: 403 });
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

  const invokeModel = async (model: string, prompt: string) =>
    openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a senior operating partner for a high-growth brokerage. Provide sharp, data-backed insight and coaching-level conversation starters.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.4,
    });

  const isModelNotFoundError = (err: unknown) => {
    if (err && typeof err === "object") {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        return true;
      }
      const message = (err as { message?: string }).message;
      if (typeof message === "string" && message.toLowerCase().includes("does not exist")) {
        return true;
      }
    }
    if (typeof err === "string" && err.toLowerCase().includes("does not exist")) {
      return true;
    }
    return false;
  };

  try {
    const supportedRole = role as SupportedRole;
    const context = await gatherRoleContext(supportedRole, supabase, session.user.id, organization_id);
    const prompt = buildPrompt(context);

    const modelPreferences = [
      PRIMARY_MODEL,
      ...(FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL ? [FALLBACK_MODEL] : []),
    ];

    let completion: Awaited<ReturnType<typeof invokeModel>> | null = null;
    let modelUsed = PRIMARY_MODEL;
    let lastError: unknown;

    for (const candidateModel of modelPreferences) {
      try {
        const response = await invokeModel(candidateModel, prompt);
        if (response.choices.length === 0) {
          lastError = new Error("Model returned no choices");
          continue;
        }
        completion = response;
        modelUsed = candidateModel;
        break;
      } catch (error) {
        lastError = error;
        if (!isModelNotFoundError(error)) {
          break;
        }
      }
    }

    if (!completion) {
      throw lastError instanceof Error ? lastError : new Error("Failed to generate insight");
    }

    const aiResponse = completion.choices[0]?.message?.content ?? "No insights generated.";
    const structured = parseStructuredInsight(aiResponse);

    // Update insight record with output
    const updatePayload = {
      status: "completed" as const,
      output: {
        requested_model: PRIMARY_MODEL,
        model: modelUsed,
        raw_text: aiResponse,
        structured,
        tokens_used: completion.usage?.total_tokens ?? 0,
      },
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
      fallbackUsed: updatePayload.output.model !== PRIMARY_MODEL,
      requestedModel: PRIMARY_MODEL,
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

