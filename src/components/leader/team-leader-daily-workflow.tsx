"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApprovedCasesSelector } from "./approved-cases-selector";
import {
  LogIn,
  LogOut,
  BookOpen,
  Users,
  UserPlus,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  Building,
  Home,
  Check,
  Save,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowData = {
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  orientation: "team" | "assessment" | null;
  agentCasesReviewed: number;
  leadsAssigned: number;
  leadsRotated: number;
  clientMeetings: number;
  oneOnOneMeetings: number;
  notes: string;
  location: string;
  isCheckedIn: boolean;
};

const STORAGE_KEY = "brokmang_leader_daily_workflow";

export function TeamLeaderDailyWorkflow({ userId }: { userId: string }) {
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"team" | "assessment" | null>(null);
  const [agentCasesReviewed, setAgentCasesReviewed] = useState(0);
  const [leadsAssigned, setLeadsAssigned] = useState(0);
  const [leadsRotated, setLeadsRotated] = useState(0);
  const [clientMeetings, setClientMeetings] = useState(0);
  const [oneOnOneMeetings, setOneOnOneMeetings] = useState(0);
  const [notes, setNotes] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [location, setLocation] = useState("Office");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const getTodayKey = () => {
    const date = new Date().toISOString().split("T")[0];
    return `${date}_${userId}`; // Make it user-specific!
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load from localStorage
  useEffect(() => {
    if (!isMounted) return;
    const stored = localStorage.getItem(`${STORAGE_KEY}_${getTodayKey()}`);
    if (stored) {
      try {
        const data: WorkflowData = JSON.parse(stored);
        setCheckInTime(data.checkInTime);
        setCheckOutTime(data.checkOutTime);
        setOrientation(data.orientation);
        setAgentCasesReviewed(data.agentCasesReviewed);
        setLeadsAssigned(data.leadsAssigned);
        setLeadsRotated(data.leadsRotated);
        setClientMeetings(data.clientMeetings);
        setOneOnOneMeetings(data.oneOnOneMeetings);
        setNotes(data.notes);
        setLocation(data.location);
        setIsCheckedIn(data.isCheckedIn);
        setLastSaved(new Date(data.date));
      } catch (error) {
        console.error("Failed to load workflow:", error);
      }
    }
  }, [isMounted]);

  // Auto-save
  useEffect(() => {
    if (!isMounted) return;
    const workflowData: WorkflowData = {
      date: new Date().toISOString(),
      checkInTime,
      checkOutTime,
      orientation,
      agentCasesReviewed,
      leadsAssigned,
      leadsRotated,
      clientMeetings,
      oneOnOneMeetings,
      notes,
      location,
      isCheckedIn,
    };
    localStorage.setItem(`${STORAGE_KEY}_${getTodayKey()}`, JSON.stringify(workflowData));
    setLastSaved(new Date());

    // Emit stats for KPI cards and sidebar
    const workflowStats = {
      agentCasesReviewed,
      leadsAssigned,
      leadsRotated,
      clientMeetings,
      oneOnOneMeetings,
      isCheckedIn,
      checkOutTime,
    };
    window.dispatchEvent(new CustomEvent("workflow-stats-updated", { detail: workflowStats }));
  }, [isMounted, checkInTime, checkOutTime, orientation, agentCasesReviewed, leadsAssigned, leadsRotated, clientMeetings, oneOnOneMeetings, notes, location, isCheckedIn]);

  const handleCheckIn = () => {
    setCheckInTime(new Date().toLocaleTimeString());
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    setCheckOutTime(new Date().toLocaleTimeString());
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-md">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Team Leader Daily Routine</h2>
              <p className="text-xs text-purple-100">Guide and support your team</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div className="flex items-center gap-1.5 text-purple-100 text-xs mr-2">
                <Save className="h-3 w-3" />
                <span suppressHydrationWarning>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            <Badge className="bg-white/20 text-white border-white/30" suppressHydrationWarning>
              {isCheckedIn ? "Active" : "Not Started"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6" suppressHydrationWarning>
        {/* Step 1: Check In */}
        <WorkflowSection title="1. Check In" icon={LogIn} completed={isCheckedIn} active={!isCheckedIn}>
          {!isCheckedIn ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                <div className="flex gap-2">
                  <Button variant={location === "Office" ? "default" : "outline"} size="sm" onClick={() => setLocation("Office")} className="flex-1">
                    <Building className="h-4 w-4 mr-2" />
                    Office
                  </Button>
                  <Button variant={location === "Field" ? "default" : "outline"} size="sm" onClick={() => setLocation("Field")} className="flex-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    Field
                  </Button>
                  <Button variant={location === "Home" ? "default" : "outline"} size="sm" onClick={() => setLocation("Home")} className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>
              <Button onClick={handleCheckIn} className="w-full bg-purple-600 hover:bg-purple-700">
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

            {/* Step 2: Team Orientation/Assessment */}
            <WorkflowSection title="2. Team Orientation/Assessment" icon={BookOpen} completed={orientation !== null}>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Today's team session type</p>
                <div className="flex gap-2">
                  <Button variant={orientation === "team" ? "default" : "outline"} size="sm" onClick={() => setOrientation("team")} className="flex-1">
                    Team Orientation
                  </Button>
                  <Button variant={orientation === "assessment" ? "default" : "outline"} size="sm" onClick={() => setOrientation("assessment")} className="flex-1">
                    Performance Assessment
                  </Button>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 3: Follow Up with Agent Cases */}
            <WorkflowSection title="3. Follow Up with Agent Cases" icon={Users} completed={agentCasesReviewed > 0}>
              <ApprovedCasesSelector
                onCaseSelected={(caseId) => setAgentCasesReviewed((prev) => prev + 1)}
                selectedCount={agentCasesReviewed}
              />
            </WorkflowSection>

            <Separator />

            {/* Step 4: Assign/Rotate Leads */}
            <WorkflowSection title="4. Assign New Leads / Rotate Leads" icon={UserPlus} completed={leadsAssigned > 0 || leadsRotated > 0}>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">New leads assigned to agents</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={leadsAssigned}
                      onChange={(e) => setLeadsAssigned(parseInt(e.target.value) || 0)}
                      className="w-20 text-center font-bold"
                      min="0"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setLeadsAssigned((prev) => prev + 1)}>+1</Button>
                      <Button size="sm" variant="outline" onClick={() => setLeadsAssigned((prev) => prev + 5)}>+5</Button>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Leads rotated between agents</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={leadsRotated}
                      onChange={(e) => setLeadsRotated(parseInt(e.target.value) || 0)}
                      className="w-20 text-center font-bold"
                      min="0"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setLeadsRotated((prev) => prev + 1)}>+1</Button>
                      <Button size="sm" variant="outline" onClick={() => setLeadsRotated((prev) => prev + 3)}>+3</Button>
                    </div>
                  </div>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 5: Meetings with Agent Clients */}
            <WorkflowSection title="5. Meetings with Agent Clients" icon={Calendar} completed={clientMeetings > 0}>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Client meetings attended today</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={clientMeetings}
                    onChange={(e) => setClientMeetings(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-lg font-bold"
                    min="0"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setClientMeetings((prev) => prev + 1)}>+1</Button>
                    <Button size="sm" variant="outline" onClick={() => setClientMeetings((prev) => prev + 3)}>+3</Button>
                  </div>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 6: One-to-One Meetings */}
            <WorkflowSection title="6. One-to-One Meetings with Agents" icon={MessageSquare} completed={oneOnOneMeetings > 0}>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Individual coaching sessions today</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={oneOnOneMeetings}
                    onChange={(e) => setOneOnOneMeetings(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-lg font-bold"
                    min="0"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setOneOnOneMeetings((prev) => prev + 1)}>+1</Button>
                    <Button size="sm" variant="outline" onClick={() => setOneOnOneMeetings((prev) => prev + 5)}>+5</Button>
                  </div>
                </div>
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 7: Notes */}
            <WorkflowSection title="7. Daily Notes" icon={BookOpen} completed={notes.length > 0}>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  placeholder="Key decisions, observations, action items..."
                />
              </div>
            </WorkflowSection>

            <Separator />

            {/* Step 8: Check Out */}
            <WorkflowSection title="8. Check Out" icon={LogOut} completed={checkOutTime !== null} active={checkOutTime === null}>
              {!checkOutTime ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Complete your day and submit all activities</p>
                  <Button onClick={handleCheckOut} className="w-full bg-purple-600 hover:bg-purple-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out & Submit
                  </Button>
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
              <p className="text-xs text-muted-foreground">Cases Reviewed</p>
              <p className="text-lg font-bold">{agentCasesReviewed}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leads Assigned</p>
              <p className="text-lg font-bold">{leadsAssigned + leadsRotated}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meetings</p>
              <p className="text-lg font-bold">{clientMeetings + oneOnOneMeetings}</p>
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
        completed ? "border-green-500" : active ? "border-purple-500" : "border-border"
      )}
    >
      <div
        className={cn(
          "absolute -left-3 top-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
          completed ? "bg-green-500 text-white shadow-sm" : active ? "bg-purple-500 text-white shadow-sm" : "bg-muted text-muted-foreground"
        )}
      >
        {completed ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      </div>
      <div className="pb-4">
        <h3 className={cn("text-sm font-semibold mb-3", completed ? "text-green-700" : active ? "text-purple-700" : "text-foreground")}>
          {title}
        </h3>
        <div className={cn(!active && !completed && "opacity-50")}>{children}</div>
      </div>
    </div>
  );
}

