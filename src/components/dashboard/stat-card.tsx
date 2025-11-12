"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Target,
  Building2,
  BarChart3,
  Clock,
  Calendar,
  Phone,
  FileText,
  Star,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconName =
  | "trending-up"
  | "trending-down"
  | "dollar"
  | "users"
  | "briefcase"
  | "target"
  | "building"
  | "chart"
  | "clock"
  | "calendar"
  | "phone"
  | "file"
  | "star"
  | "user-check";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName?: IconName;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
};

const iconMap = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "dollar": DollarSign,
  "users": Users,
  "briefcase": Briefcase,
  "target": Target,
  "building": Building2,
  "chart": BarChart3,
  "clock": Clock,
  "calendar": Calendar,
  "phone": Phone,
  "file": FileText,
  "star": Star,
  "user-check": UserCheck,
};

export function StatCard({ title, value, subtitle, iconName, trend, className }: StatCardProps) {
  const Icon = iconName ? iconMap[iconName] : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-6 shadow-sm",
        "hover:shadow-md hover:border-border/60 transition-all duration-300",
        "animate-in fade-in slide-in-from-bottom-4",
        className
      )}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-60" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold mt-2 tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
