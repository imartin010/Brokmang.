import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/env";
import type { Database } from "./types";

let serviceRoleClient: SupabaseClient<Database> | null = null;

export const getSupabaseServiceRoleClient = (): SupabaseClient<Database> => {
  if (serviceRoleClient) {
    return serviceRoleClient;
  }

  serviceRoleClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  return serviceRoleClient;
};

export const resetSupabaseServiceRoleClient = (): void => {
  serviceRoleClient = null;
};
