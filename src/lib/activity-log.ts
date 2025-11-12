"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase";

type ActivityPayload = {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json | null;
};

export const recordActivity = async ({
  supabase,
  organizationId,
  actorId,
  action,
  entityType,
  entityId,
  metadata = null,
}: ActivityPayload) => {
  const activityPayload = {
    organization_id: organizationId,
    actor_id: actorId ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata,
  } satisfies Database["public"]["Tables"]["activity_log"]["Insert"];

  await supabase.from("activity_log").insert(activityPayload as any);
};



