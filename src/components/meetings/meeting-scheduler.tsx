"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

export function MeetingScheduler({ onSuccess, isCompletedLog = false }: { onSuccess?: () => void; isCompletedLog?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingDate: "",
    meetingTime: "",
    durationMinutes: "60",
    location: "",
  });
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          meetingDate: formData.meetingDate,
          meetingTime: formData.meetingTime,
          durationMinutes: parseInt(formData.durationMinutes),
          location: formData.location || undefined,
        }),
      });

      if (response.ok) {
        notify({
          variant: "success",
          title: isCompletedLog ? "Meeting logged" : "Meeting scheduled",
          message: isCompletedLog
            ? "Meeting details logged successfully."
            : "Meeting scheduled successfully. We'll remind you before it starts.",
        });
        setFormData({
          title: "",
          description: "",
          meetingDate: "",
          meetingTime: "",
          durationMinutes: "60",
          location: "",
        });
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Unable to schedule meeting",
          message: error.error || "Failed to schedule meeting.",
        });
      }
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to schedule meeting." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Schedule Meeting</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Schedule a meeting with a client or prospect.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Meeting Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="e.g., Property viewing - New Cairo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Date *</label>
            <input
              type="date"
              value={formData.meetingDate}
              onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Time *</label>
            <input
              type="time"
              value={formData.meetingTime}
              onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
            <select
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="e.g., Office, Client Site, Remote"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Meeting agenda or notes..."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Scheduling..." : "Schedule Meeting"}
        </Button>
      </form>
    </Card>
  );
}

