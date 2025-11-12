"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InlineInsightCardProps = {
  title: string;
  insight: string;
  onDismiss?: () => void;
};

export function InlineInsightCard({ title, insight, onDismiss }: InlineInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-transparent p-4 shadow-sm animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 rounded-lg hover:bg-white/50"
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  className="h-6 w-6 rounded-lg hover:bg-white/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div
            className={cn(
              "text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap transition-all duration-300",
              isExpanded ? "line-clamp-none" : "line-clamp-2"
            )}
          >
            {insight}
          </div>
          {!isExpanded && insight.length > 150 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-1.5 transition-colors"
            >
              Read more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

