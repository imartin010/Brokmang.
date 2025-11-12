"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ClientRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    destination: "",
    clientBudget: "",
    projectNeeded: "",
    deliveryDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          destination: formData.destination,
          clientBudget: parseFloat(formData.clientBudget),
          projectNeeded: formData.projectNeeded,
          deliveryDate: formData.deliveryDate || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        alert("Client request submitted successfully! Your team leader will review it.");
        setFormData({
          clientName: "",
          clientPhone: "",
          destination: "",
          clientBudget: "",
          projectNeeded: "",
          deliveryDate: "",
          notes: "",
        });
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Submit Client Request</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Submit a new client request for team leader approval. Once approved, it can be converted to a deal.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Client Name *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Client full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Client Phone *</label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="+20 123 456 7890"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Destination *</label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="e.g., New Cairo, 6th of October"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Client Budget (EGP) *</label>
            <input
              type="number"
              value={formData.clientBudget}
              onChange={(e) => setFormData({ ...formData, clientBudget: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="500000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Delivery Date</label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Project Needed *</label>
          <textarea
            value={formData.projectNeeded}
            onChange={(e) => setFormData({ ...formData, projectNeeded: e.target.value })}
            required
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Describe the project or property type needed..."
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Additional information..."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Card>
  );
}

