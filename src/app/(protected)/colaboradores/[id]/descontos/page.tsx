import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeDiscountSummary, type DiscountEventSource } from "@/lib/discount-summary";
import { Badge } from "@/components/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton, Button } from "@/components/ui/button";
import { tableWrapClass, theadRowClass, thClass, trClass } from "@/components/ui/table";
import { markDiscountApplied } from "../atestados/actions";
import { markVacationDiscountApplied } from "../records-actions";
import type { Employee } from "@/types/employee";

const SOURCE_LABELS: Record<DiscountEventSource, string> = {
  atestado: "Atestado",
  ferias: "Férias",
  falta: "Falta",
};

const SOURCE_TONE: Record<DiscountEventSource, "blue" | "green" | "amber"> = {
  atestado: "blue",
  ferias: "green",
  falta: "amber",
};

export default async function DescontosPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month: monthParam } = await searchParams;
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name")
    .eq("id", id)
    .maybeSingle<Pick<Employee, "id" | "name">>();

  if (!employee) notFound();

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = Number(monthParam.slice(0, 4));
    month = Number(monthParam.slice(5, 7));
  }

  const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const periodEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { events, totals } = await getEmployeeDiscountSummary(supabase, id, periodStart, periodEnd);

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);
  const prevMonthParam = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${id}` },
          { label: "Descontos" },
        ]}
        title={`Descontos — ${employee.name}`}
        description="Soma de atestados, férias não pagas e faltas não justificadas no período — sempre para aplicação manual pelo RH."
        actions={
          <>
            <LinkButton href={`/colaboradores/${id}/descontos?month=${prevMonthParam}`} variant="secondary" size="sm">
              <ChevronLeft size={15} strokeWidth={1.5} />
              Mês anterior
            </LinkButton>
            <LinkButton href={`/colaboradores/${id}/descontos?month=${nextMonthParam}`} variant="secondary" size="sm">
              Próximo mês
              <ChevronRight size={15} strokeWidth={1.5} />
            </LinkButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="font-mono text-2xl text-ink">R$ {totals.vt.toFixed(2)}</p>
            <p className="mt-1 text-sm text-ink-muted">Total VT</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="font-mono text-2xl text-ink">R$ {totals.meal.toFixed(2)}</p>
            <p className="mt-1 text-sm text-ink-muted">Total iFood/refeição</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="font-mono text-2xl text-ink">R$ {totals.total.toFixed(2)}</p>
            <p className="mt-1 text-sm text-ink-muted">Total geral</p>
          </CardBody>
        </Card>
      </div>

      {events.length === 0 ? (
        <EmptyState message="Nenhum evento de desconto neste mês — atestados, férias não pagas e faltas não justificadas aparecem aqui." />
      ) : (
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Tipo</th>
                <th className={thClass}>Data</th>
                <th className={thClass}>Dias</th>
                <th className={thClass}>Loja usada</th>
                <th className={thClass}>VT</th>
                <th className={thClass}>Alimentação</th>
                <th className={thClass}>Status</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={`${event.source}-${event.recordId}`} className={trClass}>
                  <td className="px-4 py-2">
                    <Badge tone={SOURCE_TONE[event.source]}>{SOURCE_LABELS[event.source]}</Badge>
                  </td>
                  <td className="px-4 py-2 font-mono text-sm text-ink-muted">{event.dateRangeLabel}</td>
                  <td className="px-4 py-2 font-mono text-sm text-ink">{event.unresolved ? "—" : event.daysCount}</td>
                  <td className="px-4 py-2 text-sm text-ink-muted">
                    {event.unresolved ? (
                      <span className="text-danger">Loja não identificada</span>
                    ) : (
                      event.storeName ?? "—"
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm text-ink">{event.unresolved ? "—" : `R$ ${event.vtValue.toFixed(2)}`}</td>
                  <td className="px-4 py-2 font-mono text-sm text-ink">{event.unresolved ? "—" : `R$ ${event.mealValue.toFixed(2)}`}</td>
                  <td className="px-4 py-2">
                    {event.unresolved ? (
                      <Badge tone="amber">Verificar histórico de loja</Badge>
                    ) : event.applied === null ? (
                      <span className="text-xs text-ink-muted">—</span>
                    ) : (
                      <Badge tone={event.applied ? "green" : "amber"}>
                        {event.applied ? "Aplicado" : "Pendente"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {event.source === "atestado" && !event.applied && (
                      <form action={markDiscountApplied.bind(null, id, event.recordId)}>
                        <Button type="submit" variant="secondary" size="sm" className="!h-7 !px-2.5 !text-xs">
                          Marcar como aplicado
                        </Button>
                      </form>
                    )}
                    {event.source === "ferias" && !event.applied && !event.unresolved && (
                      <form action={markVacationDiscountApplied.bind(null, id, event.recordId)}>
                        <Button type="submit" variant="secondary" size="sm" className="!h-7 !px-2.5 !text-xs">
                          Marcar como aplicado
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
