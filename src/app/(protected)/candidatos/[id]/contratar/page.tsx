import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { hireCandidate } from "../../actions";
import { HireForm } from "./hire-form";
import type { Candidate } from "@/types/candidate";
import type { Store } from "@/types/store";

export default async function ContratarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: candidate }, { data: stores }] = await Promise.all([
    supabase.from("candidates").select("*").eq("id", id).maybeSingle<Candidate>(),
    supabase.from("stores").select("*").order("name").returns<Store[]>(),
  ]);

  if (!candidate) notFound();

  const boundHire = hireCandidate.bind(null, id);

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Recrutamento", href: "/candidatos" },
          { label: candidate.name, href: `/candidatos/${id}` },
          { label: "Contratar" },
        ]}
        title={`Contratar ${candidate.name}`}
        description="Isso cria o registro do colaborador com os dados do candidato já preenchidos."
      />
      <HireForm action={boundHire} defaultRole={candidate.role_applied ?? ""} stores={stores ?? []} />
    </div>
  );
}
