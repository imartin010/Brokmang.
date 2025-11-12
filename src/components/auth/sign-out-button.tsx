"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/providers/supabase-provider";

export const SignOutButton = () => {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      router.push("/sign-in");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <span onClick={handleSignOut} className="w-full">
      {isSigningOut ? "Signing out..." : "Sign out"}
    </span>
  );
};
