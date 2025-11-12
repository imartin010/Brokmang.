import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-24">
      <section className="flex max-w-3xl flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <p className="border-border rounded-full border px-4 py-1 text-xs font-medium tracking-[0.2em] uppercase">
          brokmang.
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Brokerage performance management for agents, leaders, and executives.
        </h1>
        <p className="text-muted-foreground text-base text-pretty sm:text-lg">
          This workspace scaffolds the upcoming Supabase-backed platform with Tailwind CSS v4,
          shadcn/ui, runtime-safe environment validation, and opinionated tooling to keep shipping
          fast.
        </p>
      </section>

      <section className="grid w-full max-w-4xl gap-6 sm:grid-cols-2">
        {[
          {
            title: "Secure foundations",
            description:
              "Runtime validated environment variables and linted TypeScript ensure confidence before wiring Supabase.",
          },
          {
            title: "UI primitives",
            description:
              "Tailwind v4 with shadcn/ui delivers accessible component building blocks for role-based dashboards.",
          },
          {
            title: "Developer experience",
            description:
              "Prettier, ESLint, and strict TypeScript provide a consistent baseline for collaboration.",
          },
          {
            title: "Next steps",
            description:
              "Implement Supabase clients, schema, and RLS policies to unlock data-driven workflows.",
          },
        ].map((feature) => (
          <article
            key={feature.title}
            className="border-border bg-card rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-lg"
          >
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
          </article>
        ))}
      </section>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/sign-in">Go to sign-in</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="https://supabase.com/docs/guides/auth" target="_blank" rel="noreferrer">
            Review Supabase auth docs
          </Link>
        </Button>
      </div>
    </main>
  );
}
