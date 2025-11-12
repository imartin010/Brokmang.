"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";

export function MeetingLogForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    developerName: "",
    projectName: "",
    destination: "",
    outcome: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create meeting record with status "completed"
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${formData.projectName} - ${formData.developerName}`,
          description: formData.outcome || `Meeting at ${formData.destination}`,
          meetingDate: new Date().toISOString().split("T")[0], // Today's date
          meetingTime: new Date().toTimeString().split(" ")[0].substring(0, 5), // Current time HH:MM
          durationMinutes: 60,
          location: formData.destination,
          status: "completed",
          outcome: formData.outcome || undefined,
        }),
      });

      if (response.ok) {
        alert("Meeting details logged successfully!");
        setFormData({
          developerName: "",
          projectName: "",
          destination: "",
          outcome: "",
          notes: "",
        });
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to log meeting");
      }
    } catch (error) {
      console.error("Failed to log meeting:", error);
      alert("Failed to log meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Developer Name - Required */}
      <div>
        <label htmlFor="developerName" className="block text-sm font-medium mb-2">
          Developer Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="developerName"
          value={formData.developerName}
          onChange={(e) => setFormData({ ...formData, developerName: e.target.value })}
          placeholder="e.g., Emaar Properties"
          required
          className="w-full"
        />
      </div>

      {/* Project Name - Required */}
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium mb-2">
          Project Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="projectName"
          value={formData.projectName}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          placeholder="e.g., The Pearl Tower"
          required
          className="w-full"
        />
      </div>

      {/* Destination - Required */}
      <div>
        <label htmlFor="destination" className="block text-sm font-medium mb-2">
          Destination <span className="text-red-500">*</span>
        </label>
        <Input
          id="destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          placeholder="e.g., New Cairo, Downtown Dubai"
          required
          className="w-full"
        />
      </div>

      {/* Meeting Outcome - Optional */}
      <div>
        <label htmlFor="outcome" className="block text-sm font-medium mb-2">
          Meeting Outcome <span className="text-muted-foreground text-xs">(Optional)</span>
        </label>
        <textarea
          id="outcome"
          value={formData.outcome}
          onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
          placeholder="Describe what happened in the meeting, client feedback, next steps..."
          className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={4}
        />
      </div>

      {/* Additional Notes - Optional */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          Additional Notes <span className="text-muted-foreground text-xs">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional information..."
          className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !formData.developerName || !formData.projectName || !formData.destination}
        className="w-full h-11 bg-green-600 hover:bg-green-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging meeting...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Log Meeting Details
          </>
        )}
      </Button>
    </form>
  );
}

