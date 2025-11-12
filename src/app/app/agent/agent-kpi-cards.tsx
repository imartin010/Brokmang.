"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export function AgentKPICards() {
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    followUpCalls: 0,
    leadsToday: 0,
    coldCalls: 0,
    newRequests: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleStatsUpdate = (event: CustomEvent) => {
      const data = event.detail;
      setStats({
        followUpCalls: data.followUpCalls || 0,
        leadsToday: data.leadsToday || 0,
        coldCalls: data.coldCalls || 0,
        newRequests: data.newRequests || 0,
      });
    };

    window.addEventListener("workflow-stats-updated", handleStatsUpdate as EventListener);

    return () => {
      window.removeEventListener("workflow-stats-updated", handleStatsUpdate as EventListener);
    };
  }, [isMounted]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Follow-up Calls"
        value={stats.followUpCalls}
        subtitle="With recent clients"
        iconName="phone"
      />
      <StatCard
        title="Leads Taken"
        value={stats.leadsToday}
        subtitle="Today's leads"
        iconName="users"
      />
      <StatCard
        title="Cold Calls"
        value={stats.coldCalls}
        subtitle="Active calls made"
        iconName="phone"
      />
      <StatCard
        title="Requests Sent"
        value={stats.newRequests}
        subtitle="To team leader"
        iconName="file"
      />
    </div>
  );
}

