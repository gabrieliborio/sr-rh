import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_TONE } from "@/lib/candidates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { tableWrapClass, theadRowClass, thClass, tdClass, tdMutedClass, trClass } from "@/components/ui/table";
import type { Candidate } from "@/types/candidate";

export default async function CandidatosPage() {
  const supabase = await createClient();
  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Candidate[]>();

  return (
    <div>
      <PageHeader
        title="Recrutamento"
        description="Processo seletivo — etapas, reprovações e contratações."
        actions={
          <LinkButton href="/candidatos/novo">
            <UserPlus size={16} strokeWidth={1.75} />
            Novo candidato
          </LinkButton>
        }
      />

      {(!candidates || candidates.length === 0) && (
        <EmptyState
          message="Nenhum candidato cadastrado ainda — cadastre o primeiro para acompanhar o processo."
          action={<LinkButton href="/candidatos/novo" size="sm">Novo candidato</LinkButton>}
        />
      )}

      {candidates && candidates.length > 0 && (
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Nome</th>
                <th className={thClass}>Vaga</th>
                <th className={thClass}>Etapa</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className={trClass}>
                  <td className={tdClass}>
                    <Link href={`/candidatos/${candidate.id}`} className="font-medium text-ink hover:underline">
                      {candidate.name}
                    </Link>
                  </td>
                  <td className={tdMutedClass}>{candidate.role_applied ?? "—"}</td>
                  <td className={tdMutedClass}>{candidate.current_stage}</td>
                  <td className={tdClass}>
                    <Badge tone={CANDIDATE_STATUS_TONE[candidate.status]}>
                      {CANDIDATE_STATUS_LABELS[candidate.status]}
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
