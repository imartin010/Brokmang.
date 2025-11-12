"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Users } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

type Agent = {
  id: string;
  full_name: string;
  email: string;
};

export function DailyRatingForm() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    appearanceScore: 5,
    professionalismScore: 5,
    honestyScore: 5,
    kindnessScore: 5,
    leadsReceived: 0,
    dealsClosed: 0,
    comments: "",
  });
  const { notify } = useNotification();

  useEffect(() => {
    fetchTeamAgents();
  }, []);

  const fetchTeamAgents = async () => {
    try {
      // Get team members - simplified approach
      const response = await fetch("/api/teams?myTeam=true");
      if (response.ok) {
        const teamData = await response.json();
        if (teamData.data?.id) {
          const membersResponse = await fetch(`/api/teams/${teamData.data.id}/members`);
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            const agentList = membersData.data?.map((m: any) => ({
              id: m.user_id || m.profiles?.id,
              full_name: m.profiles?.full_name || "Agent",
              email: m.profiles?.email || "",
            })) || [];
            setAgents(agentList);
            if (agentList.length > 0 && !selectedAgentId) {
              setSelectedAgentId(agentList[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch team agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      notify({ variant: "warning", message: "Please select an agent to rate." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          appearanceScore: formData.appearanceScore,
          professionalismScore: formData.professionalismScore,
          honestyScore: formData.honestyScore,
          kindnessScore: formData.kindnessScore,
          leadsReceived: formData.leadsReceived,
          dealsClosed: formData.dealsClosed,
          comments: formData.comments || undefined,
        }),
      });

      if (response.ok) {
        notify({ variant: "success", title: "Rating submitted", message: "Daily rating saved successfully." });
        setFormData({
          appearanceScore: 5,
          professionalismScore: 5,
          honestyScore: 5,
          kindnessScore: 5,
          leadsReceived: 0,
          dealsClosed: 0,
          comments: "",
        });
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Unable to submit rating",
          message: error.error || "Failed to submit rating.",
        });
      }
    } catch (error) {
      console.error("Failed to submit rating:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to submit rating." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Daily Agent Rating</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No agents in your team yet.</p>
        </div>
      </Card>
    );
  }

  const averageScore =
    (formData.appearanceScore +
      formData.professionalismScore +
      formData.honestyScore +
      formData.kindnessScore) /
    4;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Daily Agent Rating</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Agent *</label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <ScoreSlider
            label="Appearance"
            value={formData.appearanceScore}
            onChange={(value) => setFormData({ ...formData, appearanceScore: value })}
          />
          <ScoreSlider
            label="Professionalism"
            value={formData.professionalismScore}
            onChange={(value) => setFormData({ ...formData, professionalismScore: value })}
          />
          <ScoreSlider
            label="Honesty"
            value={formData.honestyScore}
            onChange={(value) => setFormData({ ...formData, honestyScore: value })}
          />
          <ScoreSlider
            label="Kindness"
            value={formData.kindnessScore}
            onChange={(value) => setFormData({ ...formData, kindnessScore: value })}
          />
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Score</span>
            <span className="text-2xl font-bold">{averageScore.toFixed(1)}/10</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Leads Received</label>
            <input
              type="number"
              value={formData.leadsReceived}
              onChange={(e) => setFormData({ ...formData, leadsReceived: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Deals Closed</label>
            <input
              type="number"
              value={formData.dealsClosed}
              onChange={(e) => setFormData({ ...formData, dealsClosed: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Comments (optional)</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Additional feedback or observations..."
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Submitting..." : "Submit Rating"}
        </Button>
      </form>
    </Card>
  );
}

type ScoreSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

const ScoreSlider = ({ label, value, onChange }: ScoreSliderProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm font-semibold">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

