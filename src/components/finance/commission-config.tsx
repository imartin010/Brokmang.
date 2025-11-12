"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Percent } from "lucide-react";

const ROLES = [
  "sales_agent",
  "team_leader",
  "sales_manager",
  "business_unit_head",
  "finance",
  "ceo",
  "admin",
] as const;

type CommissionConfig = {
  role: string;
  base_rate_per_million: number;
  description?: string;
};

export function CommissionConfig() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    role: "sales_agent" as (typeof ROLES)[number],
    baseRatePerMillion: "",
    description: "",
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/finance/commissions");
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch commission config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/finance/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formData.role,
          baseRatePerMillion: parseFloat(formData.baseRatePerMillion),
          description: formData.description || undefined,
        }),
      });

      if (response.ok) {
        alert("Commission rate updated successfully!");
        await fetchConfigs();
        setFormData({
          role: "sales_agent",
          baseRatePerMillion: "",
          description: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update commission rate");
      }
    } catch (error) {
      console.error("Failed to update commission rate:", error);
      alert("Failed to update commission rate");
    } finally {
      setSaving(false);
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

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Percent className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Commission Configuration</h3>
      </div>

      <div className="mb-6 space-y-2">
        <h4 className="text-sm font-medium">Current Rates (per 1 Million EGP)</h4>
        <div className="space-y-1">
          {configs.map((config) => (
            <div key={config.role} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
              <span className="capitalize">{config.role.replace(/_/g, " ")}</span>
              <span className="font-semibold">EGP {config.base_rate_per_million.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="text-sm font-medium mb-1 block">Base Rate per Million (EGP) *</label>
          <input
            type="number"
            value={formData.baseRatePerMillion}
            onChange={(e) => setFormData({ ...formData, baseRatePerMillion: e.target.value })}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="6000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: 6000 means 6000 EGP commission per 1 Million EGP in sales
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description (optional)</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder="e.g., Average commission rate for agents"
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Updating..." : "Update Commission Rate"}
        </Button>
      </form>
    </Card>
  );
}

