export type EvaluationBadge = {
  label: string;
  tone: "blue" | "neutral";
};

// hire_date/eval30/eval90 come from Postgres `date` columns (YYYY-MM-DD).
// Comparing the strings directly avoids timezone drift from `new Date(...)`.
export function getEvaluationBadge(
  evaluation30Date: string,
  evaluation90Date: string,
): EvaluationBadge {
  const today = new Date().toISOString().slice(0, 10);

  if (today <= evaluation30Date) {
    return { label: "Em período de avaliação (30 dias)", tone: "blue" };
  }

  if (today <= evaluation90Date) {
    return { label: "Em período de avaliação (90 dias)", tone: "blue" };
  }

  return { label: "Fora do período de avaliação", tone: "neutral" };
}

// 0 at hire_date, 1 at the 90-day mark — feeds the evaluation progress ring
// in the employee file. Purely presentational, added alongside the badge
// above rather than replacing it.
export function getEvaluationProgress(hireDate: string, evaluation90Date: string): number {
  const start = new Date(`${hireDate}T00:00:00`).getTime();
  const end = new Date(`${evaluation90Date}T00:00:00`).getTime();
  const now = Date.now();
  if (end <= start) return 1;
  return (now - start) / (end - start);
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`).getTime();
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - todayMidnight) / (1000 * 60 * 60 * 24));
}
