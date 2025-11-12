import type { User } from "@supabase/supabase-js";

import { env } from "@/env";
import { recordActivity } from "@/lib/activity-log";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin-client";
import type { Database, Json } from "@/lib/supabase";
import type { UserRole } from "./roles";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

const DEFAULT_ROLE: UserRole = "sales_agent";

const deriveDisplayName = (user: User) => {
  const metadataName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata?.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata?.name) ||
    undefined;

  if (metadataName) {
    return metadataName;
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "New teammate";
  }

  return "New teammate";
};

export const ensureProfileForUser = async (user: User): Promise<ProfileRow | null> => {
  const supabase = getSupabaseServiceRoleClient();

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id, role, organization_id, full_name, preferred_name, email, avatar_url, metadata")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("Failed to load user profile", selectError);
    throw selectError;
  }

  if (existingProfile) {
    return existingProfile as ProfileRow;
  }

  if (!env.DEFAULT_ORGANIZATION_ID) {
    console.warn(
      "DEFAULT_ORGANIZATION_ID is not set; skipping automatic profile creation for user",
      user.id,
    );
    return null;
  }

  const fullName = deriveDisplayName(user);

  const payload: ProfileInsert = {
    id: user.id,
    organization_id: env.DEFAULT_ORGANIZATION_ID,
    full_name: fullName,
    preferred_name:
      (typeof user.user_metadata?.preferred_name === "string" &&
        user.user_metadata?.preferred_name) ||
      null,
    email: user.email ?? null,
    role: DEFAULT_ROLE,
    avatar_url:
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata?.avatar_url) ||
      null,
    metadata: (user.user_metadata ?? {}) as Json,
  };

  const { data: createdProfileData, error: insertError } = await supabase
    .from("profiles")
    .insert(payload as any)
    .select("id, role, organization_id, full_name, preferred_name, email, avatar_url, metadata")
    .maybeSingle();

  if (insertError) {
    console.error("Failed to create user profile", insertError);
    throw insertError;
  }

  if (!createdProfileData) {
    return null;
  }

  const createdProfile = createdProfileData as ProfileRow;

  await recordActivity({
    supabase,
    organizationId: payload.organization_id,
    actorId: user.id,
    action: "profile_created",
    entityType: "profile",
    entityId: createdProfile.id,
    metadata: {
      email: createdProfile.email,
      role: createdProfile.role,
    },
  });

  return createdProfile;
};
