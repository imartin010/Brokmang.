"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ApiError = {
  error?: string | { fieldErrors?: Record<string, string[]> };
};

type DealSource = {
  id: string;
  name: string;
};

const defaultFormState = {
  name: "",
  dealValue: "",
  expectedCloseDate: "",
  probability: "0",
  commissionValue: "",
  notes: "",
  sourceId: "",
};

export function CreateDealForm() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormState);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dealSources, setDealSources] = useState<DealSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  useEffect(() => {
    fetchDealSources();
  }, []);

  const fetchDealSources = async () => {
    try {
      const response = await fetch("/api/deal-sources");
      if (response.ok) {
        const data = await response.json();
        setDealSources(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch deal sources:", error);
    } finally {
      setLoadingSources(false);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const payload = {
      name: form.name.trim(),
      dealValue: Number(form.dealValue || 0),
      commissionValue: form.commissionValue ? Number(form.commissionValue) : undefined,
      probability: form.probability ? Number(form.probability) : undefined,
      expectedCloseDate: form.expectedCloseDate || undefined,
      notes: form.notes.trim() || undefined,
      sourceId: form.sourceId || undefined,
    };

    const response = await fetch("/api/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as ApiError;
      if (typeof data.error === "string") {
        setError(data.error);
      } else if (data.error && "fieldErrors" in data.error) {
        const firstFieldError = Object.values(data.error.fieldErrors ?? {})[0]?.[0];
        setError(firstFieldError ?? "Failed to create deal");
      } else {
        setError("Failed to create deal");
      }
      setSubmitting(false);
      return;
    }

    setForm(defaultFormState);
    setSuccess(true);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <header className="mb-4 space-y-1">
        <h3 className="text-xl font-semibold">Create a new deal</h3>
        <p className="text-muted-foreground text-sm">
          Capture a new opportunity and start tracking progress immediately.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Deal name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Zed East launch"
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Expected close date</span>
            <input
              type="date"
              name="expectedCloseDate"
              value={form.expectedCloseDate}
              onChange={handleChange}
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Deal value</span>
            <input
              type="number"
              min={0}
              step="0.01"
              name="dealValue"
              value={form.dealValue}
              onChange={handleChange}
              required
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Commission value</span>
            <input
              type="number"
              min={0}
              step="0.01"
              name="commissionValue"
              value={form.commissionValue}
              onChange={handleChange}
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Probability %</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              name="probability"
              value={form.probability}
              onChange={handleChange}
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Deal Source</span>
            <select
              name="sourceId"
              value={form.sourceId}
              onChange={handleChange}
              className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={loadingSources}
            >
              <option value="">Select source...</option>
              {dealSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Add optional details about this opportunity."
          />
        </label>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {success ? <p className="text-emerald-600 text-sm">Deal created successfully!</p> : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create deal"}
          </Button>
          {success ? (
            <button
              type="button"
              onClick={() => setForm(defaultFormState)}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Create another
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}



