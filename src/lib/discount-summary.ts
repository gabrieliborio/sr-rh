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
  // true when the employee's store couldn't be resolved for this date (gap
  // in employee_store_history) — shown as needing attention instead of a
  // silently-missing discount.
  unresolved?: boolean;
};

type StoreRef = { name: string; observes_fortaleza_holidays: boolean } | null;

type CertificateRow = {
  id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  vt_discount_value: number;
  meal_discount_value: number;
  discount_applied: boolean;
  stores: StoreRef;
};

type VacationRow = {
  id: string;
  start_date: string;
  end_date: string;
  days_count: number | null;
  discount_calculated: boolean;
  vt_discount_value: number;
  meal_discount_value: number;
  discount_applied: boolean;
  stores: StoreRef;
};

type AbsenceRow = { id: string; date: string; justified: boolean };

// A certificate/vacation can span past the queried month's boundary. Its
// vt/meal totals were computed for the *whole* record, so a record only
// partially inside [periodStart, periodEnd] has its totals prorated by the
// share of business days that actually fall in this period — otherwise the
// full amount would count in one month and nothing in the other.
async function periodShare(
  supabase: SupabaseClient,
  row: { start_date: string; end_date: string; days_count: number | null; vt_discount_value: number; meal_discount_value: number },
  store: StoreRef,
  periodStart: string,
  periodEnd: string,
): Promise<{ daysCount: number; vtValue: number; mealValue: number }> {
  const totalDays = row.days_count ?? 0;
  const fullyContained = row.start_date >= periodStart && row.end_date <= periodEnd;

  if (!store || totalDays === 0 || fullyContained) {
    return { daysCount: totalDays, vtValue: row.vt_discount_value, mealValue: row.meal_discount_value };
  }

  const clampedStart = row.start_date > periodStart ? row.start_date : periodStart;
  const clampedEnd = row.end_date < periodEnd ? row.end_date : periodEnd;
  const daysInPeriod = await getBusinessDays(supabase, clampedStart, clampedEnd, store.observes_fortaleza_holidays);
  const fraction = daysInPeriod / totalDays;

  return {
    daysCount: daysInPeriod,
    vtValue: Math.round(row.vt_discount_value * fraction * 100) / 100,
    mealValue: Math.round(row.meal_discount_value * fraction * 100) / 100,
  };
}

export async function getEmployeeDiscountSummary(
  supabase: SupabaseClient,
  employeeId: string,
  periodStart: string,
  periodEnd: string,
): Promise<{ events: DiscountEvent[]; totals: { vt: number; meal: number; total: number } }> {
  const events: DiscountEvent[] = [];

  // Overlap with the period, not just a start_date inside it — a record
  // starting in a previous month but ending in this one still owes a
  // (prorated) discount here.
  const { data: certificates } = await supabase
    .from("medical_certificates")
    .select(
      "id, start_date, end_date, days_count, vt_discount_value, meal_discount_value, discount_applied, stores(name, observes_fortaleza_holidays)",
    )
    .eq("employee_id", employeeId)
    .lte("start_date", periodEnd)
    .gte("end_date", periodStart)
    .returns<CertificateRow[]>();

  for (const cert of certificates ?? []) {
    const share = await periodShare(supabase, cert, cert.stores, periodStart, periodEnd);
    events.push({
      source: "atestado",
      recordId: cert.id,
      date: cert.start_date,
      dateRangeLabel: `${cert.start_date} a ${cert.end_date}`,
      daysCount: share.daysCount,
      vtValue: share.vtValue,
      mealValue: share.mealValue,
      storeName: cert.stores?.name ?? null,
      applied: cert.discount_applied,
    });
  }

  const { data: vacations } = await supabase
    .from("vacations")
    .select(
      "id, start_date, end_date, days_count, discount_calculated, vt_discount_value, meal_discount_value, discount_applied, stores(name, observes_fortaleza_holidays)",
    )
    .eq("employee_id", employeeId)
    .eq("paid", false)
    .lte("start_date", periodEnd)
    .gte("end_date", periodStart)
    .returns<VacationRow[]>();

  for (const vac of vacations ?? []) {
    if (!vac.discount_calculated) {
      events.push({
        source: "ferias",
        recordId: vac.id,
        date: vac.start_date,
        dateRangeLabel: `${vac.start_date} a ${vac.end_date}`,
        daysCount: 0,
        vtValue: 0,
        mealValue: 0,
        storeName: null,
        applied: null,
        unresolved: true,
      });
      continue;
    }

    const share = await periodShare(supabase, vac, vac.stores, periodStart, periodEnd);
    events.push({
      source: "ferias",
      recordId: vac.id,
      date: vac.start_date,
      dateRangeLabel: `${vac.start_date} a ${vac.end_date}`,
      daysCount: share.daysCount,
      vtValue: share.vtValue,
      mealValue: share.mealValue,
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
    if (!store) {
      events.push({
        source: "falta",
        recordId: absence.id,
        date: absence.date,
        dateRangeLabel: absence.date,
        daysCount: 0,
        vtValue: 0,
        mealValue: 0,
        storeName: null,
        applied: null,
        unresolved: true,
      });
      continue;
    }

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
