import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { createTrainingSession } from "../actions";
import { NewSessionForm } from "./new-session-form";
import type { Training } from "@/types/training";

export default async function NovaSessaoPage() {
  const supabase = await createClient();
  const { data: trainings } = await supabase.from("trainings").select("*").order("name").returns<Training[]>();

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Treinamentos", href: "/treinamentos" }, { label: "Novo treinamento" }]}
        title="Novo treinamento"
        description="Cria a sessão e leva direto para a lista de presença, pra marcar quem participou na hora."
      />

      {trainings && trainings.length > 0 ? (
        <NewSessionForm action={createTrainingSession} trainings={trainings} />
      ) : (
        <EmptyState
          message="Nenhum tipo de treinamento cadastrado ainda — cadastre um no catálogo antes de criar uma sessão."
          action={<LinkButton href="/treinamentos#catalogo" size="sm">Ir para o catálogo</LinkButton>}
        />
      )}
    </div>
  );
}
