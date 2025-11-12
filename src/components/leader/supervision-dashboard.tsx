"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  User,
  Phone,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Target,
  Activity,
  Inbox,
} from "lucide-react";

type SupervisedAgent = {
  id: string;
  full_name: string;
  email: string;
  supervision_started_at: string;
};

type AgentActivity = {
  workflow_status?: {
    isCheckedIn: boolean;
    checkInTime: string | null;
    orientation: string | null;
    followUpCalls: number;
    leadsToday: number;
    coldCalls: number;
    newRequests: number;
  };
  requests?: any[];
  meetings?: any[];
  deals?: any[];
};

export function SupervisionDashboard() {
  const [supervisedAgents, setSupervisedAgents] = useState<SupervisedAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SupervisedAgent | null>(null);
  const [agentActivity, setAgentActivity] = useState<AgentActivity>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisedAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentActivity(selectedAgent.id);
    }
  }, [selectedAgent]);

  const fetchSupervisedAgents = async () => {
    try {
      const response = await fetch("/api/supervision");
      if (response.ok) {
        const data = await response.json();
        const agents = data.data || [];
        setSupervisedAgents(agents);
        if (agents.length > 0 && !selectedAgent) {
          setSelectedAgent(agents[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch supervised agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentActivity = async (agentId: string) => {
    try {
      const [requestsRes, meetingsRes, dealsRes, metricsRes, attendanceRes] = await Promise.all([
        fetch(`/api/supervision/agent-activity?agentId=${agentId}&type=requests`),
        fetch(`/api/supervision/agent-activity?agentId=${agentId}&type=meetings`),
        fetch(`/api/supervision/agent-activity?agentId=${agentId}&type=deals`),
        fetch(`/api/metrics?agentId=${agentId}`),
        fetch(`/api/attendance/today?agentId=${agentId}`),
      ]);

      const requests = requestsRes.ok ? (await requestsRes.json()).data : [];
      const meetings = meetingsRes.ok ? (await meetingsRes.json()).data : [];
      const deals = dealsRes.ok ? (await dealsRes.json()).data : [];

      const metricsResult = metricsRes.ok ? await metricsRes.json() : null;
      const metrics = metricsResult?.data ?? null;

      const attendanceResult = attendanceRes.ok ? await attendanceRes.json() : null;
      const attendanceData = attendanceResult?.data ?? null;
      const attendanceRecord = Array.isArray(attendanceData)
        ? attendanceData.find((entry: any) => entry.agent_id === agentId) ?? null
        : attendanceData;

      const workflowStatus = {
        isCheckedIn: Boolean(attendanceRecord?.check_in_time),
        checkInTime: attendanceRecord?.check_in_time
          ? new Date(attendanceRecord.check_in_time).toLocaleTimeString()
          : null,
        orientation: metrics?.orientation ?? null,
        followUpCalls: metrics?.active_calls_count ?? 0,
        leadsToday: metrics?.leads_taken_count ?? 0,
        coldCalls: metrics?.cold_calls_count ?? 0,
        newRequests: metrics?.requests_generated ?? 0,
      };

      setAgentActivity({
        requests,
        meetings,
        deals,
        workflow_status: workflowStatus,
      });
    } catch (error) {
      console.error("Failed to fetch agent activity:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (supervisedAgents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Agents Under Supervision</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Enable supervision for agents in the Agent Supervision panel to monitor their activities here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <div className="flex gap-2 flex-wrap">
        {supervisedAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={`px-4 py-2 rounded-xl border transition-all ${
              selectedAgent?.id === agent.id
                ? "border-purple-300 bg-purple-50 shadow-sm"
                : "border-border/40 hover:border-purple-200 hover:bg-purple-50/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <div className="text-left">
                <p className="text-sm font-semibold">{agent.full_name}</p>
                <p className="text-xs text-muted-foreground">{agent.email}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card className="overflow-hidden rounded-2xl border-border/40">
          <div className="px-6 py-4 bg-linear-to-r from-purple-50 to-blue-50 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{selectedAgent.full_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Under supervision since{" "}
                    {new Date(selectedAgent.supervision_started_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Eye className="h-3 w-3 mr-1" />
                Monitoring
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="p-6">
            <TabsList className="bg-muted/40 p-1 rounded-xl mb-6">
              <TabsTrigger value="overview" className="rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="requests" className="rounded-lg">
                Requests
              </TabsTrigger>
              <TabsTrigger value="meetings" className="rounded-lg">
                Meetings
              </TabsTrigger>
              <TabsTrigger value="deals" className="rounded-lg">
                Deals
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-transparent border border-blue-200/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700/70 font-medium">Calls</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {agentActivity.workflow_status?.followUpCalls || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-linear-to-br from-green-50 to-transparent border border-green-200/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700/70 font-medium">Leads</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {agentActivity.workflow_status?.leadsToday || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-linear-to-br from-purple-50 to-transparent border border-purple-200/40">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-purple-700/70 font-medium">Requests</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {agentActivity.requests?.length || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-linear-to-br from-amber-50 to-transparent border border-amber-200/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <p className="text-xs text-amber-700/70 font-medium">Meetings</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-700">
                    {agentActivity.meetings?.length || 0}
                  </p>
                </div>
              </div>

              {/* Check-in Status */}
              {agentActivity.workflow_status?.isCheckedIn ? (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-700">Currently Checked In</p>
                  </div>
                  <p className="text-xs text-green-600">
                    Checked in at {agentActivity.workflow_status.checkInTime}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm font-semibold text-amber-700">Not checked in today</p>
                </div>
              )}
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-3">
              {agentActivity.requests && agentActivity.requests.length > 0 ? (
                agentActivity.requests.map((request: any) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{request.client_name}</h4>
                      <Badge variant="outline" className="capitalize text-xs">
                        {request.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        <span>{request.destination}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3" />
                        <span>{request.client_budget?.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        <span>{request.project_needed}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No requests yet" />
              )}
            </TabsContent>

            {/* Meetings Tab */}
            <TabsContent value="meetings" className="space-y-3">
              {agentActivity.meetings && agentActivity.meetings.length > 0 ? (
                agentActivity.meetings.map((meeting: any) => (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all"
                  >
                    <h4 className="font-semibold text-sm mb-2">{meeting.title}</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{meeting.meeting_time}</span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No meetings scheduled" />
              )}
            </TabsContent>

            {/* Deals Tab */}
            <TabsContent value="deals" className="space-y-3">
              {agentActivity.deals && agentActivity.deals.length > 0 ? (
                agentActivity.deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{deal.name}</h4>
                      <Badge variant="outline" className="capitalize text-xs">
                        {deal.stage}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-semibold">{deal.deal_value?.toLocaleString()} EGP</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Probability</p>
                        <p className="font-semibold">{deal.probability}%</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No deals in pipeline" />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
        <Inbox className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

