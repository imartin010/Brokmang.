"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, MapPin, DollarSign, Eye, Pencil, Trash2, Inbox } from "lucide-react";

type ClientRequest = {
  id: string;
  client_name: string;
  client_phone: string;
  destination: string;
  client_budget: number;
  project_needed: string;
  status: string;
  delivery_date: string | null;
  agent_notes: string | null;
  leader_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export function MyRequestsList() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px]">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Rejected</Badge>;
      case "converted":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Converted</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-xl border border-border/40 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <Inbox className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium">No requests yet</p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Submit your first client request to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {requests.map((request) => (
        <div
          key={request.id}
          className="p-4 rounded-xl border border-border/40 hover:shadow-sm transition-all duration-200 group bg-white"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">{request.client_name}</h4>
              <div className="flex items-center gap-2">
                {getStatusBadge(request.status)}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span>{request.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3 w-3" />
              <span>Budget: {request.client_budget.toLocaleString()} EGP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              <span>{request.project_needed}</span>
            </div>
          </div>

          {request.leader_notes && (
            <div className="mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200/40">
              <p className="text-[10px] text-blue-700 font-medium mb-0.5">Team Leader Notes:</p>
              <p className="text-xs text-blue-900/80">{request.leader_notes}</p>
            </div>
          )}

          {request.rejection_reason && (
            <div className="mt-3 p-2 rounded-lg bg-red-50 border border-red-200/40">
              <p className="text-[10px] text-red-700 font-medium mb-0.5">Rejection Reason:</p>
              <p className="text-xs text-red-900/80">{request.rejection_reason}</p>
            </div>
          )}

          {request.status === "pending" && (
            <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

