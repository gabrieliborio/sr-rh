import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { getCalendarEvents, typeLabel, type CalendarEventType } from "@/lib/calendar";
import { CalendarNotifyButton } from "./notify-button";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const EVENT_TONE: Record<CalendarEventType, "green" | "blue" | "amber" | "red" | "neutral"> = {
  aniversario: "blue",
  ferias: "green",
  desconto: "amber",
  licenca_vencendo: "red",
  avaliacao: "neutral",
  pagamento_compra: "amber",
};

// Only events that map to a single, contactable employee get a notify
// button — WhatsApp reminders to a store or an internal deadline don't apply.
const NOTIFIABLE_TYPES: CalendarEventType[] = ["aniversario", "ferias"];

function buildMessage(type: CalendarEventType, employeeName: string) {
  if (type === "aniversario") return `Feliz aniversário, ${employeeName}! 🎉 Equipe Sr. RH.`;
  return `Olá ${employeeName}, passando para lembrar do início das suas férias este mês.`;
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = Number(monthParam.slice(0, 4));
    month = Number(monthParam.slice(5, 7));
  }

  const supabase = await createClient();
  const events = await getCalendarEvents(supabase, year, month);

  const eventsByDay = new Map<string, typeof events>();
  for (const event of events) {
    const list = eventsByDay.get(event.date) ?? [];
    list.push(event);
    eventsByDay.set(event.date, list);
  }

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);
  const prevMonthParam = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <PageHeader
        eyebrow="Central de notificações"
        title={`${MONTH_NAMES[month - 1]} ${year}`}
        actions={
          <>
            <LinkButton href={`/calendario?month=${prevMonthParam}`} variant="secondary" size="sm">
              <ChevronLeft size={15} strokeWidth={1.5} />
              Mês anterior
            </LinkButton>
            <LinkButton href={`/calendario?month=${nextMonthParam}`} variant="secondary" size="sm">
              Próximo mês
              <ChevronRight size={15} strokeWidth={1.5} />
            </LinkButton>
          </>
        }
      />

      {eventsByDay.size === 0 && (
        <EmptyState message="Nenhum evento neste mês — aniversários, férias, atestados, licenças e parcelas aparecem aqui automaticamente." />
      )}

      <div className="space-y-3">
        {Array.from(eventsByDay.entries()).map(([date, dayEvents]) => (
          <Card key={date} className="flex gap-4 p-4">
            <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius-control)] bg-bg py-2">
              <span className="font-display text-xl leading-none text-ink">{date.slice(8, 10)}</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                {MONTH_NAMES[Number(date.slice(5, 7)) - 1].slice(0, 3)}
              </span>
            </div>
            <ul className="flex-1 space-y-2.5 py-0.5">
              {dayEvents.map((event, index) => (
                <li
                  key={`${event.relatedTable}-${event.relatedId}-${index}`}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <Badge tone={EVENT_TONE[event.type]}>{typeLabel(event.type)}</Badge>
                  <span className="text-ink">{event.title}</span>
                  {NOTIFIABLE_TYPES.includes(event.type) && event.employeePhone && event.employeeName && (
                    <CalendarNotifyButton
                      type={event.type}
                      relatedTable={event.relatedTable}
                      relatedId={event.relatedId}
                      phone={event.employeePhone}
                      message={buildMessage(event.type, event.employeeName)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
