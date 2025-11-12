"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, FileText, Target, Inbox, Clock } from "lucide-react";

type ClientRequest = {
  id: string;
  client_name: string;
  client_budget: number;
  status: string;
  project_needed: string;
};

export function PipelineWeight() {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Calculate pipeline weight
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const totalRequests = requests.length;

  const totalPipeline = requests.reduce((sum, r) => sum + Number(r.client_budget || 0), 0);
  const pendingPipeline = pendingRequests.reduce((sum, r) => sum + Number(r.client_budget || 0), 0);
  const approvedPipeline = approvedRequests.reduce((sum, r) => sum + Number(r.client_budget || 0), 0);

  if (totalRequests === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <Inbox className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium">No pipeline yet</p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Submit client requests to build your pipeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Pipeline */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-transparent border border-purple-200/40">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-purple-700/70 font-medium uppercase tracking-wide">Total Pipeline</p>
            <p className="text-[10px] text-purple-600/60">{totalRequests} requests</p>
          </div>
        </div>
        <p className="text-3xl font-bold text-purple-700 tracking-tight">
          {(totalPipeline / 1000000).toFixed(2)}M EGP
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-transparent border border-yellow-200/40">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3 text-yellow-600" />
            <p className="text-[10px] text-yellow-700/70 font-medium uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-xl font-bold text-yellow-700">
            {(pendingPipeline / 1000000).toFixed(1)}M EGP
          </p>
          <p className="text-[10px] text-yellow-600/60 mt-0.5">{pendingRequests.length} requests</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-transparent border border-green-200/40">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3 w-3 text-green-600" />
            <p className="text-[10px] text-green-700/70 font-medium uppercase tracking-wide">Approved</p>
          </div>
          <p className="text-xl font-bold text-green-700">
            {(approvedPipeline / 1000000).toFixed(1)}M EGP
          </p>
          <p className="text-[10px] text-green-600/60 mt-0.5">{approvedRequests.length} requests</p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="pt-3 border-t border-border/40">
        <p className="text-xs font-medium text-muted-foreground mb-3">Top Requests by Value</p>
        <div className="space-y-2">
          {requests
            .sort((a, b) => Number(b.client_budget) - Number(a.client_budget))
            .slice(0, 3)
            .map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{request.client_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{request.project_needed}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs font-bold">{(Number(request.client_budget) / 1000000).toFixed(1)}M EGP</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{request.status}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

