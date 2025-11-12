"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Receipt } from "lucide-react";

type TaxConfig = {
  withholding_tax_rate: number;
  vat_rate: number;
  income_tax_rate: number;
  notes?: string;
};

export function TaxConfig() {
  const [config, setConfig] = useState<TaxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    withholdingTaxRate: "0.05",
    vatRate: "0.14",
    incomeTaxRate: "0.00",
    notes: "",
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/finance/taxes");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setConfig(data.data);
          setFormData({
            withholdingTaxRate: (data.data.withholding_tax_rate || 0.05).toString(),
            vatRate: (data.data.vat_rate || 0.14).toString(),
            incomeTaxRate: (data.data.income_tax_rate || 0).toString(),
            notes: data.data.notes || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch tax config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/finance/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withholdingTaxRate: parseFloat(formData.withholdingTaxRate),
          vatRate: parseFloat(formData.vatRate),
          incomeTaxRate: parseFloat(formData.incomeTaxRate),
          notes: formData.notes || undefined,
        }),
      });

      if (response.ok) {
        alert("Tax rates updated successfully!");
        await fetchConfig();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update tax rates");
      }
    } catch (error) {
      console.error("Failed to update tax rates:", error);
      alert("Failed to update tax rates");
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

  const totalTaxRate =
    parseFloat(formData.withholdingTaxRate) +
    parseFloat(formData.vatRate) +
    parseFloat(formData.incomeTaxRate);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Tax Configuration</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Withholding Tax Rate *</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.withholdingTaxRate}
              onChange={(e) => setFormData({ ...formData, withholdingTaxRate: e.target.value })}
              required
              min="0"
              max="1"
              step="0.0001"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
            />
            <span className="text-sm text-muted-foreground">
              ({((parseFloat(formData.withholdingTaxRate) || 0) * 100).toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Default: 5% (0.05)</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">VAT Rate *</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.vatRate}
              onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
              required
              min="0"
              max="1"
              step="0.0001"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
            />
            <span className="text-sm text-muted-foreground">
              ({((parseFloat(formData.vatRate) || 0) * 100).toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Default: 14% (0.14)</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Income Tax Rate *</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formData.incomeTaxRate}
              onChange={(e) => setFormData({ ...formData, incomeTaxRate: e.target.value })}
              required
              min="0"
              max="1"
              step="0.0001"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
            />
            <span className="text-sm text-muted-foreground">
              ({((parseFloat(formData.incomeTaxRate) || 0) * 100).toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Configurable based on tax bracket</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Tax Rate</span>
            <span className="text-lg font-bold">
              {(totalTaxRate * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
            placeholder="Tax configuration notes..."
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Updating..." : "Update Tax Rates"}
        </Button>
      </form>
    </Card>
  );
}

