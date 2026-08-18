import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { AvatarRing } from "@/components/ui/ring";
import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_TONE, CANDIDATE_STATUSES } from "@/lib/candidates";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/page-header";
import { Field, FieldGroup, Input, Textarea, Select } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { updateCandidateProgress } from "../actions";
import type { Candidate } from "@/types/candidate";

export default async function CandidatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle<Candidate>();

  if (!candidate) notFound();

  const boundUpdate = updateCandidateProgress.bind(null, id);

  return (
    <div className="max-w-2xl">
      <Breadcrumb items={[{ label: "Recrutamento", href: "/candidatos" }, { label: candidate.name }]} />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <AvatarRing name={candidate.name} tone="blue" size={52} />
          <div>
            <h1 className="font-display text-[28px] leading-tight text-ink sm:text-3xl">{candidate.name}</h1>
            <p className="mt-1 text-sm text-ink-muted">{candidate.role_applied ?? "Vaga não informada"}</p>
            <div className="mt-2">
              <Badge tone={CANDIDATE_STATUS_TONE[candidate.status]}>
                {CANDIDATE_STATUS_LABELS[candidate.status]}
              </Badge>
            </div>
          </div>
        </div>
        {candidate.status !== "contratado" && (
          <LinkButton href={`/candidatos/${candidate.id}/contratar`}>Marcar como contratado</LinkButton>
        )}
      </div>

      <Card className="mb-6">
        <CardBody className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <Info label="Telefone" value={candidate.phone} mono />
          <Info label="E-mail" value={candidate.email} />
          {candidate.resume_url && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Currículo</dt>
              <dd>
                <a href={candidate.resume_url} target="_blank" rel="noreferrer" className="text-tint hover:underline">
                  Ver currículo
                </a>
              </dd>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Andamento do processo" />
        <CardBody>
          <form action={boundUpdate} className="space-y-6">
            <FieldGroup title="Etapa">
              <Field label="Etapa atual" htmlFor="current_stage" required>
                <Input id="current_stage" name="current_stage" defaultValue={candidate.current_stage} required />
              </Field>
              <Field label="Status" htmlFor="status">
                <Select id="status" name="status" defaultValue={candidate.status}>
                  {CANDIDATE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {CANDIDATE_STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup title="Reprovação (se aplicável)">
              <Field label="Etapa da reprovação" htmlFor="rejection_stage">
                <Input id="rejection_stage" name="rejection_stage" defaultValue={candidate.rejection_stage ?? ""} />
              </Field>
              <Field label="Motivo da reprovação" htmlFor="rejection_reason">
                <Input id="rejection_reason" name="rejection_reason" defaultValue={candidate.rejection_reason ?? ""} />
              </Field>
            </FieldGroup>

            <Field label="Observações" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={2} defaultValue={candidate.notes ?? ""} />
            </Field>

            <Button type="submit" variant="secondary">
              Salvar andamento
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className={`text-ink ${mono ? "font-mono" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
