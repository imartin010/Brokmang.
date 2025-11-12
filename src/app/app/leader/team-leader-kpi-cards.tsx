"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import type { Database } from "@/lib/supabase";

type TeamSummary = Database["public"]["Tables"]["team_leader_dashboard"]["Row"];
type MemberPerformance = Database["public"]["Tables"]["team_member_performance"]["Row"];

export function TeamLeaderKPICards({
  teams,
  members,
}: {
  teams: TeamSummary[];
  members: MemberPerformance[];
}) {
  const _ = { teams, members }; // Will be used for database stats later
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    agentCasesReviewed: 0,
    leadsAssigned: 0,
    clientMeetings: 0,
    oneOnOneMeetings: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleStatsUpdate = (event: CustomEvent) => {
      const data = event.detail;
      setStats({
        agentCasesReviewed: data.agentCasesReviewed || 0,
        leadsAssigned: (data.leadsAssigned || 0) + (data.leadsRotated || 0),
        clientMeetings: data.clientMeetings || 0,
        oneOnOneMeetings: data.oneOnOneMeetings || 0,
      });
    };

    window.addEventListener("workflow-stats-updated", handleStatsUpdate as EventListener);
    return () => {
      window.removeEventListener("workflow-stats-updated", handleStatsUpdate as EventListener);
    };
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-border/40">
            <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Cases Reviewed"
        value={stats.agentCasesReviewed}
        subtitle="Agent cases"
        iconName="users"
      />
      <StatCard
        title="Leads Assigned"
        value={stats.leadsAssigned}
        subtitle="To agents"
        iconName="user-check"
      />
      <StatCard
        title="Client Meetings"
        value={stats.clientMeetings}
        subtitle="With agents"
        iconName="calendar"
      />
      <StatCard
        title="1-on-1 Sessions"
        value={stats.oneOnOneMeetings}
        subtitle="Coaching"
        iconName="target"
      />
    </div>
  );
}
