"use client";

import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  Briefcase,
  Target,
  Building2,
  BarChart3,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  FileText,
  Sparkles,
  Settings,
  Bell,
  Mail,
  Phone,
  Star,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconName =
  | "dollar"
  | "users"
  | "briefcase"
  | "target"
  | "building"
  | "chart"
  | "clock"
  | "calendar"
  | "activity"
  | "trending-up"
  | "file"
  | "sparkles"
  | "settings"
  | "bell"
  | "mail"
  | "phone"
  | "star"
  | "user-check";

const iconMap = {
  dollar: DollarSign,
  users: Users,
  briefcase: Briefcase,
  target: Target,
  building: Building2,
  chart: BarChart3,
  clock: Clock,
  calendar: Calendar,
  activity: Activity,
  "trending-up": TrendingUp,
  file: FileText,
  sparkles: Sparkles,
  settings: Settings,
  bell: Bell,
  mail: Mail,
  phone: Phone,
  star: Star,
  "user-check": UserCheck,
};

type WidgetCardProps = {
  title: string;
  subtitle?: string;
  iconName?: IconName;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
};

export function WidgetCard({
  title,
  subtitle,
  iconName,
  children,
  className,
  badge,
  actions,
}: WidgetCardProps) {
  const Icon = iconName ? iconMap[iconName] : null;

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl",
        className
      )}
    >
      <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {badge}
          </div>
          {actions}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}
