"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    destination: "",
    estimatedBudget: "",
    projectType: "",
    notes: "",
  });
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientPhone: formData.clientPhone || undefined,
          clientEmail: formData.clientEmail || undefined,
          destination: formData.destination || undefined,
          estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
          projectType: formData.projectType || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        notify({
          variant: "success",
          title: "Lead created",
          message: "Lead added successfully. Convert it to a deal when you're ready.",
        });
        setFormData({
          clientName: "",
          clientPhone: "",
          clientEmail: "",
          destination: "",
          estimatedBudget: "",
          projectType: "",
          notes: "",
        });
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Unable to create lead",
          message: error.error || "Failed to create lead.",
        });
      }
    } catch (error) {
      console.error("Failed to create lead:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to create lead." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Create Lead</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Add a new lead to track potential clients. Leads can be converted to deals later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Phone</label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="+20 123 456 7890"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="client@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Destination</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="e.g., New Cairo, 6th of October"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Estimated Budget (EGP)</label>
            <input
              type="number"
              value={formData.estimatedBudget}
              onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="500000"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Project Type</label>
          <input
            type="text"
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="e.g., Apartment, Villa, Commercial"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Additional information about the lead..."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating Lead..." : "Create Lead"}
        </Button>
      </form>
    </Card>
  );
}

