"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileCheck, Star, AlertCircle, CheckCircle2, TrendingUp, UserPlus } from "lucide-react";

export function TeamLeaderSidebarContent() {
  const [pendingCount, setPendingCount] = useState(0);
  const [workflowProgress, setWorkflowProgress] = useState({ completed: 0, total: 8 });
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchStats();
    }
  }, [isMounted]);

  // Listen for workflow updates
  useEffect(() => {
    if (!isMounted) return;

    const handleWorkflowUpdate = (event: CustomEvent) => {
      const data = event.detail;
      let completed = 0;
      if (data.isCheckedIn) completed++;
      if (data.orientation) completed++;
      if (data.agentCasesReviewed > 0) completed++;
      if (data.leadsAssigned > 0 || data.leadsRotated > 0) completed++;
      if (data.clientMeetings > 0) completed++;
      if (data.oneOnOneMeetings > 0) completed++;
      if (data.notes) completed++;
      if (data.checkOutTime) completed++;
      
      setWorkflowProgress({ completed, total: 8 });
      setIsCheckedIn(data.isCheckedIn || false);
    };

    window.addEventListener("workflow-stats-updated", handleWorkflowUpdate as EventListener);
    return () => {
      window.removeEventListener("workflow-stats-updated", handleWorkflowUpdate as EventListener);
    };
  }, [isMounted]);

  const fetchStats = async () => {
    try {
      const requestsRes = await fetch("/api/requests?status=pending");
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setPendingCount((data.data || []).length);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  return (
    <>
      {/* Quick Stats Panel */}
      <div className="px-4 py-4 border-b border-border/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Stats
        </p>
        <div className="space-y-2.5">
          {/* Check-in Status */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              {isCheckedIn ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <span className="text-xs font-medium">Check-in</span>
            </div>
            <Badge variant={isCheckedIn ? "default" : "outline"} className="text-[10px] h-5">
              {isCheckedIn ? "Active" : "Pending"}
            </Badge>
          </div>

          {/* Workflow Progress */}
          <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-purple-700">Daily Routine</span>
              <span className="text-xs font-bold text-purple-700" suppressHydrationWarning>
                {workflowProgress.completed}/{workflowProgress.total}
              </span>
            </div>
            <div className="w-full bg-purple-200/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all duration-500"
                style={{ width: `${(workflowProgress.completed / workflowProgress.total) * 100}%` }}
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Pending Requests Alert */}
          {pendingCount > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-900">Pending Reviews</span>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                  {pendingCount}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-border/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Actions
        </p>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-xs"
            onClick={() => {
              const section = document.getElementById("pending-requests-section");
              if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <FileCheck className="h-3.5 w-3.5 mr-2" />
            Review Requests
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-xs"
            onClick={() => {
              const section = document.getElementById("rating-section");
              if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <Star className="h-3.5 w-3.5 mr-2" />
            Rate Agents
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-xs"
            onClick={() => {
              const section = document.getElementById("supervision-section");
              if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <Users className="h-3.5 w-3.5 mr-2" />
            Agent Supervision
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start h-9 text-xs"
            onClick={() => window.dispatchEvent(new CustomEvent("assign-lead"))}
          >
            <UserPlus className="h-3.5 w-3.5 mr-2" />
            Assign Leads
          </Button>
        </div>
      </div>

      {/* Today's Priorities */}
      <div className="px-4 py-4 border-b border-border/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Today's Priorities
        </p>
        <div className="space-y-2">
          {pendingCount > 0 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer">
              <FileCheck className="h-3.5 w-3.5 text-amber-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Approve Requests</p>
                <p className="text-[10px] text-muted-foreground">{pendingCount} awaiting</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <Star className="h-3.5 w-3.5 text-blue-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Daily Ratings</p>
              <p className="text-[10px] text-muted-foreground">Rate team performance</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <Users className="h-3.5 w-3.5 text-purple-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Agent Follow-ups</p>
              <p className="text-[10px] text-muted-foreground">Support your team</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
