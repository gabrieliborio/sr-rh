import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createTraining } from "./actions";
import type { Training } from "@/types/training";

export default async function TreinamentosPage() {
  const supabase = await createClient();
  const { data: trainings } = await supabase
    .from("trainings")
    .select("*")
    .order("name")
    .returns<Training[]>();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Catálogo de treinamentos"
        description="Cadastre os treinamentos aqui — a participação e o certificado são registrados na ficha de cada colaborador."
      />

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
          message="Nenhum treinamento cadastrado ainda — adicione o primeiro no formulário abaixo."
          className="mb-6"
        />
      )}

      <Card>
        <CardHeader title="Novo treinamento" />
        <CardBody>
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
                Adicionar
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
