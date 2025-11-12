"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  FileText,
  Star,
  Activity,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      icon: Target,
      title: "Performance Tracking",
      description: "Real-time metrics and KPIs for agents, teams, and executives. Track deals, leads, and revenue with precision.",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Supervise agents, manage teams, and coordinate workflows. Built-in approval systems and collaboration tools.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      icon: DollarSign,
      title: "Financial Insights",
      description: "Comprehensive P&L statements, commission tracking, tax calculations, and detailed cost analysis.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and automated insights to optimize performance and identify opportunities.",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: Calendar,
      title: "Meeting Management",
      description: "Schedule, track, and manage meetings with integrated calendar views and automated reminders.",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep-dive reports, trend analysis, and customizable dashboards for data-driven decision making.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
    },
  ];

  const capabilities = [
    { icon: CheckCircle2, text: "Role-based dashboards for every user type" },
    { icon: CheckCircle2, text: "Automated attendance and workflow tracking" },
    { icon: CheckCircle2, text: "Lead management and pipeline optimization" },
    { icon: CheckCircle2, text: "Commission and tax calculations" },
    { icon: CheckCircle2, text: "Real-time notifications and alerts" },
    { icon: CheckCircle2, text: "Secure data isolation and RLS policies" },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(31,105,255,0.1),transparent_50%)]" />
        </div>

        {/* Floating Orbs */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl animate-pulse delay-1000" />

        <div
          className={`relative z-10 flex max-w-5xl flex-col items-center gap-8 text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase text-primary transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            brokmang.
          </div>

          {/* Main Heading */}
          <h1
            className={`text-5xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-8xl transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Brokerage Performance
            </span>
            <br />
            <span className="text-foreground">Management Platform</span>
          </h1>

          {/* Subheading */}
          <p
            className={`max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            Empower your real estate team with intelligent tools for agents, leaders, and executives.
            Track performance, manage deals, and drive revenue with data-driven insights.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Button asChild size="lg" className="group h-12 px-8 text-base">
              <Link href="/sign-in">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          {/* Stats Preview */}
          <div
            className={`mt-12 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 transition-all duration-1000 delay-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {[
              { label: "Agents", value: "100+" },
              { label: "Deals", value: "1K+" },
              { label: "Teams", value: "50+" },
              { label: "Revenue", value: "EGP 10M+" },
            ].map((stat, idx) => (
              <Card
                key={idx}
                className="border-primary/20 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-6 w-6 rounded-full border-2 border-primary/50" />
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="relative py-24 px-6 bg-background"
      >
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-16 text-center scroll-animate">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Manage Your Brokerage
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              A comprehensive platform designed for real estate professionals at every level
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="group scroll-animate border-border/50 bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50"
                >
                  <CardHeader>
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} transition-all duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What It Does Section */}
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Description */}
            <div className="scroll-animate flex flex-col justify-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <Zap className="h-3 w-3" />
                Platform Overview
              </div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Built for Real Estate
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Brokmang is a complete performance management platform designed specifically for
                real estate brokerages. From individual agents tracking their daily workflow to
                executives analyzing company-wide P&L statements, we provide the tools you need to
                succeed.
              </p>
              <p className="mb-8 text-lg text-muted-foreground">
                Our platform integrates attendance tracking, deal management, lead generation,
                financial reporting, AI-powered insights, and team collaboration into one seamless
                experience.
              </p>

              {/* Capabilities List */}
              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map((capability, idx) => {
                  const Icon = capability.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-primary" />
                      <span>{capability.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Visual Cards */}
            <div className="scroll-animate space-y-4">
              {[
                {
                  icon: Building2,
                  title: "For Agents",
                  description: "Daily workflow tracking, deal management, and performance metrics",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Users,
                  title: "For Leaders",
                  description: "Team supervision, approval workflows, and agent ratings",
                  gradient: "from-indigo-500 to-purple-500",
                },
                {
                  icon: TrendingUp,
                  title: "For Executives",
                  description: "Company-wide analytics, P&L statements, and strategic insights",
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((role, idx) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={idx}
                    className="group border-border/50 bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <CardContent className="flex items-center gap-4 p-6">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-semibold">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <Card className="scroll-animate border-primary/20 bg-gradient-to-br from-primary/5 via-blue-50/50 to-indigo-50/50 dark:from-primary/10 dark:via-slate-900 dark:to-blue-950/50">
            <CardContent className="p-12 text-center">
              <Shield className="mx-auto mb-6 h-16 w-16 text-primary" />
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Transform Your Brokerage?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join leading real estate teams who trust Brokmang for their performance management
                needs.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href="/sign-in">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
