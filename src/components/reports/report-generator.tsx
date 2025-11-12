"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, Users, Building2 } from "lucide-react";

type ReportType = "agent" | "team" | "business-unit";
type Period = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

type ReportGeneratorProps = {
  type: ReportType;
  agentId?: string;
  teamId?: string;
  buId?: string;
};

export function ReportGenerator({ type, agentId, teamId, buId }: ReportGeneratorProps) {
  const [period, setPeriod] = useState<Period>("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (period !== "custom") {
      fetchReport();
    }
  }, [period, type, agentId, teamId, buId]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        period: period === "custom" ? "monthly" : period,
      });

      if (agentId) params.set("agentId", agentId);
      if (teamId) params.set("teamId", teamId);
      if (buId) params.set("buId", buId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const endpoint = `/api/reports/${type === "business-unit" ? "business-unit" : type}`;
      const response = await fetch(`${endpoint}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch report");
      }

      const data = await response.json();
      setReportData(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report-${period}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "$0";
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value == null) return "0";
    return Number(value).toLocaleString();
  };

  const getTypeLabel = () => {
    switch (type) {
      case "agent":
        return "Agent Performance";
      case "team":
        return "Team Performance";
      case "business-unit":
        return "Business Unit Report";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "agent":
        return <TrendingUp className="h-5 w-5" />;
      case "team":
        return <Users className="h-5 w-5" />;
      case "business-unit":
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <div>
            <h3 className="text-lg font-semibold">{getTypeLabel()} Report</h3>
            <p className="text-sm text-muted-foreground">Generate and export performance reports</p>
          </div>
        </div>
        {reportData.length > 0 && (
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        )}
      </div>

      {/* Period Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Period:</span>
          {(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <Button onClick={fetchReport} size="sm">
              Generate Report
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Report Data */}
      {!loading && !error && reportData.length > 0 && (
        <div className="space-y-4">
          {type === "agent" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportData.map((report, idx) => (
                <Card key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{report.agent_name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.report_month).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days Worked:</span>
                      <span className="font-medium">{formatNumber(report.days_worked)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Calls:</span>
                      <span className="font-medium">{formatNumber(report.total_calls)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Meetings:</span>
                      <span className="font-medium">{formatNumber(report.total_meetings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deals Won:</span>
                      <span className="font-medium">{formatNumber(report.deals_won)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-medium">{formatCurrency(report.total_deal_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(report.total_commission_earned)}
                      </span>
                    </div>
                    {report.avg_rating_score && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Rating:</span>
                        <span className="font-medium">{Number(report.avg_rating_score).toFixed(1)}/5</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {type === "team" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportData.map((report, idx) => (
                <Card key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{report.team_name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.report_month).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size:</span>
                      <span className="font-medium">{formatNumber(report.team_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Calls:</span>
                      <span className="font-medium">{formatNumber(report.total_team_calls)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Meetings:</span>
                      <span className="font-medium">{formatNumber(report.total_team_meetings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deals Won:</span>
                      <span className="font-medium">{formatNumber(report.team_deals_won)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="font-medium">{formatCurrency(report.team_total_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(report.team_total_commission)}
                      </span>
                    </div>
                    {report.team_avg_rating && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Rating:</span>
                        <span className="font-medium">{Number(report.team_avg_rating).toFixed(1)}/5</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {type === "business-unit" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportData.map((report, idx) => (
                <Card key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{report.business_unit_name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.report_month).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teams:</span>
                      <span className="font-medium">{formatNumber(report.team_count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agents:</span>
                      <span className="font-medium">{formatNumber(report.agent_count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium text-green-600">{formatCurrency(report.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses:</span>
                      <span className="font-medium text-red-600">{formatCurrency(report.expenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Profit:</span>
                      <span className="font-medium">{formatCurrency(report.gross_profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Profit:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(report.net_profit_before_income_tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deals Won:</span>
                      <span className="font-medium">{formatNumber(report.won_deals)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && reportData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No report data available for the selected period.</p>
        </div>
      )}
    </Card>
  );
}

