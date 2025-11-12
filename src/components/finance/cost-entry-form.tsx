"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useNotification } from "@/components/notifications/notification-provider";

const COST_CATEGORIES = [
  { value: "rent", label: "Rent" },
  { value: "salary_agent", label: "Salary - Agent" },
  { value: "salary_team_leader", label: "Salary - Team Leader" },
  { value: "salary_sales_manager", label: "Salary - Sales Manager" },
  { value: "salary_bu_head", label: "Salary - BU Head" },
  { value: "salary_finance", label: "Salary - Finance" },
  { value: "salary_ceo", label: "Salary - CEO" },
  { value: "salary_admin", label: "Salary - Admin" },
  { value: "marketing", label: "Marketing" },
  { value: "phone_bills", label: "Phone Bills" },
  { value: "utilities", label: "Utilities" },
  { value: "software_subscriptions", label: "Software Subscriptions" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "travel", label: "Travel" },
  { value: "training", label: "Training" },
  { value: "other_fixed", label: "Other Fixed" },
  { value: "other_variable", label: "Other Variable" },
] as const;

export function CostEntryForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessUnitId: "",
    category: "other_fixed" as (typeof COST_CATEGORIES)[number]["value"],
    amount: "",
    costMonth: new Date().toISOString().slice(0, 7) + "-01", // YYYY-MM-DD
    description: "",
    isFixedCost: true,
    isRecurring: false,
    receiptUrl: "",
    notes: "",
  });
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/finance/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessUnitId: formData.businessUnitId || undefined,
          category: formData.category,
          amount: parseFloat(formData.amount),
          costMonth: formData.costMonth,
          description: formData.description || undefined,
          isFixedCost: formData.isFixedCost,
          isRecurring: formData.isRecurring,
          receiptUrl: formData.receiptUrl || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        notify({ variant: "success", title: "Cost entry added", message: "Expense recorded successfully." });
        setFormData({
          businessUnitId: "",
          category: "other_fixed",
          amount: "",
          costMonth: new Date().toISOString().slice(0, 7) + "-01",
          description: "",
          isFixedCost: true,
          isRecurring: false,
          receiptUrl: "",
          notes: "",
        });
      } else {
        const error = await response.json();
        notify({
          variant: "error",
          title: "Unable to add cost entry",
          message: error.error || "Failed to add cost entry.",
        });
      }
    } catch (error) {
      console.error("Failed to add cost entry:", error);
      notify({ variant: "error", title: "Network error", message: "Failed to add cost entry." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Add Cost Entry</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Record fixed or variable costs for financial tracking.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          >
            {COST_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Amount (EGP) *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Cost Month *</label>
            <input
              type="date"
              value={formData.costMonth}
              onChange={(e) => setFormData({ ...formData, costMonth: e.target.value })}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="Brief description of the cost"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFixedCost}
              onChange={(e) => setFormData({ ...formData, isFixedCost: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Fixed Cost</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Recurring</span>
          </label>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Receipt URL (optional)</label>
          <input
            type="url"
            value={formData.receiptUrl}
            onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Additional notes..."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Adding..." : "Add Cost Entry"}
        </Button>
      </form>
    </Card>
  );
}

