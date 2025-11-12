"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

type SupabaseProviderProps = {
  children: ReactNode;
  initialSession?: Session | null;
};

export const SupabaseProvider = ({ children, initialSession = null }: SupabaseProviderProps) => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(() => !initialSession);

  useEffect(() => {
    let isMounted = true;

    if (!initialSession) {
      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialSession, supabase]);

  const value = useMemo(
    () => ({
      supabase,
      session,
      loading,
    }),
    [loading, session, supabase],
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
