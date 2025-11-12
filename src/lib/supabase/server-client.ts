import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/env";
import type { Database } from "./types";

type NextCookies = Awaited<ReturnType<typeof cookies>>;

export const getSupabaseServerClient = cache(async (): Promise<SupabaseClient<Database>> => {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: async () => {
          const store = (await cookies()) as NextCookies;
          return store.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        setAll: async (cookieList) => {
          const store = (await cookies()) as NextCookies;
          const setter = (
            store as unknown as {
              set?: (name: string, value: string, options?: CookieOptions) => void;
            }
          ).set;

          if (typeof setter !== "function") {
            return;
          }

          cookieList.forEach(({ name, value, options }) => {
            setter(name, value, options);
          });
        },
      },
    },
  );
});
