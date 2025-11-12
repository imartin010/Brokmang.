"use client";

import { ReportGenerator } from "./report-generator";

type ReportGeneratorClientProps = {
  type: "agent" | "team" | "business-unit";
  agentId?: string;
  teamId?: string;
  buId?: string;
};

export function ReportGeneratorClient({
  type,
  agentId,
  teamId,
  buId,
}: ReportGeneratorClientProps) {
  return <ReportGenerator type={type} agentId={agentId} teamId={teamId} buId={buId} />;
}

