"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

type ClientRequest = {
  id: string;
  agent_id: string;
  agent_name?: string;
  client_name: string;
  client_phone: string;
  destination: string;
  client_budget: number;
  project_needed: string;
  delivery_date?: string;
  agent_notes?: string;
  status: "pending" | "approved" | "rejected" | "converted";
  created_at: string;
};

export function PendingRequestsList() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests?status=pending");
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

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          leaderNotes: "",
        }),
      });

      if (response.ok) {
        await fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: reason,
        }),
      });

      if (response.ok) {
        await fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessingId(null);
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

  if (requests.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Pending Client Requests</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No pending requests at the moment.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Pending Client Requests</h3>
        <Badge variant="muted">{requests.length}</Badge>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onApprove={() => handleApprove(request.id)}
            onReject={(reason) => handleReject(request.id, reason)}
            processing={processingId === request.id}
          />
        ))}
      </div>
    </Card>
  );
}

type RequestCardProps = {
  request: ClientRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
  processing: boolean;
};

const RequestCard = ({ request, onApprove, onReject, processing }: RequestCardProps) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{request.client_name}</h4>
            <Badge variant="outline" className="text-xs">
              {request.agent_name || "Agent"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Phone:</strong> {request.client_phone}
            </p>
            <p>
              <strong>Destination:</strong> {request.destination}
            </p>
            <p>
              <strong>Budget:</strong> EGP {request.client_budget.toLocaleString()}
            </p>
            <p>
              <strong>Project:</strong> {request.project_needed}
            </p>
            {request.delivery_date && (
              <p>
                <strong>Delivery Date:</strong> {new Date(request.delivery_date).toLocaleDateString()}
              </p>
            )}
            {request.agent_notes && (
              <p>
                <strong>Notes:</strong> {request.agent_notes}
              </p>
            )}
            <p className="text-xs mt-2">
              <Clock className="h-3 w-3 inline mr-1" />
              Submitted {new Date(request.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {showRejectForm ? (
        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-medium">Rejection Reason *</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this request is being rejected..."
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onReject(rejectionReason);
                setShowRejectForm(false);
                setRejectionReason("");
              }}
              disabled={processing || !rejectionReason.trim()}
              variant="destructive"
            >
              Confirm Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={processing}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowRejectForm(true)}
            disabled={processing}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

