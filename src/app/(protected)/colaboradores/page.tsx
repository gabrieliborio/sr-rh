import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { AvatarRing } from "@/components/ui/ring";
import type { Tone } from "@/components/ui/tokens";
import { EMPLOYEE_STATUS_BADGE_TONE, EMPLOYEE_STATUS_LABELS, type EmployeeStatus } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { tableWrapClass, theadRowClass, thClass, tdClass, tdMutedClass, trClass } from "@/components/ui/table";
import type { EmployeeListItem } from "@/types/employee";

const AVATAR_TONE: Record<EmployeeStatus, Tone> = {
  ativo: "blue",
  ferias: "amber",
  afastado: "amber",
  desligado: "neutral",
};

type Row = EmployeeListItem & { stores: { name: string } | null };

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("employees")
    .select("id, name, employee_number, store_id, role, status, stores!employees_store_id_fkey(name)")
    .order("name");

  if (q) {
    query = query.or(`employee_number.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: employees, error } = await query.returns<Row[]>();

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        description="Ficha completa de cada colaborador — dados, avaliação, atestados, compras e mais."
        actions={
          <LinkButton href="/colaboradores/novo">
            <UserPlus size={16} strokeWidth={1.75} />
            Novo colaborador
          </LinkButton>
        }
      />

      <form action="/colaboradores" method="get" className="mb-4 max-w-sm">
        <div className="relative">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome ou matrícula"
            className="w-full rounded-[var(--radius-control)] border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
        </div>
      </form>

      {error && <p className="text-sm text-danger">Não foi possível carregar os colaboradores.</p>}

      {!error && employees && employees.length === 0 && q && (
        <EmptyState message={`Nenhum colaborador encontrado para "${q}" — tente outro nome ou matrícula.`} />
      )}

      {!error && employees && employees.length === 0 && !q && (
        <EmptyState
          message="Nenhum colaborador cadastrado ainda — cadastre o primeiro para começar."
          action={<LinkButton href="/colaboradores/novo" size="sm">Novo colaborador</LinkButton>}
        />
      )}

      {!error && employees && employees.length > 0 && (
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Matrícula</th>
                <th className={thClass}>Loja</th>
                <th className={thClass}>Cargo</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`/colaboradores/${employee.id}`} className="flex items-center gap-3 font-medium text-ink hover:underline">
                      <AvatarRing name={employee.name} tone={AVATAR_TONE[employee.status]} size={28} />
                      {employee.name}
                    </Link>
                  </td>
                  <td className={`${tdMutedClass} font-mono`}>{employee.employee_number}</td>
                  <td className={tdMutedClass}>{employee.stores?.name ?? "—"}</td>
                  <td className={tdMutedClass}>{employee.role ?? "—"}</td>
                  <td className={tdClass}>
                    <Badge tone={EMPLOYEE_STATUS_BADGE_TONE[employee.status]}>
                      {EMPLOYEE_STATUS_LABELS[employee.status]}
                    </Badge>
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
