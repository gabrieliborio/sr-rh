import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { RingDot } from "@/components/ui/ring";
import type { Tone } from "@/components/ui/tokens";
import { getCalendarEvents, typeLabel, type CalendarEventType } from "@/lib/calendar";
import { buildMonthGrid } from "@/lib/calendar-grid";
import { CalendarNotifyButton } from "./calendar-notify-button";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EVENT_TONE: Record<CalendarEventType, Tone> = {
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const todayIso = now.toLocaleDateString("en-CA", { timeZone: "America/Fortaleza" });
  const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);

  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = Number(monthParam.slice(0, 4));
    month = Number(monthParam.slice(5, 7));
  }

  const [
    { count: activeCount },
    { count: evaluationCount },
    { count: pendingDiscountCount },
    { count: expiringLicensesCount },
    { count: dueInstallmentsCount },
    events,
  ] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .neq("status", "desligado")
      .gte("evaluation_90_date", todayIso),
    supabase
      .from("medical_certificates")
      .select("id", { count: "exact", head: true })
      .eq("discount_applied", false),
    supabase
      .from("store_licenses")
      .select("id", { count: "exact", head: true })
      .not("expiry_date", "is", null)
      .lte("expiry_date", in30Days),
    supabase
      .from("employee_purchase_installments")
      .select("id", { count: "exact", head: true })
      .eq("status", "nao_pago")
      .lte("due_date", in30Days),
    getCalendarEvents(supabase, year, month),
  ]);

  const stats: { label: string; value: number; tone: Tone; href: string }[] = [
    { label: "Colaboradores ativos", value: activeCount ?? 0, tone: "blue", href: "/colaboradores" },
    { label: "Em período de avaliação", value: evaluationCount ?? 0, tone: "accent", href: "/colaboradores" },
    { label: "Descontos de atestado pendentes", value: pendingDiscountCount ?? 0, tone: "amber", href: "/colaboradores" },
    { label: "Licenças vencendo em 30 dias", value: expiringLicensesCount ?? 0, tone: "red", href: "/lojas" },
    { label: "Parcelas a vencer em 30 dias", value: dueInstallmentsCount ?? 0, tone: "amber", href: "/colaboradores" },
  ];

  const eventsByDay = new Map<string, typeof events>();
  for (const event of events) {
    const list = eventsByDay.get(event.date) ?? [];
    list.push(event);
    eventsByDay.set(event.date, list);
  }

  const cells = buildMonthGrid(year, month);

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);
  const prevMonthParam = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <PageHeader
        eyebrow="Painel"
        title="Início"
        description="Visão geral do dia a dia de RH — colaboradores, avaliações, atestados, licenças, pagamentos e o calendário do mês."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-colors hover:border-accent/40">
              <CardBody className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-3xl tabular-nums text-ink">{stat.value}</p>
                  <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
                </div>
                <RingDot tone={stat.tone} size={11} />
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">
                {MONTH_NAMES[month - 1]} {year}
              </h2>
              <div className="flex gap-2">
                <LinkButton href={`/?month=${prevMonthParam}`} variant="secondary" size="sm">
                  <ChevronLeft size={15} strokeWidth={1.5} />
                </LinkButton>
                <LinkButton href={`/?month=${nextMonthParam}`} variant="secondary" size="sm">
                  <ChevronRight size={15} strokeWidth={1.5} />
                </LinkButton>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="pb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {label}
                </div>
              ))}

              {cells.map((cell) => {
                const dayEvents = eventsByDay.get(cell.date) ?? [];
                const types = Array.from(new Set(dayEvents.map((e) => e.type)));
                const isToday = cell.date === todayIso;

                return (
                  <div
                    key={cell.date}
                    className={`flex min-h-[64px] flex-col items-center gap-1 rounded-[var(--radius-control)] border py-1.5 ${
                      isToday
                        ? "border-accent bg-accent/10"
                        : cell.inMonth
                          ? "border-transparent"
                          : "border-transparent opacity-40"
                    }`}
                  >
                    <span className={`font-mono text-xs ${isToday ? "font-semibold text-accent" : "text-ink"}`}>
                      {cell.day}
                    </span>
                    {types.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-0.5 px-1">
                        {types.map((type) => (
                          <RingDot key={type} tone={EVENT_TONE[type]} size={6} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-ink">Lembretes do mês</h2>

            {events.length === 0 ? (
              <EmptyState message="Nenhum evento neste mês — aniversários, férias, atestados, licenças e parcelas aparecem aqui automaticamente." />
            ) : (
              <ul className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {events.map((event, index) => (
                  <li key={`${event.relatedTable}-${event.relatedId}-${index}`} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-muted">
                        {event.date.slice(8, 10)}/{event.date.slice(5, 7)}
                      </span>
                      <Badge tone={EVENT_TONE[event.type]}>{typeLabel(event.type)}</Badge>
                    </div>
                    <p className="text-sm text-ink">{event.title}</p>
                    {NOTIFIABLE_TYPES.includes(event.type) && event.employeePhone && event.employeeName && (
                      <div className="mt-1.5">
                        <CalendarNotifyButton
                          type={event.type}
                          relatedTable={event.relatedTable}
                          relatedId={event.relatedId}
                          phone={event.employeePhone}
                          message={buildMessage(event.type, event.employeeName)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <h2 className="mb-3 text-sm font-semibold text-ink">Atalhos</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/colaboradores/novo" className="text-tint hover:text-ink hover:underline">
              Cadastrar colaborador
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
