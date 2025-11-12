import type { Database } from "@/lib/supabase";

export type UserRole = Database["public"]["Enums"]["user_role"];

export const ROLE_LABELS: Record<UserRole, string> = {
  sales_agent: "Sales Agent",
  team_leader: "Team Leader",
  sales_manager: "Sales Manager",
  finance: "Finance",
  business_unit_head: "Business Unit Head",
  ceo: "CEO",
  admin: "Admin",
};

export const ROLE_LANDING_PATHS: Record<UserRole, string> = {
  sales_agent: "/app/agent",
  team_leader: "/app/leader",
  sales_manager: "/app/manager",
  finance: "/app/finance",
  business_unit_head: "/app/business-unit",
  ceo: "/app/executive",
  admin: "/app/admin",
};

export const getRoleLabel = (role?: UserRole | null) => {
  if (!role) return "Unassigned";
  return ROLE_LABELS[role];
};

export const getRoleLandingPath = (role?: UserRole | null) => {
  if (!role) return "/app";
  return ROLE_LANDING_PATHS[role] ?? "/app";
};
