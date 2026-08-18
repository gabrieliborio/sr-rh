import { notFound } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button, LinkButton } from "@/components/ui/button";
import { markDiscountApplied } from "./actions";
import type { MedicalCertificate } from "@/types/medical-certificate";
import type { Employee } from "@/types/employee";

export default async function AtestadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: employee }, { data: certificates }] = await Promise.all([
    supabase.from("employees").select("id, name").eq("id", id).maybeSingle<Pick<Employee, "id" | "name">>(),
    supabase
      .from("medical_certificates")
      .select("*, stores(name)")
      .eq("employee_id", id)
      .order("start_date", { ascending: false })
      .returns<MedicalCertificate[]>(),
  ]);

  if (!employee) notFound();

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Colaboradores", href: "/colaboradores" },
          { label: employee.name, href: `/colaboradores/${id}` },
          { label: "Atestados" },
        ]}
        title={`Atestados — ${employee.name}`}
        description="O desconto é apenas calculado e exibido aqui — a aplicação em folha continua manual."
        actions={
          <LinkButton href={`/colaboradores/${id}/atestados/novo`}>
            <FilePlus2 size={16} strokeWidth={1.75} />
            Novo atestado
          </LinkButton>
        }
      />

      {(!certificates || certificates.length === 0) && (
        <EmptyState
          message="Nenhum atestado registrado — anexe o primeiro atestado para começar o cálculo de desconto."
          action={<LinkButton href={`/colaboradores/${id}/atestados/novo`} size="sm">Novo atestado</LinkButton>}
        />
      )}

      {certificates && certificates.length > 0 && (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    <span className="font-mono">{cert.start_date} a {cert.end_date}</span> · {cert.days_count} dia(s) útil(eis)
                  </p>
                  <p className="mt-1 font-mono text-sm text-ink-muted">
                    VT R$ {cert.vt_discount_value.toFixed(2)} · Alimentação R${" "}
                    {cert.meal_discount_value.toFixed(2)} · Total R$ {cert.total_discount_value.toFixed(2)}
                  </p>
                  {cert.stores && (
                    <p className="mt-0.5 text-xs text-ink-muted">Valor calculado com a loja {cert.stores.name}</p>
                  )}
                  {cert.attachment_url && (
                    <a
                      href={cert.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm text-tint hover:underline"
                    >
                      Ver anexo
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={cert.discount_applied ? "green" : "amber"}>
                    {cert.discount_applied ? "Desconto aplicado" : "Desconto pendente"}
                  </Badge>
                  {!cert.discount_applied && (
                    <form action={markDiscountApplied.bind(null, id, cert.id)}>
                      <Button type="submit" variant="secondary" size="sm">
                        Marcar como aplicado
                      </Button>
                    </form>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
