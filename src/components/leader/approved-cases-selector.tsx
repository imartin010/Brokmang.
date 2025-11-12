"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, MapPin, DollarSign, FileText, Inbox, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type ApprovedRequest = {
  id: string;
  client_name: string;
  client_phone: string;
  destination: string;
  client_budget: number;
  project_needed: string;
  created_at: string;
};

export function ApprovedCasesSelector({
  onCaseSelected,
  selectedCount,
}: {
  onCaseSelected: (caseId: string) => void;
  selectedCount: number;
}) {
  const [cases, setCases] = useState<ApprovedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ApprovedRequest | null>(null);
  const [followUpNotes, setFollowUpNotes] = useState("");

  useEffect(() => {
    fetchApprovedCases();
  }, []);

  const fetchApprovedCases = async () => {
    try {
      const response = await fetch("/api/requests?status=approved");
      if (response.ok) {
        const data = await response.json();
        setCases((data.data || []).slice(0, 10)); // Show last 10 approved
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const openFollowUpModal = (caseItem: ApprovedRequest) => {
    setSelectedCase(caseItem);
    setFollowUpNotes("");
    setFollowUpModalOpen(true);
  };

  const submitFollowUp = () => {
    if (!selectedCase || !followUpNotes.trim()) return;
    
    // Mark case as followed up
    const newSelected = new Set(selectedCases);
    newSelected.add(selectedCase.id);
    setSelectedCases(newSelected);
    onCaseSelected(selectedCase.id);
    
    // Close modal
    setFollowUpModalOpen(false);
    setSelectedCase(null);
    setFollowUpNotes("");
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <Inbox className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium">No approved cases</p>
        <p className="text-xs text-muted-foreground mt-1">Approved cases will appear here for follow-up</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-2">
          Click cases to add follow-up notes • {selectedCases.size} reviewed today
        </p>
        {cases.map((caseItem) => {
          const isSelected = selectedCases.has(caseItem.id);
          return (
            <div
              key={caseItem.id}
              onClick={() => !isSelected && openFollowUpModal(caseItem)}
              className={cn(
                "p-3 rounded-xl border transition-all duration-200",
                isSelected
                  ? "border-purple-300 bg-purple-50 shadow-sm"
                  : "border-border/40 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold">{caseItem.client_name}</h4>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                )}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>{caseItem.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3" />
                  <span>{caseItem.client_budget.toLocaleString()} EGP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  <span>{caseItem.project_needed}</span>
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-[10px] text-purple-700 font-medium">✓ Followed up</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Follow-up Modal */}
      <Dialog open={followUpModalOpen} onOpenChange={setFollowUpModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Follow-up on Case</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedCase?.client_name} - {selectedCase?.project_needed}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                What happened with this case?
              </label>
              <textarea
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={6}
                placeholder="e.g., Called client to check progress, agent needs help with pricing, client requested site visit, deal moving to negotiation phase..."
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={submitFollowUp}
                disabled={!followUpNotes.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Follow-up
              </Button>
              <Button
                onClick={() => setFollowUpModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

