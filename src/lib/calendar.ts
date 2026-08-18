import type { SupabaseClient } from "@supabase/supabase-js";

export type CalendarEventType =
  | "aniversario"
  | "ferias"
  | "desconto"
  | "licenca_vencendo"
  | "avaliacao"
  | "pagamento_compra";

export type CalendarEvent = {
  date: string;
  type: CalendarEventType;
  title: string;
  relatedTable: string;
  relatedId: string;
  employeePhone?: string | null;
  employeeName?: string | null;
};

const TYPE_LABELS: Record<CalendarEventType, string> = {
  aniversario: "Aniversário",
  ferias: "Férias",
  desconto: "Desconto (atestado)",
  licenca_vencendo: "Licença vencendo",
  avaliacao: "Fim do período de avaliação",
  pagamento_compra: "Parcela a vencer",
};

export function typeLabel(type: CalendarEventType) {
  return TYPE_LABELS[type];
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function getCalendarEvents(
  supabase: SupabaseClient,
  year: number,
  month: number,
): Promise<CalendarEvent[]> {
  const monthStart = toIso(year, month, 1);
  const monthEnd = toIso(year, month, daysInMonth(year, month));
  const events: CalendarEvent[] = [];

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, phone, birth_date, evaluation_30_date, evaluation_90_date")
    .neq("status", "desligado")
    .returns<
      {
        id: string;
        name: string;
        phone: string | null;
        birth_date: string | null;
        evaluation_30_date: string;
        evaluation_90_date: string;
      }[]
    >();

  for (const employee of employees ?? []) {
    if (employee.birth_date) {
      const birthMonth = Number(employee.birth_date.slice(5, 7));
      if (birthMonth === month) {
        const day = Number(employee.birth_date.slice(8, 10));
        events.push({
          date: toIso(year, month, day),
          type: "aniversario",
          title: `Aniversário de ${employee.name}`,
          relatedTable: "employees",
          relatedId: employee.id,
          employeePhone: employee.phone,
          employeeName: employee.name,
        });
      }
    }

    if (employee.evaluation_30_date >= monthStart && employee.evaluation_30_date <= monthEnd) {
      events.push({
        date: employee.evaluation_30_date,
        type: "avaliacao",
        title: `Fim da avaliação de 30 dias — ${employee.name}`,
        relatedTable: "employees",
        relatedId: employee.id,
      });
    }
    if (employee.evaluation_90_date >= monthStart && employee.evaluation_90_date <= monthEnd) {
      events.push({
        date: employee.evaluation_90_date,
        type: "avaliacao",
        title: `Fim da avaliação de 90 dias — ${employee.name}`,
        relatedTable: "employees",
        relatedId: employee.id,
      });
    }
  }

  const { data: vacations } = await supabase
    .from("vacations")
    .select("id, start_date, employee_id, employees(name, phone)")
    .gte("start_date", monthStart)
    .lte("start_date", monthEnd)
    .returns<{ id: string; start_date: string; employee_id: string; employees: { name: string; phone: string | null } | null }[]>();

  for (const vacation of vacations ?? []) {
    events.push({
      date: vacation.start_date,
      type: "ferias",
      title: `Início das férias — ${vacation.employees?.name ?? "Colaborador"}`,
      relatedTable: "vacations",
      relatedId: vacation.id,
      employeePhone: vacation.employees?.phone,
      employeeName: vacation.employees?.name,
    });
  }

  const { data: certificates } = await supabase
    .from("medical_certificates")
    .select("id, start_date, discount_applied, total_discount_value, employee_id, employees(name)")
    .gte("start_date", monthStart)
    .lte("start_date", monthEnd)
    .returns<
      {
        id: string;
        start_date: string;
        discount_applied: boolean;
        total_discount_value: number;
        employee_id: string;
        employees: { name: string } | null;
      }[]
    >();

  for (const cert of certificates ?? []) {
    events.push({
      date: cert.start_date,
      type: "desconto",
      title: `Atestado de ${cert.employees?.name ?? "colaborador"} — desconto R$ ${cert.total_discount_value.toFixed(2)}${cert.discount_applied ? " (aplicado)" : " (pendente)"}`,
      relatedTable: "medical_certificates",
      relatedId: cert.id,
    });
  }

  const { data: licenses } = await supabase
    .from("store_licenses")
    .select("id, expiry_date, type, store_id, stores(name)")
    .gte("expiry_date", monthStart)
    .lte("expiry_date", monthEnd)
    .returns<{ id: string; expiry_date: string; type: string; store_id: string; stores: { name: string } | null }[]>();

  for (const license of licenses ?? []) {
    events.push({
      date: license.expiry_date,
      type: "licenca_vencendo",
      title: `Licença (${license.type}) de ${license.stores?.name ?? "loja"} vence`,
      relatedTable: "store_licenses",
      relatedId: license.id,
    });
  }

  const { data: installments } = await supabase
    .from("employee_purchase_installments")
    .select("id, due_date, value, whatsapp_notified, purchase_id, employee_purchases(employee_id, employees(name, phone))")
    .gte("due_date", monthStart)
    .lte("due_date", monthEnd)
    .eq("status", "nao_pago")
    .returns<
      {
        id: string;
        due_date: string;
        value: number;
        whatsapp_notified: boolean;
        purchase_id: string;
        employee_purchases: { employee_id: string; employees: { name: string; phone: string | null } | null } | null;
      }[]
    >();

  for (const installment of installments ?? []) {
    const employee = installment.employee_purchases?.employees;
    events.push({
      date: installment.due_date,
      type: "pagamento_compra",
      title: `Parcela de R$ ${installment.value.toFixed(2)} — ${employee?.name ?? "colaborador"}${installment.whatsapp_notified ? " (notificado)" : ""}`,
      relatedTable: "employee_purchase_installments",
      relatedId: installment.id,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
