"use client";

import { Bell, Sparkles, ChevronDown, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardSearch } from "@/components/dashboard/search";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type DashboardHeaderProps = {
  userName: string;
  userRole: string;
};

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        {/* Search Bar - Takes center stage */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <DashboardSearch />
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right Side Actions - Minimal and clean */}
        <div className="flex items-center gap-2">
          {/* AI Insights Quick Access */}
          <Link href="/app/insights">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </Link>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all duration-200"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 px-2 hover:bg-muted/50 rounded-xl gap-2 transition-all duration-200"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <p className="text-xs font-medium leading-none">{userName}</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{userRole}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground pt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                      {userRole}
                    </span>
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/insights" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>AI Insights</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/admin" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <SignOutButton />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
