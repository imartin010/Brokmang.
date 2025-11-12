"use client";

import { TeamLeaderDailyWorkflow } from "@/components/leader/team-leader-daily-workflow";
import { PendingRequestsList } from "@/components/requests/pending-requests-list";
import { AgentSupervisionPanel } from "@/components/supervision/agent-supervision-panel";
import { DailyRatingForm } from "@/components/ratings/daily-rating-form";
import { WidgetCard } from "@/components/dashboard/widget-card";
import type { Database } from "@/lib/supabase";

type TeamSummary = Database["public"]["Tables"]["team_leader_dashboard"]["Row"];
type MemberPerformance = Database["public"]["Tables"]["team_member_performance"]["Row"];

export function TeamLeaderOverview({ userId }: { userId: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Daily Workflow */}
      <div className="lg:col-span-2 space-y-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <TeamLeaderDailyWorkflow userId={userId} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Agent Supervision */}
        <div id="supervision-section" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <WidgetCard title="Agent Supervision" iconName="users" subtitle="Put agents under microscope">
            <AgentSupervisionPanel />
          </WidgetCard>
        </div>

        {/* Daily Agent Rating */}
        <div id="rating-section" className="animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
          <WidgetCard title="Daily Agent Rating" iconName="star" subtitle="Rate your team">
            <DailyRatingForm />
          </WidgetCard>
        </div>

        {/* Pending Client Requests */}
        <div id="pending-requests-section" className="animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <WidgetCard title="Pending Client Requests" iconName="file" subtitle="Awaiting approval">
            <PendingRequestsList />
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
