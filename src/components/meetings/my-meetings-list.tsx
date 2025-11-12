"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Inbox } from "lucide-react";

type Meeting = {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location: string | null;
  status: string;
  created_at: string;
};

export function MyMeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings");
      if (response.ok) {
        const data = await response.json();
        // Filter to only show scheduled meetings (not completed/cancelled)
        const scheduledMeetings = (data.data || []).filter(
          (m: Meeting) => m.status === "scheduled"
        );
        setMeetings(scheduledMeetings);
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-3 rounded-xl border border-border/40 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <Inbox className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium">No upcoming meetings</p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Schedule meetings to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {meetings.map((meeting) => {
        const meetingDateTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`);
        const isToday = new Date().toDateString() === meetingDateTime.toDateString();
        const isTomorrow = new Date(Date.now() + 86400000).toDateString() === meetingDateTime.toDateString();

        return (
          <div
            key={meeting.id}
            className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all duration-200 bg-white"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold flex-1">{meeting.title}</h4>
              {isToday && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Today</Badge>
              )}
              {isTomorrow && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">Tomorrow</Badge>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>
                  {meetingDateTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>
                  {meetingDateTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  ({meeting.duration_minutes} min)
                </span>
              </div>
              {meeting.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>{meeting.location}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

