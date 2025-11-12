"use client";

import type { ReactNode } from "react";

import { SupabaseProvider } from "@/components/providers/supabase-provider";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return <SupabaseProvider>{children}</SupabaseProvider>;
};
