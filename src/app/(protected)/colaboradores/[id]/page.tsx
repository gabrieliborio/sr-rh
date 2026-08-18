import Link from "next/link";
import { notFound } from "next/navigation";
import { FileWarning, ShoppingBag, ChevronRight, CalendarX2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { EMPLOYEE_STATUS_BADGE_TONE, EMPLOYEE_STATUS_LABELS } from "@/lib/constants";
import { getEvaluationBadge, getEvaluationProgress, getDaysUntil } from "@/lib/evaluation";
import { AvatarRing, ProgressRing } from "@/components/ui/ring";
import type { Tone } from "@/components/ui/tokens";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/page-header";
import { Checkbox, Textarea } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { upsertOnboarding } from "../actions";
import { UniformSection } from "./sections/uniform-section";
import { DisciplinarySection } from "./sections/disciplinary-section";
import { NegotiationsSection } from "./sections/negotiations-section";
import { VacationsSection } from "./sections/vacations-section";
import { TrainingsSection } from "./sections/trainings-section";
import { AbsencesSection } from "./sections/absences-section";
import type { Employee, Onboarding } from "@/types/employee";
import type { Store } from "@/types/store";

type EmployeeWithStore = Employee & { stores: Store };

export default async function FichaColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: onboarding }] = await Promise.all([
    supabase.from("employees").select("*, stores!employees_store_id_fkey(*)").eq("id", id).maybeSingle<EmployeeWithStore>(),
    supabase.from("onboarding").select("*").eq("employee_id", id).maybeSingle<Onboarding>(),
  ]);

  if (!employee) notFound();

  let managerName: string | null = null;
  if (employee.stores.manager_id) {
    const { data } = await supabase
      .from("employees")
      .select("name")
      .eq("id", employee.stores.manager_id)
      .maybeSingle<{ name: string }>();
    managerName = data?.name ?? null;
  }

  const evaluationBadge = getEvaluationBadge(employee.evaluation_30_date, employee.evaluation_90_date);
  const inEvaluation = evaluationBadge.tone === "blue";
  const boundUpsertOnboarding = upsertOnboarding.bind(null, id);

  const registrationComplete = [
    employee.phone,
    employee.birth_date,
    employee.admission_exam_date,
    employee.role,
    employee.current_salary,
  ].every((field) => field !== null && field !== undefined && field !== "");

  const avatarTone: Tone =
    employee.status === "desligado"
      ? "neutral"
      : inEvaluation
        ? "accent"
        : employee.status === "ferias" || employee.status === "afastado"
          ? "amber"
          : "blue";

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Colaboradores", href: "/colaboradores" }, { label: employee.name }]} />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <AvatarRing name={employee.name} tone={avatarTone} size={56} />
          <div>
            <h1 className="font-display text-[28px] leading-tight text-ink sm:text-3xl">{employee.name}</h1>
            <p className="mt-1 font-mono text-sm text-ink-muted">
              #{employee.employee_number} · {employee.stores.name}
              {employee.role ? ` · ${employee.role}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={EMPLOYEE_STATUS_BADGE_TONE[employee.status]}>
                {EMPLOYEE_STATUS_LABELS[employee.status]}
              </Badge>
              <Badge tone={evaluationBadge.tone}>{evaluationBadge.label}</Badge>
              <Badge tone={onboarding?.completed ? "green" : "amber"}>
                {onboarding?.completed ? "Integração concluída" : "Integração pendente"}
              </Badge>
              <Badge tone={registrationComplete ? "green" : "amber"}>
                {registrationComplete ? "Registro completo" : "Registro incompleto"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <LinkButton href={`/colaboradores/${employee.id}/editar`} variant="secondary" size="sm">
            Editar
          </LinkButton>
          <LinkButton href={`/colaboradores/${employee.id}/desligamento`} variant="danger" size="sm">
            {employee.status === "desligado" ? "Ver desligamento" : "Demitir colaborador"}
          </LinkButton>
        </div>
      </div>

      {inEvaluation && (
        <Card className="mb-6">
          <CardBody className="flex items-center gap-4">
            <ProgressRing
              progress={getEvaluationProgress(employee.hire_date, employee.evaluation_90_date)}
              tone="accent"
              centerLabel={`${Math.max(getDaysUntil(employee.evaluation_90_date), 0)}d`}
            />
            <div>
              <p className="text-sm font-medium text-ink">{evaluationBadge.label}</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Admitido em {employee.hire_date} · avaliação de 90 dias termina em {employee.evaluation_90_date}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader
          title="Loja e benefícios"
          action={
            <Link href={`/lojas/${employee.stores.id}`} className="text-sm text-tint hover:underline">
              Ver loja →
            </Link>
          }
        />
        <CardBody className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Info label="Loja atual" value={employee.stores.name} />
          <Info label="Gestor responsável" value={managerName} />
          <Info label="Valor de VT/dia" value={`R$ ${employee.stores.transport_benefit_value.toFixed(2)}`} mono />
          <Info label="Valor de iFood/dia" value={`R$ ${employee.stores.meal_benefit_value.toFixed(2)}`} mono />
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Info label="CPF" value={employee.cpf} mono />
          <Info label="Telefone" value={employee.phone} mono />
          <Info label="Data de nascimento" value={employee.birth_date} />
          <Info label="Data de admissão" value={employee.hire_date} />
          <Info label="Data do exame admissional" value={employee.admission_exam_date} />
          <Info
            label="Salário atual"
            value={employee.current_salary != null ? `R$ ${employee.current_salary.toFixed(2)}` : null}
            mono
          />
          <Info
            label="Hapvida"
            value={
              employee.has_hapvida
                ? `Sim · ${employee.hapvida_dependents_count} dependente(s)`
                : "Não"
            }
          />
          <Info label="Wellhub" value={employee.has_wellhub ? "Sim" : "Não"} />
          {employee.notes && (
            <div className="sm:col-span-2">
              <Info label="Observações" value={employee.notes} />
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody>
          <h2 className="mb-3 text-sm font-semibold text-ink">Integração</h2>
          <form action={boundUpsertOnboarding} className="space-y-3">
            <Checkbox name="completed" label="Integração concluída" defaultChecked={onboarding?.completed} />
            <Textarea
              name="notes"
              rows={2}
              defaultValue={onboarding?.notes ?? ""}
              placeholder="Observações sobre a integração"
            />
            <Button type="submit" variant="secondary" size="sm">
              Salvar integração
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ModuleLink
          href={`/colaboradores/${employee.id}/atestados`}
          icon={FileWarning}
          title="Atestados"
          description="Dias úteis e desconto calculado automaticamente"
        />
        <ModuleLink
          href={`/colaboradores/${employee.id}/descontos`}
          icon={CalendarX2}
          title="Descontos"
          description="Atestados, férias e faltas — total por período"
        />
        <ModuleLink
          href={`/colaboradores/${employee.id}/compras`}
          icon={ShoppingBag}
          title="Compras"
          description="Parcelas, pagamentos e notificações"
        />
      </div>

      <VacationsSection employeeId={employee.id} />
      <AbsencesSection employeeId={employee.id} />
      <NegotiationsSection employeeId={employee.id} />
      <UniformSection employeeId={employee.id} />
      <DisciplinarySection employeeId={employee.id} />
      <TrainingsSection employeeId={employee.id} />
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm text-ink ${mono ? "font-mono tabular-nums" : ""}`}>{value || "—"}</dd>
    </div>
  );
}

function ModuleLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof FileWarning;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(28,43,51,0.05)] transition-colors hover:border-accent/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-tint">
        <Icon size={18} strokeWidth={1.5} />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-ink-muted">{description}</span>
      </span>
      <ChevronRight size={16} strokeWidth={1.5} className="text-ink-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
