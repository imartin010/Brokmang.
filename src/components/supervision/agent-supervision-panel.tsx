"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Users } from "lucide-react";

type Agent = {
  id: string;
  full_name: string;
  email: string;
  under_supervision: boolean;
  supervised_by?: string;
  supervision_started_at?: string;
};

export function AgentSupervisionPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamAgents();
  }, []);

  const fetchTeamAgents = async () => {
    try {
      // Fetch team members directly using a server endpoint
      // For now, we'll use a workaround by fetching from team_member_performance view
      const response = await fetch("/api/supervision/team-members");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.data || []);
      } else {
        console.error("Failed to fetch team members, trying alternative method...");
        // Alternative: Try to get team info and members separately
        const teamResponse = await fetch("/api/teams?myTeam=true");
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          console.log("Team data:", teamData);
          
          // For now, show a placeholder message
          if (teamData.data) {
            console.log("Team found but members endpoint needs fixing");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch team agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSupervision = async (agentId: string, enable: boolean) => {
    setProcessingId(agentId);
    try {
      if (enable) {
        const response = await fetch("/api/supervision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId }),
        });

        const data = await response.json();
        
        if (response.ok) {
          await fetchTeamAgents();
          alert("Agent supervision enabled successfully!");
        } else {
          console.error("Supervision error:", data);
          alert(data.error || "Failed to enable supervision");
        }
      } else {
        const response = await fetch(`/api/supervision?agentId=${agentId}`, {
          method: "DELETE",
        });

        const data = await response.json();
        
        if (response.ok) {
          await fetchTeamAgents();
          alert("Agent supervision disabled successfully!");
        } else {
          console.error("Supervision error:", data);
          alert(data.error || "Failed to disable supervision");
        }
      }
    } catch (error) {
      console.error("Failed to toggle supervision:", error);
      alert("Network error: Failed to update supervision");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Agent Supervision</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No agents in your team yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Agent Supervision</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Enable supervision mode to closely monitor specific agents' activities and performance.
      </p>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{agent.full_name}</p>
                {agent.under_supervision && (
                  <Badge variant="default" className="text-xs">
                    Under Supervision
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{agent.email}</p>
              {agent.under_supervision && agent.supervision_started_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Started: {new Date(agent.supervision_started_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant={agent.under_supervision ? "destructive" : "default"}
              onClick={() => toggleSupervision(agent.id, !agent.under_supervision)}
              disabled={processingId === agent.id}
            >
              {agent.under_supervision ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

