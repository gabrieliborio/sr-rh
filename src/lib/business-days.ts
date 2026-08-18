import type { SupabaseClient } from "@supabase/supabase-js";

type HolidayScope = "nacional" | "ceara" | "fortaleza";

// National and state (Ceará) holidays always apply. Fortaleza-scope
// holidays only apply to stores flagged `observes_fortaleza_holidays`
// (false for stores in their own municipality, e.g. Caucaia, Maracanaú).
export function getStoreHolidayScopes(observesFortalezaHolidays: boolean): HolidayScope[] {
  if (!observesFortalezaHolidays) return ["nacional", "ceara"];
  return ["nacional", "ceara", "fortaleza"];
}

// Business days between two dates (inclusive), excluding Sat/Sun and any
// holiday from `holidays` whose scope applies to the store.
export async function getBusinessDays(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
  observesFortalezaHolidays: boolean,
): Promise<number> {
  const scopes = getStoreHolidayScopes(observesFortalezaHolidays);

  const { data: holidays } = await supabase
    .from("holidays")
    .select("date, scope")
    .gte("date", startDate)
    .lte("date", endDate)
    .in("scope", scopes);

  const holidayDates = new Set((holidays ?? []).map((h: { date: string }) => h.date));

  let count = 0;
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const iso = current.toISOString().slice(0, 10);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(iso)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}
