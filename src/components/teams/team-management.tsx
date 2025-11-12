"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, X } from "lucide-react";

type TeamMember = {
  user_id: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
};

type Team = {
  id: string;
  name: string;
  leader_id: string;
};

export function TeamManagement() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");

  useEffect(() => {
    fetchTeamData();
    fetchAvailableAgents();
  }, []);

  const fetchTeamData = async () => {
    try {
      const teamResponse = await fetch("/api/teams?myTeam=true");
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        if (teamData.data) {
          setTeam(teamData.data);
        }
      }
      
      const membersResponse = await fetch("/api/supervision/team-members");
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAgents = async () => {
    // This would need an API endpoint to get all agents in the organization
    // For now, we'll handle it in the add member function
  };

  const handleAddMember = async () => {
    if (!selectedAgentId || !team) {
      alert("Please select an agent");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedAgentId }),
      });

      if (response.ok) {
        await fetchTeamData();
        setShowAddForm(false);
        setSelectedAgentId("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Failed to add member:", error);
      alert("Failed to add member");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team || !confirm("Are you sure you want to remove this member from the team?")) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/members?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTeamData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Failed to remove member");
    } finally {
      setProcessing(false);
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

  if (!team) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Team Management</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>You are not assigned to a team yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Team Management</h3>
          <Badge variant="muted">{members.length} members</Badge>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-border rounded-lg space-y-3">
          <label className="text-sm font-medium">Add Team Member</label>
          <p className="text-xs text-muted-foreground mb-2">
            Enter the email of the agent you want to add to your team.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              placeholder="agent@example.com"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
            />
            <Button
              onClick={handleAddMember}
              disabled={processing || !selectedAgentId}
              size="sm"
            >
              Add
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setSelectedAgentId("");
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No members in your team yet.</p>
          </div>
        ) : (
          members.map((member) => {
            const profile = member.profiles;
            if (!profile) return null;

            return (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {profile.role}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveMember(member.user_id)}
                  disabled={processing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

