"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  Plus,
  Check,
  Save,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowData = {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  orientation: "team" | "developer" | null;
  followUpCalls: number;
  leadsToday: number;
  coldCalls: number;
  newRequests: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  mood: string | null;
  notes: string;
  location: string;
  isCheckedIn: boolean;
};

const STORAGE_KEY = "brokmang_daily_workflow";

export function DailyWorkflow({ userId }: { userId: string }) {
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"team" | "developer" | null>(null);
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
  const [isMounted, setIsMounted] = useState(false);

  // Get today's date + user ID as a unique key
  const getTodayKey = () => {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `${date}_${userId}`; // YYYY-MM-DD_user-id
  };

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Load workflow data from localStorage on mount
  useEffect(() => {
    if (!isMounted) return;
    
    const todayKey = getTodayKey();
    const stored = localStorage.getItem(`${STORAGE_KEY}_${todayKey}`);
    if (stored) {
      try {
        const data: WorkflowData = JSON.parse(stored);
        setCheckInTime(data.checkInTime);
        setCheckOutTime(data.checkOutTime);
        setOrientation(data.orientation);
        setFollowUpCalls(data.followUpCalls);
        setLeadsToday(data.leadsToday);
        setColdCalls(data.coldCalls);
        setNewRequests(data.newRequests);
        setMeetingsScheduled(data.meetingsScheduled);
        setMeetingsCompleted(data.meetingsCompleted);
        setMood(data.mood);
        setNotes(data.notes);
        setLocation(data.location);
        setIsCheckedIn(data.isCheckedIn);
        setLastSaved(new Date(data.date));
      } catch (error) {
        console.error("Failed to load workflow data:", error);
      }
    }
  }, [isMounted]);

  // Auto-save workflow data whenever it changes (client-side only)
  useEffect(() => {
    if (!isMounted) return;
    
    const todayKey = getTodayKey();
    const workflowData: WorkflowData = {
      date: new Date().toISOString(),
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
      notes,
      location,
      isCheckedIn,
    };
    
    localStorage.setItem(`${STORAGE_KEY}_${todayKey}`, JSON.stringify(workflowData));
    setLastSaved(new Date());
  }, [
    isMounted,
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
    notes,
    location,
    isCheckedIn,
  ]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString());
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    setCheckOutTime(now.toLocaleTimeString());
    // Submit all data here
  };

  const moodOptions = [
    { emoji: "😄", label: "Great", value: "great" },
    { emoji: "😊", label: "Good", value: "good" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "😰", label: "Stressed", value: "stressed" },
    { emoji: "😞", label: "Difficult", value: "difficult" },
  ];

  // Expose workflow data to parent via custom events
  useEffect(() => {
    if (!isMounted) return;
    
    const workflowStats = {
      followUpCalls,
      leadsToday,
      coldCalls,
      newRequests,
      meetingsScheduled,
      meetingsCompleted,
    };
    
    window.dispatchEvent(new CustomEvent("workflow-stats-updated", { detail: workflowStats }));
  }, [isMounted, followUpCalls, leadsToday, coldCalls, newRequests, meetingsScheduled, meetingsCompleted]);

  if (!isMounted) {
    return (
      <Card className="overflow-hidden rounded-2xl border-border/40 shadow-md">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Workflow</h2>
              <p className="text-xs text-blue-100">Loading...</p>
            </div>
          </div>
        </div>
        <div className="p-6"><div className="h-64 animate-pulse bg-muted/20 rounded-lg" /></div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-md">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
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
            {lastSaved && (
              <div className="flex items-center gap-1.5 text-blue-100 text-xs mr-2">
                <Save className="h-3 w-3" />
                <span suppressHydrationWarning>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            <Badge className="bg-white/20 text-white border-white/30" suppressHydrationWarning>
              {isCheckedIn ? "In Progress" : "Not Started"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
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
                Check In Now
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Checked in at {checkInTime}</span>
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
                    disabled={!mood}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out & Submit
                  </Button>
                  {!mood && (
                    <p className="text-xs text-amber-600">Please select your mood before checking out</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Checked out at {checkOutTime}</span>
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

