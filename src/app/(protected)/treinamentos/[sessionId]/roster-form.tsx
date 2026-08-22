"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";

export type RosterEmployee = {
  id: string;
  name: string;
  employeeNumber: string;
  storeName: string | null;
  certificateCode: string | null;
};

export function RosterForm({
  action,
  employees,
  attendedIds,
}: {
  action: (formData: FormData) => Promise<void> | void;
  employees: RosterEmployee[];
  attendedIds: string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const attended = useMemo(() => new Set(attendedIds), [attendedIds]);

  const stores = useMemo(
    () => Array.from(new Set(employees.map((e) => e.storeName).filter((s): s is string => Boolean(s)))).sort(),
    [employees],
  );

  function matches(employee: RosterEmployee) {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || employee.name.toLowerCase().includes(q) || employee.employeeNumber.toLowerCase().includes(q);
    const matchesStore = !storeFilter || employee.storeName === storeFilter;
    return matchesQuery && matchesStore;
  }

  function setVisibleChecked(checked: boolean) {
    const form = formRef.current;
    if (!form) return;
    for (const employee of employees) {
      if (!matches(employee)) continue;
      const input = form.querySelector<HTMLInputElement>(`#present-${employee.id}`);
      if (input) input.checked = checked;
    }
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={15}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou matrícula"
            className="w-full rounded-[var(--radius-control)] border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
        </div>
        <Select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="w-auto">
          <option value="">Todas as lojas</option>
          {stores.map((store) => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" size="sm" onClick={() => setVisibleChecked(true)}>
          Selecionar todos
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setVisibleChecked(false)}>
          Limpar seleção
        </Button>
      </div>

      <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface">
        {employees.map((employee) => (
          <li
            key={employee.id}
            className={`flex items-center gap-3 px-4 py-2.5 ${matches(employee) ? "" : "hidden"}`}
          >
            <input type="hidden" name="candidate_employee_ids" value={employee.id} />
            <input
              id={`present-${employee.id}`}
              type="checkbox"
              name="employee_ids"
              value={employee.id}
              defaultChecked={attended.has(employee.id)}
              className="h-4 w-4 shrink-0 rounded border-border text-accent accent-[var(--color-accent)]"
            />
            <label htmlFor={`present-${employee.id}`} className="flex-1 cursor-pointer text-sm text-ink">
              {employee.name}
              <span className="ml-2 font-mono text-xs text-ink-muted">{employee.employeeNumber}</span>
            </label>
            <span className="text-xs text-ink-muted">{employee.storeName ?? "—"}</span>
            {employee.certificateCode && (
              <a
                href={`/certificados/${employee.certificateCode}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-tint hover:underline"
              >
                Certificado
              </a>
            )}
          </li>
        ))}
      </ul>

      <Button type="submit">Salvar presença</Button>
    </form>
  );
}
