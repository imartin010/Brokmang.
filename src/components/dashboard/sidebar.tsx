"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  BarChart3,
  Building2,
  Crown,
  Shield,
  Target,
  Sparkles,
  LogOut,
  LogIn,
  Plus,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoleLandingPath, type UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    title: "Agent",
    href: "/app/agent",
    icon: Target,
    roles: ["sales_agent"],
  },
  {
    title: "Team Leader",
    href: "/app/leader",
    icon: Users,
    roles: ["team_leader"],
  },
  {
    title: "Manager",
    href: "/app/manager",
    icon: BarChart3,
    roles: ["sales_manager"],
  },
  {
    title: "Business Unit",
    href: "/app/business-unit",
    icon: Building2,
    roles: ["business_unit_head"],
  },
  {
    title: "Finance",
    href: "/app/finance",
    icon: DollarSign,
    roles: ["finance"],
  },
  {
    title: "Executive",
    href: "/app/executive",
    icon: Crown,
    roles: ["ceo"],
  },
  {
    title: "Admin",
    href: "/app/admin",
    icon: Shield,
    roles: ["admin"],
  },
];

export function DashboardSidebar({
  userRole,
  userName,
  userEmail,
}: {
  userRole: UserRole | null;
  userName: string;
  userEmail: string | null;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState({ completed: 0, total: 10 });
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const userNavItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  const userDashboardPath = userRole ? getRoleLandingPath(userRole) : "/app";
  const userDashboardItem = navItems.find((item) => item.href === userDashboardPath);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mark as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for workflow updates (client-side only)
  useEffect(() => {
    if (!isMounted) return;

    const handleWorkflowUpdate = (event: CustomEvent) => {
      const data = event.detail;
      let completed = 0;
      if (data.isCheckedIn) completed++;
      if (data.orientation) completed++;
      if (data.followUpCalls > 0) completed++;
      if (data.leadsToday > 0) completed++;
      if (data.coldCalls > 0) completed++;
      if (data.newRequests > 0) completed++;
      if (data.meetingsScheduled > 0) completed++;
      if (data.meetingsCompleted > 0) completed++;
      if (data.mood) completed++;
      if (data.checkOutTime) completed++;
      
      setWorkflowProgress({ completed, total: 10 });
      setIsCheckedIn(data.isCheckedIn || false);
    };

    window.addEventListener("workflow-stats-updated", handleWorkflowUpdate as EventListener);
    return () => {
      window.removeEventListener("workflow-stats-updated", handleWorkflowUpdate as EventListener);
    };
  }, [isMounted]);

  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 h-full w-16 bg-white border-r border-border/40 z-40 transition-all duration-300 hidden lg:block">
        <div className="flex flex-col h-full items-center py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border/40 z-40 transition-all duration-300 hidden lg:block overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Logo & Collapse Button */}
        <div className="px-4 py-5 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-base text-foreground tracking-tight">Brokmang</h1>
              <p className="text-[10px] text-muted-foreground/80 tracking-wide uppercase">Sales Platform</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Section 1: Quick Stats Panel */}
        {userRole === "sales_agent" && (
          <>
            <div className="px-4 py-4 border-b border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Quick Stats
              </p>
              <div className="space-y-2.5">
                {/* Check-in Status */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {isCheckedIn ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="text-xs font-medium">Check-in</span>
                  </div>
                  <Badge variant={isCheckedIn ? "default" : "outline"} className="text-[10px] h-5">
                    {isCheckedIn ? "Done" : "Pending"}
                  </Badge>
                </div>

                {/* Workflow Progress */}
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-blue-700">Workflow</span>
                    <span className="text-xs font-bold text-blue-700" suppressHydrationWarning>
                      {workflowProgress.completed}/{workflowProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/40 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500"
                      style={{ width: `${(workflowProgress.completed / workflowProgress.total) * 100}%` }}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Quick Actions */}
            <div className="px-4 py-4 border-b border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => window.dispatchEvent(new CustomEvent("quick-check-in"))}
                >
                  <LogIn className="h-3.5 w-3.5 mr-2" />
                  Quick Check-in
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-request-modal"))}
                >
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Add Request
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-meeting-modal"))}
                >
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  Schedule Meeting
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => {
                    // Scroll to pipeline section
                    const pipelineSection = document.getElementById("pipeline-weight-section");
                    if (pipelineSection) {
                      pipelineSection.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                >
                  <TrendingUp className="h-3.5 w-3.5 mr-2" />
                  View Pipeline
                </Button>
              </div>
            </div>

            {/* Section 3: Today's Agenda */}
            <div className="px-4 py-4 border-b border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Today's Agenda
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Calendar className="h-3.5 w-3.5 text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Meetings Today</p>
                    <p className="text-[10px] text-muted-foreground">1 scheduled</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <FileText className="h-3.5 w-3.5 text-amber-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Pending Requests</p>
                    <p className="text-[10px] text-muted-foreground">5 awaiting review</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Pipeline</p>
                    <p className="text-[10px] text-muted-foreground">36.5M EGP</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {userDashboardItem && (
            <SidebarNavItem
              item={userDashboardItem}
              isActive={pathname === userDashboardItem.href}
            />
          )}
        </nav>

        <Separator className="opacity-50" />

        {/* AI Insights Quick Access */}
        <div className="px-3 py-3">
          <Link
            href="/app/insights"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 hover:shadow-sm"
          >
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span>AI Insights</span>
          </Link>
        </div>

        <Separator className="opacity-50" />

        {/* User Profile & Settings */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-foreground">{userName}</p>
              {userEmail && (
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
          </div>
          <Link
            href="/app/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        "group relative",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "drop-shadow-sm")} />
      <span className="flex-1">{item.title}</span>
      {item.badge && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
