import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/badge";
import { Label, Input, Textarea } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { tableWrapClass, theadRowClass, thClass, tdClass, tdMutedClass, trClass } from "@/components/ui/table";
import { createTraining } from "./actions";
import type { Training, TrainingSessionSummary } from "@/types/training";

export default async function TreinamentosPage() {
  const supabase = await createClient();
  const [{ data: sessions }, { data: trainings }] = await Promise.all([
    supabase
      .from("v_training_sessions")
      .select("*")
      .order("session_date", { ascending: false })
      .returns<TrainingSessionSummary[]>(),
    supabase.from("trainings").select("*").order("name").returns<Training[]>(),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Treinamentos"
        description="Sessões presenciais e quem participou — crie uma sessão e marque a presença rapidinho, ali na hora."
        actions={
          <LinkButton href="/treinamentos/novo">
            Novo treinamento
          </LinkButton>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Sessões" />
        <CardBody>
          {sessions && sessions.length > 0 ? (
            <div className={tableWrapClass}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={theadRowClass}>
                    <th className={thClass}>Data</th>
                    <th className={thClass}>Treinamento</th>
                    <th className={thClass}>Presença</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className={trClass}>
                      <td className={`${tdMutedClass} font-mono`}>{session.session_date}</td>
                      <td className={tdClass}>
                        <Link href={`/treinamentos/${session.id}`} className="font-medium text-ink hover:underline">
                          {session.training_name}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <Badge tone={session.attended_count > 0 ? "green" : "neutral"}>
                          {session.attended_count}/{session.roster_count}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Nenhuma sessão criada ainda — clique em 'Novo treinamento' para registrar a primeira." />
          )}
        </CardBody>
      </Card>

      <div id="catalogo" className="scroll-mt-4" />
      <Card>
        <CardHeader title="Catálogo de treinamentos" />
        <CardBody>
          <p className="mb-4 text-sm text-ink-muted">
            Os tipos abaixo alimentam o formulário de nova sessão — cadastre aqui antes de criar uma sessão nova.
          </p>

          {trainings && trainings.length > 0 ? (
            <ul className="mb-6 space-y-2">
              {trainings.map((training) => (
                <li key={training.id} className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 text-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-tint">
                    <GraduationCap size={16} strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="font-medium text-ink">
                      {training.name}
                      {training.default_workload_hours ? (
                        <span className="ml-1.5 font-mono text-xs text-ink-muted">{training.default_workload_hours}h</span>
                      ) : null}
                    </p>
                    {training.description && <p className="mt-1 text-ink-muted">{training.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              message="Nenhum tipo de treinamento cadastrado ainda — adicione o primeiro no formulário abaixo."
              className="mb-6"
            />
          )}

          <form action={createTraining} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="training-name">Nome</Label>
              <Input id="training-name" type="text" name="name" required />
            </div>
            <div>
              <Label htmlFor="training-workload">Carga horária padrão</Label>
              <Input id="training-workload" type="number" step="0.5" name="default_workload_hours" mono />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="training-description">Descrição</Label>
              <Textarea id="training-description" name="description" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" size="sm">
                Adicionar tipo
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
