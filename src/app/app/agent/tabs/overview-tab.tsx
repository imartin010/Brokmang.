"use client";

import { DailyWorkflow } from "@/components/agent/daily-workflow";
import { ClientRequestForm } from "@/components/requests/client-request-form";
import { MeetingScheduler } from "@/components/meetings/meeting-scheduler";
import { MeetingLogForm } from "@/components/meetings/meeting-log-form";
import { MyRequestsList } from "@/components/requests/my-requests-list";
import { MyMeetingsList } from "@/components/meetings/my-meetings-list";
import { PipelineWeight } from "@/components/requests/pipeline-weight";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import type { Database } from "@/lib/supabase";

function WorkflowSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-md">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <Skeleton className="h-64 w-full" />
      </div>
    </Card>
  );
}

type AgentSummary = Database["public"]["Tables"]["agent_dashboard_summary"]["Row"];
type AgentActivity = Database["public"]["Tables"]["agent_daily_activity"]["Row"];

export function AgentOverviewTab({
  summary,
  activity,
  userId,
}: {
  summary: AgentSummary | null;
  activity: AgentActivity[];
  userId: string;
}) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingLogModalOpen, setMeetingLogModalOpen] = useState(false);

  // Listen for custom events from DailyWorkflow
  useEffect(() => {
    const handleOpenRequest = () => setRequestModalOpen(true);
    const handleOpenMeeting = () => setMeetingModalOpen(true);
    const handleOpenMeetingLog = () => setMeetingLogModalOpen(true);

    window.addEventListener("open-request-modal", handleOpenRequest);
    window.addEventListener("open-meeting-modal", handleOpenMeeting);
    window.addEventListener("open-meeting-log-modal", handleOpenMeetingLog);

    return () => {
      window.removeEventListener("open-request-modal", handleOpenRequest);
      window.removeEventListener("open-meeting-modal", handleOpenMeeting);
      window.removeEventListener("open-meeting-log-modal", handleOpenMeetingLog);
    };
  }, []);

  const handleRequestSuccess = () => {
    setRequestModalOpen(false);
    // Notify workflow to increment counter
    window.dispatchEvent(new CustomEvent("request-submitted"));
  };

  const handleMeetingSuccess = () => {
    setMeetingModalOpen(false);
    // Notify workflow to increment counter
    window.dispatchEvent(new CustomEvent("meeting-scheduled"));
  };

  const handleMeetingLogSuccess = () => {
    setMeetingLogModalOpen(false);
    // Notify workflow to increment counter
    window.dispatchEvent(new CustomEvent("meeting-logged"));
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workflow - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <DailyWorkflow userId={userId} />
          </div>
        </div>

        {/* Right Sidebar - Requests & Meetings */}
        <div className="space-y-6">
          {/* My Requests Card */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <WidgetCard title="My Requests" iconName="file" subtitle="Submitted to team leader">
              <MyRequestsList />
            </WidgetCard>
          </div>

          {/* My Scheduled Meetings */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
            <WidgetCard title="My Scheduled Meetings" iconName="calendar" subtitle="Upcoming appointments">
              <MyMeetingsList />
            </WidgetCard>
          </div>

          {/* My Pipeline Weight */}
          <div id="pipeline-weight-section" className="animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
            <WidgetCard title="My Pipeline Weight" iconName="trending-up" subtitle="Total from my requests">
              <PipelineWeight />
            </WidgetCard>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Submit Client Request</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add request details for team leader review
            </p>
          </DialogHeader>
          <ClientRequestForm onSuccess={handleRequestSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={meetingModalOpen} onOpenChange={setMeetingModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Schedule Meeting</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add date and time to receive system reminders
            </p>
          </DialogHeader>
          <MeetingScheduler onSuccess={handleMeetingSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={meetingLogModalOpen} onOpenChange={setMeetingLogModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Log Completed Meeting</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add meeting details: Developer name, Project name, Destination, Outcome (optional)
            </p>
          </DialogHeader>
          <MeetingLogForm onSuccess={handleMeetingLogSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
