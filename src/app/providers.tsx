"use client";

import type { ReactNode } from "react";

import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SupabaseProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </SupabaseProvider>
  );
};
