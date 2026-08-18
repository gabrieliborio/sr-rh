import type { SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "@/types/store";

// Resolves which store an employee belonged to on a given date, via
// employee_store_history — so a retroactive discount calculation (e.g. an
// absence logged after a transfer) uses the rate and holiday scope of the
// store the employee actually was at, not wherever they are today.
export async function getStoreAsOfDate(
  supabase: SupabaseClient,
  employeeId: string,
  date: string,
): Promise<Store | null> {
  const { data } = await supabase
    .from("employee_store_history")
    .select("store_id, stores(*)")
    .eq("employee_id", employeeId)
    .lte("start_date", date)
    .or(`end_date.is.null,end_date.gte.${date}`)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle<{ store_id: string; stores: Store }>();

  return data?.stores ?? null;
}
