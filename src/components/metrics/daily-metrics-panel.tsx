"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Calendar, FileText, Target, Phone, TrendingUp, Smile } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

type Mood = "great" | "good" | "okay" | "stressed" | "difficult";

type DailyMetrics = {
  active_calls_count: number;
  meetings_scheduled: number;
  requests_generated: number;
  deals_closed: number;
  mood: Mood | null;
  notes: string | null;
};

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "😊" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "stressed", label: "Stressed", emoji: "😰" },
  { value: "difficult", label: "Difficult", emoji: "😞" },
];

export function DailyMetricsPanel() {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localMetrics, setLocalMetrics] = useState({
    calls: 0,
    meetings: 0,
    requests: 0,
    deals: 0,
    mood: null as Mood | null,
    notes: "",
  });
  const { notify } = useNotification();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/metrics");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setMetrics(data.data);
          setLocalMetrics({
            calls: data.data.active_calls_count || 0,
            meetings: data.data.meetings_scheduled || 0,
            requests: data.data.requests_generated || 0,
            deals: data.data.deals_closed || 0,
            mood: data.data.mood || null,
            notes: data.data.notes || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementCounter = async (field: "calls" | "meetings" | "requests" | "deals") => {
    setSaving(true);
    try {
      const response = await fetch("/api/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsCount: field === "calls" ? 1 : 0,
          meetingsCount: field === "meetings" ? 1 : 0,
          requestsCount: field === "requests" ? 1 : 0,
          dealsCount: field === "deals" ? 1 : 0,
        }),
      });

      if (response.ok) {
        await fetchMetrics();
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Update failed",
          message: error.error || "Failed to update metrics.",
        });
      }
    } catch (error) {
      console.error("Failed to update metrics:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to update metrics." });
    } finally {
      setSaving(false);
    }
  };

  const saveMetrics = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsCount: localMetrics.calls,
          meetingsCount: localMetrics.meetings,
          requestsCount: localMetrics.requests,
          dealsCount: localMetrics.deals,
          mood: localMetrics.mood || undefined,
          notes: localMetrics.notes || undefined,
        }),
      });

      if (response.ok) {
        await fetchMetrics();
        notify({ variant: "success", title: "Metrics saved", message: "Your daily metrics have been updated." });
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Save failed",
          message: error.error || "Failed to save metrics.",
        });
      }
    } catch (error) {
      console.error("Failed to save metrics:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to save metrics." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Daily Metrics</h3>
        <p className="text-sm text-muted-foreground">Track your daily activities</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCounter
          icon={<Briefcase className="h-4 w-4" />}
          label="Calls"
          value={localMetrics.calls}
          onIncrement={() => {
            setLocalMetrics({ ...localMetrics, calls: localMetrics.calls + 1 });
            incrementCounter("calls");
          }}
          disabled={saving}
        />
        <MetricCounter
          icon={<Calendar className="h-4 w-4" />}
          label="Meetings"
          value={localMetrics.meetings}
          onIncrement={() => {
            setLocalMetrics({ ...localMetrics, meetings: localMetrics.meetings + 1 });
            incrementCounter("meetings");
          }}
          disabled={saving}
        />
        <MetricCounter
          icon={<FileText className="h-4 w-4" />}
          label="Requests"
          value={localMetrics.requests}
          onIncrement={() => {
            setLocalMetrics({ ...localMetrics, requests: localMetrics.requests + 1 });
            incrementCounter("requests");
          }}
          disabled={saving}
        />
        <MetricCounter
          icon={<Target className="h-4 w-4" />}
          label="Deals Closed"
          value={localMetrics.deals}
          onIncrement={() => {
            setLocalMetrics({ ...localMetrics, deals: localMetrics.deals + 1 });
            incrementCounter("deals");
          }}
          disabled={saving}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Today's Mood</label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLocalMetrics({ ...localMetrics, mood: option.value })}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                localMetrics.mood === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="block text-xs mt-1">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
        <textarea
          value={localMetrics.notes}
          onChange={(e) => setLocalMetrics({ ...localMetrics, notes: e.target.value })}
          placeholder="Add any notes about your day..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
        />
      </div>

      <Button onClick={saveMetrics} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Metrics"}
      </Button>
    </Card>
  );
}

type MetricCounterProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  onIncrement: () => void;
  disabled: boolean;
};

const MetricCounter = ({ icon, label, value, onIncrement, disabled }: MetricCounterProps) => {
  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <Button size="sm" onClick={onIncrement} disabled={disabled} variant="outline">
          +1
        </Button>
      </div>
    </div>
  );
};

