"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";

type PnLData = {
  gross_revenue: number;
  total_expenses: number;
  fixed_costs: number;
  variable_costs: number;
  total_salaries: number;
  total_commissions_paid: number;
  withholding_tax: number;
  vat: number;
  contribution_margin: number;
  profit_before_income_tax: number;
  net_profit: number;
  period_month?: string;
};

type PnLStatementProps = {
  businessUnitId?: string;
};

export function PnLStatement({ businessUnitId }: PnLStatementProps = {}) {
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [buId, setBuId] = useState(businessUnitId || "");

  useEffect(() => {
    if (businessUnitId) {
      setBuId(businessUnitId);
    }
  }, [businessUnitId]);

  useEffect(() => {
    fetchPnL();
  }, [month, buId]);

  const fetchPnL = async () => {
    setLoading(true);
    try {
      const url = `/api/finance/pnl?month=${month}${buId ? `&buId=${buId}` : ""}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPnlData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch P&L:", error);
    } finally {
      setLoading(false);
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

  if (!pnlData) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Profit & Loss Statement</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No P&L data available for the selected period.</p>
        </div>
      </Card>
    );
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (typeof value !== "number") return "EGP 0";
    return `EGP ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Profit & Loss Statement</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Revenue Section */}
        <div>
          <h4 className="font-semibold mb-3 text-green-600">Revenue</h4>
          <div className="space-y-2">
            <PnLRow label="Gross Revenue" value={pnlData.gross_revenue} formatCurrency={formatCurrency} />
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <h4 className="font-semibold mb-3 text-red-600">Expenses</h4>
          <div className="space-y-2 pl-4">
            <PnLRow label="Fixed Costs" value={pnlData.fixed_costs} formatCurrency={formatCurrency} />
            <PnLRow label="Variable Costs" value={pnlData.variable_costs} formatCurrency={formatCurrency} />
            <PnLRow label="Total Salaries" value={pnlData.total_salaries} formatCurrency={formatCurrency} />
            <PnLRow
              label="Commissions Paid"
              value={pnlData.total_commissions_paid}
              formatCurrency={formatCurrency}
            />
            <div className="pt-2 border-t">
              <PnLRow label="Total Expenses" value={pnlData.total_expenses} formatCurrency={formatCurrency} />
            </div>
          </div>
        </div>

        {/* Taxes Section */}
        <div>
          <h4 className="font-semibold mb-3 text-orange-600">Taxes</h4>
          <div className="space-y-2 pl-4">
            <PnLRow label="Withholding Tax (5%)" value={pnlData.withholding_tax} formatCurrency={formatCurrency} />
            <PnLRow label="VAT (14%)" value={pnlData.vat} formatCurrency={formatCurrency} />
          </div>
        </div>

        {/* Profit Section */}
        <div>
          <h4 className="font-semibold mb-3">Profit Calculations</h4>
          <div className="space-y-2">
            <PnLRow
              label="Contribution Margin"
              value={pnlData.contribution_margin}
              formatCurrency={formatCurrency}
            />
            <PnLRow
              label="Profit Before Income Tax"
              value={pnlData.profit_before_income_tax}
              formatCurrency={formatCurrency}
            />
            <div className="pt-2 border-t-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">Net Profit</span>
                  {pnlData.net_profit >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <span
                  className={`text-2xl font-bold ${
                    pnlData.net_profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(pnlData.net_profit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

type PnLRowProps = {
  label: string;
  value: number | null | undefined;
  formatCurrency: (value: number | null | undefined) => string;
};

const PnLRow = ({ label, value, formatCurrency }: PnLRowProps) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm">{label}</span>
    <span className="font-semibold">{formatCurrency(value)}</span>
  </div>
);

