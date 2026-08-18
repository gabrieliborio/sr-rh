import type { ReactNode } from "react";

// Always phrase `message` as an objective next action, e.g. "Nenhum atestado
// registrado — anexe o primeiro atestado para começar o cálculo de desconto."
// Never a bare "Nenhum dado encontrado".
export function EmptyState({
  message,
  action,
  className = "",
}: {
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-dashed border-border bg-surface/60 px-5 py-8 text-center ${className}`}
    >
      <p className="text-sm text-ink-muted">{message}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}
