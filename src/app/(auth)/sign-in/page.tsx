"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { getSupabaseBrowserClient } from "@/lib/supabase";

const supabase = getSupabaseBrowserClient();

const BRAND_COLORS = {
  brand: "oklch(0.205 0 0)",
  brandAccent: "oklch(0.145 0 0)",
};

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToParam = searchParams.get("redirectTo") ?? "/app";
  const errorMessage = searchParams.get("error");

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;

    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("redirect_to", redirectToParam);
    return url.toString();
  }, [redirectToParam]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push(redirectToParam);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectToParam]);

  return (
    <div className="border-border bg-card w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-xl">
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.35em] uppercase">
          brokmang.
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Use your work email to access your brokerage dashboards.
        </p>
      </div>

      {errorMessage ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {decodeURIComponent(errorMessage)}
        </div>
      ) : null}

      <Auth
        supabaseClient={supabase}
        providers={[]}
        redirectTo={redirectTo}
        view="sign_in"
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: BRAND_COLORS,
              radii: {
                borderRadiusButton: "9999px",
                buttonBorderRadius: "9999px",
                inputBorderRadius: "12px",
              },
            },
          },
          className: {
            input: "bg-background border border-border text-foreground",
            button: "bg-primary text-primary-foreground hover:bg-primary/90",
          },
        }}
      />

      <p className="text-muted-foreground text-center text-xs">
        Need an account?{" "}
        <Link
          href="mailto:support@brokmang.com"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Contact support
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
