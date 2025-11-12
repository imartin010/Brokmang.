"use client";

import { PnLStatement } from "./pnl-statement";

type PnLStatementClientProps = {
  businessUnitId?: string;
};

export function PnLStatementClient({ businessUnitId }: PnLStatementClientProps) {
  return <PnLStatement businessUnitId={businessUnitId} />;
}

