import type { Database } from "@/lib/supabase";

export type ProfileWithRole = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role" | "organization_id" | "full_name"
>;

export const requireRole = (
  profile: ProfileWithRole | null,
  allowedRoles: ProfileWithRole["role"][],
) => {
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
};
