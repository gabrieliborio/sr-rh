"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sendCalendarNotification } from "./calendar-actions";
import type { CalendarEventType } from "@/lib/calendar";

export function CalendarNotifyButton({
  type,
  relatedTable,
  relatedId,
  phone,
  message,
}: {
  type: CalendarEventType;
  relatedTable: string;
  relatedId: string;
  phone: string;
  message: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return <span className="text-xs text-success">Notificado</span>;
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="!h-7 !px-2.5 !text-xs"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await sendCalendarNotification(type, relatedTable, relatedId, phone, message);
            if (result.error) setError(result.error);
            else setSent(true);
          });
        }}
      >
        {isPending ? "Enviando..." : "Notificar"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
