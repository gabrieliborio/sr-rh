"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { notifyInstallment } from "./actions";

export function NotifyButton({ employeeId, installmentId }: { employeeId: string; installmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await notifyInstallment(employeeId, installmentId);
            if (result.error) setError(result.error);
          });
        }}
      >
        {isPending ? "Enviando..." : "Notificar via WhatsApp"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
