"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

const ROLES = [
  "sales_agent",
  "team_leader",
  "sales_manager",
  "business_unit_head",
  "finance",
  "ceo",
  "admin",
] as const;

export function SalaryManagement() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    monthlySalary: "",
    role: "sales_agent" as (typeof ROLES)[number],
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/finance/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          monthlySalary: parseFloat(formData.monthlySalary),
          role: formData.role,
          effectiveFrom: formData.effectiveFrom,
          effectiveTo: formData.effectiveTo || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        alert("Salary set successfully!");
        setFormData({
          employeeId: "",
          monthlySalary: "",
          role: "sales_agent",
          effectiveFrom: new Date().toISOString().split("T")[0],
          effectiveTo: "",
          notes: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to set salary");
      }
    } catch (error) {
      console.error("Failed to set salary:", error);
      alert("Failed to set salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Set Employee Salary</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Set or update employee monthly salary with effective dates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Employee ID (UUID) *</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            required
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="00000000-0000-0000-0000-000000000000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Monthly Salary (EGP) *</label>
            <input
              type="number"
              value={formData.monthlySalary}
              onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="10000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Effective From *</label>
            <input
              type="date"
              value={formData.effectiveFrom}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Effective To (optional)</label>
            <input
              type="date"
              value={formData.effectiveTo}
              onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            />
          </div>
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
          {loading ? "Setting..." : "Set Salary"}
        </Button>
      </form>
    </Card>
  );
}

