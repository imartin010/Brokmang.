"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase";

type Deal = {
  id: string;
  name: string;
  stage: Database["public"]["Enums"]["deal_stage"];
  deal_value: number;
  commission_value: number;
  probability: number;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
};

const stageOptions: Database["public"]["Enums"]["deal_stage"][] = [
  "prospecting",
  "qualified",
  "negotiation",
  "contract_sent",
  "won",
  "lost",
];

type DealsTableProps = {
  deals: Deal[];
};

export function DealsTable({ deals }: DealsTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, Partial<Deal>>>({});
  const [logForm, setLogForm] = useState<Record<string, { activityType: string; summary: string }>>(
    {},
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startEdit = (deal: Deal) => {
    setEditingId(deal.id);
    setFeedback(null);
    setFormState((prev) => ({
      ...prev,
      [deal.id]: {
        name: deal.name,
        stage: deal.stage,
        deal_value: deal.deal_value,
        commission_value: deal.commission_value,
        probability: deal.probability,
        expected_close_date: deal.expected_close_date ?? "",
      },
    }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFeedback(null);
  };

  const updateField = (dealId: string, key: keyof Deal, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      [dealId]: {
        ...prev[dealId],
        [key]: value,
      },
    }));
  };

  const submitEdit = async (dealId: string) => {
    const payload = formState[dealId];
    if (!payload) return;

    setLoading(true);
    setFeedback(null);

    const response = await fetch(`/api/deals/ EGP{dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        stage: payload.stage,
        dealValue: payload.deal_value !== undefined ? Number(payload.deal_value) : undefined,
        commissionValue:
          payload.commission_value !== undefined ? Number(payload.commission_value) : undefined,
        probability: payload.probability !== undefined ? Number(payload.probability) : undefined,
        expectedCloseDate:
          typeof payload.expected_close_date === "string" && payload.expected_close_date.length > 0
            ? payload.expected_close_date
            : null,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setFeedback(
        typeof data.error === "string"
          ? data.error
          : "Unable to update deal. Please try again or refresh.",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setEditingId(null);
    router.refresh();
  };

  const deleteDeal = async (dealId: string) => {
    const confirmed = window.confirm("Are you sure you want to remove this deal?");
    if (!confirmed) return;

    setLoading(true);
    setFeedback(null);

    const response = await fetch(`/api/deals/ EGP{dealId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setFeedback(
        typeof data.error === "string"
          ? data.error
          : "Unable to delete deal. Please try again or refresh.",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  };

  const startLog = (dealId: string) => {
    setLoggingId(dealId);
    setFeedback(null);
    setLogForm((prev) => ({
      ...prev,
      [dealId]: prev[dealId] ?? { activityType: "call", summary: "" },
    }));
  };

  const submitLog = async (dealId: string) => {
    const payload = logForm[dealId];
    if (!payload) return;

    setLoading(true);
    setFeedback(null);

    const response = await fetch(`/api/deals/ EGP{dealId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType: payload.activityType,
        summary: payload.summary,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setFeedback(
        typeof data.error === "string"
          ? data.error
          : "Unable to log activity. Please try again or refresh.",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setLoggingId(null);
    router.refresh();
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Your open deals</h3>
          <p className="text-muted-foreground text-sm">
            Manage active opportunities, update stages, and capture outreach notes.
          </p>
        </div>
      </header>

      {feedback ? <p className="text-destructive text-sm">{feedback}</p> : null}

      {deals.length === 0 ? (
        <div className="border-border bg-muted/30 rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="text-lg font-medium">No deals yet</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Create your first opportunity using the form above to populate this table.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Deal</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Probability</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Expected close
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {deals.map((deal) => {
                const editState = formState[deal.id];
                const isEditing = editingId === deal.id;
                const isLogging = loggingId === deal.id;
                const logState = logForm[deal.id] ?? { activityType: "call", summary: "" };

                return (
                  <tr key={deal.id}>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={editState?.name ?? ""}
                          onChange={(event) => updateField(deal.id, "name", event.target.value)}
                        />
                      ) : (
                        <div>
                          <p className="font-medium">{deal.name}</p>
                          <p className="text-muted-foreground text-xs">
                            Created{" "}
                            {new Date(deal.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={editState?.stage ?? deal.stage}
                          onChange={(event) =>
                            updateField(deal.id, "stage", event.target.value as Deal["stage"])
                          }
                        >
                          {stageOptions.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="capitalize">{deal.stage.replace("_", " ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={editState?.deal_value ?? deal.deal_value}
                          onChange={(event) =>
                            updateField(deal.id, "deal_value", Number(event.target.value))
                          }
                        />
                      ) : (
                        ` EGP EGP{deal.deal_value.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="1"
                          className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={editState?.probability ?? deal.probability}
                          onChange={(event) =>
                            updateField(deal.id, "probability", Number(event.target.value))
                          }
                        />
                      ) : (
                        ` EGP{deal.probability}%`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="date"
                          className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={editState?.expected_close_date ?? deal.expected_close_date ?? ""}
                          onChange={(event) =>
                            updateField(deal.id, "expected_close_date", event.target.value)
                          }
                        />
                      ) : deal.expected_close_date ? (
                        new Date(deal.expected_close_date).toLocaleDateString()
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(deal.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              disabled={loading}
                              onClick={() => submitEdit(deal.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              type="button"
                              onClick={cancelEdit}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => startEdit(deal)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          onClick={() => startLog(deal.id)}
                          disabled={loading}
                        >
                          Log activity
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          type="button"
                          onClick={() => deleteDeal(deal.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </div>
                      {isLogging ? (
                        <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                          <div className="flex flex-col gap-2 md:flex-row">
                            <label className="flex-1 text-sm">
                              Type
                              <input
                                className="border-border bg-background text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={logState.activityType}
                                onChange={(event) =>
                                  setLogForm((prev) => ({
                                    ...prev,
                                    [deal.id]: {
                                      ...prev[deal.id],
                                      activityType: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label className="flex-2 text-sm">
                              Summary
                              <input
                                className="border-border bg-background text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={logState.summary}
                                onChange={(event) =>
                                  setLogForm((prev) => ({
                                    ...prev,
                                    [deal.id]: {
                                      ...prev[deal.id],
                                      summary: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => submitLog(deal.id)}
                              disabled={loading}
                            >
                              Save note
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              type="button"
                              onClick={() => setLoggingId(null)}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


