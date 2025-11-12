"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/notifications/notification-provider";

type GenerateInsightButtonProps = {
  scope?: string;
  className?: string;
};

export function GenerateInsightButton({ scope = "organization", className }: GenerateInsightButtonProps) {
  const router = useRouter();
  const { notify } = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (isSubmitting || isPending) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        const message =
          (payload && typeof payload.error === "string" ? payload.error : null) ?? "Failed to generate insight.";
        throw new Error(message);
      }

      const fallbackUsed = Boolean(payload.fallbackUsed);
      notify({
        title: fallbackUsed ? "Fallback model used" : "Insight ready",
        message: fallbackUsed
          ? "chatgpt-5 is unavailable for this account. We generated the briefing with chatgpt-4o-latest and refreshed the feed."
          : "Strategic insight generated successfully. The feed is refreshing now.",
        variant: fallbackUsed ? "warning" : "success",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      notify({
        title: "Generation failed",
        message: error instanceof Error ? error.message : "Unable to generate an insight right now.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting || isPending}
      className={className}
    >
      {isSubmitting || isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Insight
        </>
      )}
    </Button>
  );
}

