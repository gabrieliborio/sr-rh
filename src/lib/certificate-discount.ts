import type { Store } from "@/types/store";

// VT/meal rates now live on the store itself (resolved as of the event
// date via employee_store_history) rather than a generic per-unit config
// table — this is a pure calculation over whatever store was resolved.
export function calculateDiscount(store: Pick<Store, "transport_benefit_value" | "meal_benefit_value">, daysCount: number) {
  const vtDiscountValue = round2(store.transport_benefit_value * daysCount);
  const mealDiscountValue = round2(store.meal_benefit_value * daysCount);

  return {
    vtDiscountValue,
    mealDiscountValue,
    totalDiscountValue: round2(vtDiscountValue + mealDiscountValue),
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
