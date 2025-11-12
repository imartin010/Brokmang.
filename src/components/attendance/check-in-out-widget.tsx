"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

type AttendanceStatus = {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  locationCheckIn?: string | null;
  locationCheckOut?: string | null;
};

export function CheckInOutWidget() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [location, setLocation] = useState("");
  const { notify } = useNotification();

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch("/api/attendance/today");
      if (response.ok) {
        const result = (await response.json()) as {
          data?: {
            check_in_time?: string | null;
            check_out_time?: string | null;
            location_check_in?: string | null;
            location_check_out?: string | null;
          } | null;
          isCheckedIn?: boolean;
          isCheckedOut?: boolean;
        };
        const attendanceData = result.data;
        const hasCheckIn = attendanceData?.check_in_time != null;
        const hasCheckOut = attendanceData?.check_out_time != null;
        setStatus({
          isCheckedIn: result.isCheckedIn ?? hasCheckIn,
          isCheckedOut: result.isCheckedOut ?? hasCheckOut,
          checkInTime: attendanceData?.check_in_time ?? undefined,
          checkOutTime: attendanceData?.check_out_time ?? undefined,
          locationCheckIn: attendanceData?.location_check_in ?? undefined,
          locationCheckOut: attendanceData?.location_check_out ?? undefined,
        });
      }
    } catch (error) {
      console.error("Failed to fetch attendance status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location || undefined,
        }),
      });

      if (response.ok) {
        await fetchAttendanceStatus();
        setLocation("");
        notify({ variant: "success", title: "Checked in", message: "You are now checked in." });
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Unable to check in",
          message: error.error || "Failed to check in.",
        });
      }
    } catch (error) {
      console.error("Failed to check in:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to check in." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location || undefined,
        }),
      });

      if (response.ok) {
        await fetchAttendanceStatus();
        setLocation("");
        notify({ variant: "success", title: "Checked out", message: "You have checked out for today." });
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Unable to check out",
          message: error.error || "Failed to check out.",
        });
      }
    } catch (error) {
      console.error("Failed to check out:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to check out." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  const isCheckedIn = status?.isCheckedIn ?? false;
  const isCheckedOut = status?.isCheckedOut ?? false;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Attendance</h3>
          <p className="text-sm text-muted-foreground">Check in/out for today</p>
        </div>
        {isCheckedIn && (
          <div className={`flex items-center gap-2 ${isCheckedOut ? "text-green-600" : "text-primary"}`}>
            {isCheckedOut ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            <span className="text-sm font-medium">
              {isCheckedOut ? "Checked Out" : "Checked In"}
            </span>
          </div>
        )}
      </div>

      {isCheckedIn && status && (
        <div className="space-y-2 text-sm">
          {status.checkInTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Check-in:</span>
              <span>{new Date(status.checkInTime).toLocaleTimeString()}</span>
              {status.locationCheckIn && (
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground ml-2" />
                  <span className="text-muted-foreground">{status.locationCheckIn}</span>
                </>
              )}
            </div>
          )}
          {status.checkOutTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Check-out:</span>
              <span>{new Date(status.checkOutTime).toLocaleTimeString()}</span>
              {status.locationCheckOut && (
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground ml-2" />
                  <span className="text-muted-foreground">{status.locationCheckOut}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!isCheckedOut && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Office, Remote, Client Site"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              disabled={actionLoading}
            />
          </div>
          {!isCheckedIn ? (
            <Button onClick={handleCheckIn} disabled={actionLoading} className="w-full">
              Check In
            </Button>
          ) : (
            <Button onClick={handleCheckOut} disabled={actionLoading} variant="outline" className="w-full">
              Check Out
            </Button>
          )}
        </div>
      )}

      {isCheckedOut && (
        <div className="text-center text-sm text-muted-foreground py-2">
          You've completed your attendance for today.
        </div>
      )}
    </Card>
  );
}

