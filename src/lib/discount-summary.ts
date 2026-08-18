import type { SupabaseClient } from "@supabase/supabase-js";
import { getBusinessDays } from "./business-days";
import { calculateDiscount } from "./certificate-discount";
import { getStoreAsOfDate } from "./employee-store";

export type DiscountEventSource = "atestado" | "ferias" | "falta";

export type DiscountEvent = {
  source: DiscountEventSource;
  recordId: string;
  date: string;
  dateRangeLabel: string;
  daysCount: number;
  vtValue: number;
  mealValue: number;
  storeName: string | null;
  // null for faltas — there's no persisted "applied" state at that level,
  // the aggregate total here is informational for the RH to apply manually.
  applied: boolean | null;
};

type CertificateRow = {
  id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  vt_discount_value: number;
  meal_discount_value: number;
  discount_applied: boolean;
  stores: { name: string } | null;
};

type VacationRow = {
  id: string;
  start_date: string;
  end_date: string;
  days_count: number | null;
  vt_discount_value: number;
  meal_discount_value: number;
  discount_applied: boolean;
  stores: { name: string } | null;
};

type AbsenceRow = { id: string; date: string; justified: boolean };

export async function getEmployeeDiscountSummary(
  supabase: SupabaseClient,
  employeeId: string,
  periodStart: string,
  periodEnd: string,
): Promise<{ events: DiscountEvent[]; totals: { vt: number; meal: number; total: number } }> {
  const events: DiscountEvent[] = [];

  const { data: certificates } = await supabase
    .from("medical_certificates")
    .select("id, start_date, end_date, days_count, vt_discount_value, meal_discount_value, discount_applied, stores(name)")
    .eq("employee_id", employeeId)
    .gte("start_date", periodStart)
    .lte("start_date", periodEnd)
    .returns<CertificateRow[]>();

  for (const cert of certificates ?? []) {
    events.push({
      source: "atestado",
      recordId: cert.id,
      date: cert.start_date,
      dateRangeLabel: `${cert.start_date} a ${cert.end_date}`,
      daysCount: cert.days_count,
      vtValue: cert.vt_discount_value,
      mealValue: cert.meal_discount_value,
      storeName: cert.stores?.name ?? null,
      applied: cert.discount_applied,
    });
  }

  const { data: vacations } = await supabase
    .from("vacations")
    .select("id, start_date, end_date, days_count, vt_discount_value, meal_discount_value, discount_applied, stores(name)")
    .eq("employee_id", employeeId)
    .eq("paid", false)
    .eq("discount_calculated", true)
    .gte("start_date", periodStart)
    .lte("start_date", periodEnd)
    .returns<VacationRow[]>();

  for (const vac of vacations ?? []) {
    events.push({
      source: "ferias",
      recordId: vac.id,
      date: vac.start_date,
      dateRangeLabel: `${vac.start_date} a ${vac.end_date}`,
      daysCount: vac.days_count ?? 0,
      vtValue: vac.vt_discount_value,
      mealValue: vac.meal_discount_value,
      storeName: vac.stores?.name ?? null,
      applied: vac.discount_applied,
    });
  }

  const { data: absences } = await supabase
    .from("employee_absences")
    .select("id, date, justified")
    .eq("employee_id", employeeId)
    .eq("justified", false)
    .gte("date", periodStart)
    .lte("date", periodEnd)
    .returns<AbsenceRow[]>();

  for (const absence of absences ?? []) {
    const store = await getStoreAsOfDate(supabase, employeeId, absence.date);
    if (!store) continue;

    const daysCount = await getBusinessDays(supabase, absence.date, absence.date, store.observes_fortaleza_holidays);
    if (daysCount === 0) continue; // fell on a weekend/holiday — nothing to discount

    const { vtDiscountValue, mealDiscountValue } = calculateDiscount(store, daysCount);
    events.push({
      source: "falta",
      recordId: absence.id,
      date: absence.date,
      dateRangeLabel: absence.date,
      daysCount,
      vtValue: vtDiscountValue,
      mealValue: mealDiscountValue,
      storeName: store.name,
      applied: null,
    });
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  const totals = events.reduce(
    (acc, event) => ({
      vt: acc.vt + event.vtValue,
      meal: acc.meal + event.mealValue,
      total: acc.total + event.vtValue + event.mealValue,
    }),
    { vt: 0, meal: 0, total: 0 },
  );

  return { events, totals };
}
