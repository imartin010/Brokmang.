"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LogIn,
  LogOut,
  BookOpen,
  Phone,
  Users,
  PhoneCall,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  Home,
  Plus,
  Check,
  Save,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Orientation = "team" | "developer" | null;

export function DailyWorkflow({ userId }: { userId: string }) {
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<Orientation>(null);
  const [followUpCalls, setFollowUpCalls] = useState(0);
  const [leadsToday, setLeadsToday] = useState(0);
  const [coldCalls, setColdCalls] = useState(0);
  const [newRequests, setNewRequests] = useState(0);
  const [meetingsScheduled, setMeetingsScheduled] = useState(0);
  const [meetingsCompleted, setMeetingsCompleted] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [location, setLocation] = useState("Office");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const [isSyncingMetrics, setIsSyncingMetrics] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSyncSkipRef = useRef(false);

  const formatTime = (value: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleTimeString();
  };

  // Load attendance + metrics from the backend on mount
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        const [attendanceResponse, metricsResponse] = await Promise.all([
          fetch("/api/attendance/today"),
          fetch("/api/metrics"),
        ]);

        if (!isCancelled) {
          if (attendanceResponse.ok) {
            const attendanceResult = await attendanceResponse.json();
            const rawAttendance = Array.isArray(attendanceResult.data)
              ? (attendanceResult.data.find((entry: any) => entry.agent_id === userId) ?? null)
              : attendanceResult.data ?? null;

            if (rawAttendance) {
              setIsCheckedIn(Boolean(rawAttendance.check_in_time));
              setCheckInTime(rawAttendance.check_in_time ?? null);
              setCheckOutTime(rawAttendance.check_out_time ?? null);
              setLocation(rawAttendance.location_check_in ?? rawAttendance.location_check_out ?? "Office");
            } else {
              setIsCheckedIn(false);
              setCheckInTime(null);
              setCheckOutTime(null);
              setLocation("Office");
            }
          } else {
            setIsCheckedIn(false);
            setCheckInTime(null);
            setCheckOutTime(null);
            setLocation("Office");
          }

          if (metricsResponse.ok) {
            const metricsResult = await metricsResponse.json();
            const metrics = metricsResult.data as
              | (Record<string, unknown> & {
                  active_calls_count?: number;
                  leads_taken_count?: number;
                  cold_calls_count?: number;
                  meetings_scheduled?: number;
                  meetings_completed?: number;
                  requests_generated?: number;
                  mood?: string | null;
                  notes?: string | null;
                  orientation?: string | null;
                  updated_at?: string;
                })
              | null;

            if (metrics) {
              setFollowUpCalls(metrics.active_calls_count ?? 0);
              setLeadsToday(metrics.leads_taken_count ?? 0);
              setColdCalls(metrics.cold_calls_count ?? 0);
              setMeetingsScheduled(metrics.meetings_scheduled ?? 0);
              setMeetingsCompleted(metrics.meetings_completed ?? 0);
              setNewRequests(metrics.requests_generated ?? 0);
              setMood(metrics.mood ?? null);
              setNotes(metrics.notes ?? "");
              setOrientation(metrics.orientation === "team" || metrics.orientation === "developer" ? metrics.orientation : null);
              setLastSaved(metrics.updated_at ? new Date(metrics.updated_at) : null);
            } else {
              setFollowUpCalls(0);
              setLeadsToday(0);
              setColdCalls(0);
              setMeetingsScheduled(0);
              setMeetingsCompleted(0);
              setNewRequests(0);
              setMood(null);
              setNotes("");
              setOrientation(null);
              setLastSaved(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load workflow data:", error);
      } finally {
        if (!isCancelled) {
          initialSyncSkipRef.current = true;
          setIsInitialized(true);
        }
      }
    };

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Listen for submission events to increment counters
  useEffect(() => {
    const handleRequestSubmitted = () => setNewRequests((prev) => prev + 1);
    const handleMeetingScheduled = () => setMeetingsScheduled((prev) => prev + 1);
    const handleMeetingLogged = () => setMeetingsCompleted((prev) => prev + 1);

    window.addEventListener("request-submitted", handleRequestSubmitted);
    window.addEventListener("meeting-scheduled", handleMeetingScheduled);
    window.addEventListener("meeting-logged", handleMeetingLogged);

    return () => {
      window.removeEventListener("request-submitted", handleRequestSubmitted);
      window.removeEventListener("meeting-scheduled", handleMeetingScheduled);
      window.removeEventListener("meeting-logged", handleMeetingLogged);
    };
  }, []);

  const syncWorkflowMetrics = useCallback(async () => {
    setIsSyncingMetrics(true);
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsCount: followUpCalls,
          leadsCount: leadsToday,
          coldCallsCount: coldCalls,
          meetingsCount: meetingsScheduled,
          meetingsCompletedCount: meetingsCompleted,
          requestsCount: newRequests,
          orientation,
          mood,
          notes: notes.trim().length > 0 ? notes : null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedAt = result.data?.updated_at as string | undefined;
        setLastSaved(updatedAt ? new Date(updatedAt) : new Date());
      } else {
        const error = await response.json().catch(() => ({}));
        console.error("Failed to sync workflow metrics:", error);
      }
    } catch (error) {
      console.error("Failed to sync workflow metrics:", error);
    } finally {
      setIsSyncingMetrics(false);
    }
  }, [coldCalls, followUpCalls, leadsToday, meetingsCompleted, meetingsScheduled, mood, newRequests, notes, orientation]);

  // Debounced persistence for workflow changes
  useEffect(() => {
    if (!isInitialized) return;

    if (initialSyncSkipRef.current) {
      initialSyncSkipRef.current = false;
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      void syncWorkflowMetrics();
    }, 600);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    isInitialized,
    coldCalls,
    followUpCalls,
    leadsToday,
    meetingsCompleted,
    meetingsScheduled,
    mood,
    newRequests,
    notes,
    orientation,
    syncWorkflowMetrics,
  ]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const broadcastWorkflowUpdate = useCallback(() => {
    const detail = {
      isCheckedIn,
      checkInTime,
      checkOutTime,
      orientation,
      followUpCalls,
      leadsToday,
      coldCalls,
      newRequests,
      meetingsScheduled,
      meetingsCompleted,
      mood,
    };

    window.dispatchEvent(new CustomEvent("workflow-stats-updated", { detail }));
  }, [
    checkInTime,
    checkOutTime,
    coldCalls,
    followUpCalls,
    isCheckedIn,
    leadsToday,
    meetingsCompleted,
    meetingsScheduled,
    mood,
    newRequests,
    orientation,
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    broadcastWorkflowUpdate();
  }, [broadcastWorkflowUpdate, isInitialized]);

  const handleCheckIn = useCallback(async () => {
    if (attendanceActionLoading || isCheckedIn) return;
    setAttendanceActionLoading(true);
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const result = await response.json();
        const attendance = result.data as
          | {
              check_in_time?: string | null;
              location_check_in?: string | null;
            }
          | undefined;
        setIsCheckedIn(true);
        setCheckInTime(attendance?.check_in_time ?? new Date().toISOString());
        setLocation(attendance?.location_check_in ?? location);
      } else {
        const error = await response.json().catch(() => ({}));
        console.error("Failed to check in:", error);
      }
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setAttendanceActionLoading(false);
    }
  }, [attendanceActionLoading, isCheckedIn, location]);

  const handleCheckOut = useCallback(async () => {
    if (attendanceActionLoading || !isCheckedIn || checkOutTime) return;
    setAttendanceActionLoading(true);
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const result = await response.json();
        const attendance = result.data as
          | {
              check_out_time?: string | null;
              location_check_out?: string | null;
            }
          | undefined;
        setCheckOutTime(attendance?.check_out_time ?? new Date().toISOString());
        if (attendance?.location_check_out) {
          setLocation(attendance.location_check_out);
        }
      } else {
        const error = await response.json().catch(() => ({}));
        console.error("Failed to check out:", error);
      }
    } catch (error) {
      console.error("Failed to check out:", error);
    } finally {
      setAttendanceActionLoading(false);
    }
  }, [attendanceActionLoading, checkOutTime, isCheckedIn, location]);

  useEffect(() => {
    const handleQuickCheckIn = () => {
      if (!isCheckedIn) {
        void handleCheckIn();
      }
    };

    window.addEventListener("quick-check-in", handleQuickCheckIn);
    return () => {
      window.removeEventListener("quick-check-in", handleQuickCheckIn);
    };
  }, [handleCheckIn, isCheckedIn]);

  const moodOptions = [
    { emoji: "😄", label: "Great", value: "great" },
    { emoji: "😊", label: "Good", value: "good" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "😰", label: "Stressed", value: "stressed" },
    { emoji: "😞", label: "Difficult", value: "difficult" },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-md">
      {/* Header */}
      <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Workflow</h2>
              <p className="text-xs text-blue-100">Follow your routine step by step</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSyncingMetrics ? (
              <div className="flex items-center gap-1.5 text-blue-100 text-xs mr-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              lastSaved && (
              <div className="flex items-center gap-1.5 text-blue-100 text-xs mr-2">
                <Save className="h-3 w-3" />
                <span suppressHydrationWarning>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
              )
            )}
            <Badge className="bg-white/20 text-white border-white/30" suppressHydrationWarning>
              {isCheckedIn ? "In Progress" : "Not Started"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6" suppressHydrationWarning>
        {/* Step 1: Check In */}
        <WorkflowSection
          title="1. Check In"
          icon={LogIn}
          completed={isCheckedIn}
          active={!isCheckedIn}
        >
          {!isCheckedIn ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                <div className="flex gap-2">
                  <Button
                    variant={location === "Office" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation("Office")}
                    className="flex-1"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Office
                  </Button>
                  <Button
                    variant={location === "Field" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation("Field")}
                    className="flex-1"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Field
                  </Button>
                  <Button
                    variant={location === "Home" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation("Home")}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>
              <Button onClick={handleCheckIn} className="w-full bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-4 w-4 mr-2" />
                {attendanceActionLoading ? "Checking In..." : "Check In Now"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Checked in at {formatTime(checkInTime)}</span>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">{location}</Badge>
            </div>
          )}
        </WorkflowSection>

        {isCheckedIn && (
          <>
            <Separator />

            {/* Step 2: Morning Knowledge */}
            <WorkflowSection
              title="2. Morning Knowledge"
              icon={BookOpen}
              completed={orientation !== null}
              active={orientation === null}
            >
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Select today's orientation type</p>
                <div className="flex gap-2">
                  <Button
                    variant={orientation === "team" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrientation("team")}
                    className="flex-1"
                  >
                    Team Orientation
                  </Button>
                  <Button
                    variant={orientation === "developer" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrientation("developer")}
                    className="flex-1"
                  >
                    Developer Orientation
                  </Button>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 3: Follow-up Calls */}
            <WorkflowSection
              title="3. Follow-up Calls"
              icon={Phone}
              completed={followUpCalls > 0}
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Calls made to recent clients</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={followUpCalls}
                    onChange={(e) => setFollowUpCalls(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-lg font-bold"
                    min="0"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setFollowUpCalls((prev) => prev + 1)}>
                      <Plus className="h-3 w-3 mr-1" />
                      +1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFollowUpCalls((prev) => prev + 5)}>
                      <Plus className="h-3 w-3 mr-1" />
                      +5
                    </Button>
                  </div>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 4: Leads Taken Today */}
            <WorkflowSection
              title="4. Leads Taken Today"
              icon={Users}
              completed={leadsToday > 0}
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Number of leads taken today</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={leadsToday}
                    onChange={(e) => setLeadsToday(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-lg font-bold"
                    min="0"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setLeadsToday((prev) => prev + 1)}>
                      +1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setLeadsToday((prev) => prev + 5)}>
                      +5
                    </Button>
                  </div>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 5: Active Cold Calls */}
            <WorkflowSection
              title="5. Active Cold Calls"
              icon={PhoneCall}
              completed={coldCalls > 0}
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Cold calls made today</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={coldCalls}
                    onChange={(e) => setColdCalls(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-lg font-bold"
                    min="0"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setColdCalls((prev) => prev + 1)}>
                      +1
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setColdCalls((prev) => prev + 10)}>
                      +10
                    </Button>
                  </div>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 6: Client Requests */}
            <WorkflowSection
              title="6. Client Requests"
              icon={FileText}
              completed={newRequests > 0}
            >
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Add client requests for team leader review to help you close deals
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Requests added today:</span>
                  <Badge variant="secondary">{newRequests}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // This opens a modal with ClientRequestForm
                    const event = new CustomEvent("open-request-modal");
                    window.dispatchEvent(event);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client Request Details
                </Button>
                <p className="text-[10px] text-muted-foreground italic">
                  Include: Client name, phone, destination, budget, project needed, notes
                </p>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 7: Scheduled Meetings */}
            <WorkflowSection
              title="7. Scheduled Meetings"
              icon={Calendar}
              completed={meetingsScheduled > 0}
            >
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Schedule meetings to receive system reminders and notifications
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Meetings scheduled today:</span>
                  <Badge variant="secondary">{meetingsScheduled}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // This opens a modal with MeetingScheduler
                    const event = new CustomEvent("open-meeting-modal");
                    window.dispatchEvent(event);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting (Date & Time)
                </Button>
                <p className="text-[10px] text-muted-foreground italic">
                  Include: Meeting title, date, time, duration, location, description
                </p>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 8: Completed Meetings */}
            <WorkflowSection
              title="8. Meetings Done Today"
              icon={CheckCircle2}
              completed={meetingsCompleted > 0}
            >
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Log meetings completed today with full details
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Meetings logged today:</span>
                  <Badge variant="secondary">{meetingsCompleted}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // This opens a modal to log completed meeting
                    const event = new CustomEvent("open-meeting-log-modal");
                    window.dispatchEvent(event);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Meeting Details
                </Button>
                <p className="text-[10px] text-muted-foreground italic">
                  Required: Developer name, Project name, Destination<br />
                  Optional: Meeting outcome, Notes
                </p>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 9: Notes & Mood */}
            <WorkflowSection
              title="9. Notes & Mood"
              icon={FileText}
              completed={mood !== null}
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Today's Mood</label>
                  <div className="flex gap-2">
                    {moodOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={mood === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMood(option.value)}
                        className="flex-1 flex-col h-auto py-2"
                      >
                        <span className="text-lg mb-1">{option.emoji}</span>
                        <span className="text-[10px]">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                    placeholder="Add any notes about your day..."
                  />
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 10: Check Out */}
            <WorkflowSection
              title="10. Check Out"
              icon={LogOut}
              completed={checkOutTime !== null}
              active={checkOutTime === null}
            >
              {!checkOutTime ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Complete your day and submit all activities
                  </p>
                  <Button
                    onClick={handleCheckOut}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!mood || attendanceActionLoading}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {attendanceActionLoading ? "Checking Out..." : "Check Out & Submit"}
                  </Button>
                  {!mood && (
                    <p className="text-xs text-amber-600">Please select your mood before checking out</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Checked out at {formatTime(checkOutTime)}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Complete</Badge>
                </div>
              )}
            </WorkflowSection>
          </>
        )}
      </div>

      {/* Summary Footer */}
      {isCheckedIn && (
        <div className="px-6 py-4 bg-muted/20 border-t border-border/40">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Follow-ups</p>
              <p className="text-lg font-bold">{followUpCalls}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="text-lg font-bold">{leadsToday}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cold Calls</p>
              <p className="text-lg font-bold">{coldCalls}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function WorkflowSection({
  title,
  icon: Icon,
  children,
  completed = false,
  active = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  completed?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative pl-6 border-l-2 transition-all duration-300",
        completed ? "border-green-500" : active ? "border-blue-500" : "border-border"
      )}
    >
      <div
        className={cn(
          "absolute -left-3 top-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
          completed
            ? "bg-green-500 text-white shadow-sm"
            : active
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-muted text-muted-foreground"
        )}
      >
        {completed ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      </div>
      <div className="pb-4">
        <h3 className={cn("text-sm font-semibold mb-3", completed ? "text-green-700" : active ? "text-blue-700" : "text-foreground")}>
          {title}
        </h3>
        <div className={cn(!active && !completed && "opacity-50")}>{children}</div>
      </div>
    </div>
  );
}

