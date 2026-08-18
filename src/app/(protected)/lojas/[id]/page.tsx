import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Field, Input, Label, Select } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import {
  STORE_LICENSE_STATUS_LABELS,
  STORE_LICENSE_STATUS_TONE,
  STORE_LICENSE_TYPE_LABELS,
} from "@/lib/store-licenses";
import { addLicense } from "../actions";
import type { Store, StoreLicense } from "@/types/store";

export default async function LojaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: store }, { data: licenses }] = await Promise.all([
    supabase.from("stores").select("*").eq("id", id).maybeSingle<Store>(),
    supabase
      .from("v_store_licenses")
      .select("*")
      .eq("store_id", id)
      .order("expiry_date")
      .returns<StoreLicense[]>(),
  ]);

  if (!store) notFound();

  let managerName: string | null = null;
  if (store.manager_id) {
    const { data: manager } = await supabase
      .from("employees")
      .select("name")
      .eq("id", store.manager_id)
      .maybeSingle<{ name: string }>();
    managerName = manager?.name ?? null;
  }

  const boundAddLicense = addLicense.bind(null, id);

  return (
    <div className="max-w-3xl">
      <PageHeader
        breadcrumb={[{ label: "Lojas", href: "/lojas" }, { label: store.name }]}
        title={store.name}
        description={`${store.address ?? "Endereço não informado"}${store.cnpj ? ` · CNPJ ${store.cnpj}` : ""}`}
        actions={
          <LinkButton href={`/lojas/${store.id}/editar`} variant="secondary" size="sm">
            Editar
          </LinkButton>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Gestor e benefícios" />
        <CardBody className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Gestor responsável</dt>
            <dd className="mt-0.5 text-sm text-ink">{managerName ?? "Nenhum"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Valor de VT/dia</dt>
            <dd className="mt-0.5 font-mono text-sm text-ink">R$ {store.transport_benefit_value.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Valor de iFood/dia</dt>
            <dd className="mt-0.5 font-mono text-sm text-ink">R$ {store.meal_benefit_value.toFixed(2)}</dd>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Licenças" />
        <CardBody>
          {licenses && licenses.length > 0 ? (
            <ul className="mb-4 space-y-2 text-sm">
              {licenses.map((license) => (
                <li key={license.id} className="flex flex-wrap items-center gap-2">
                  <Badge tone={STORE_LICENSE_STATUS_TONE[license.status]}>
                    {STORE_LICENSE_STATUS_LABELS[license.status]}
                  </Badge>
                  <span className="text-ink">
                    {STORE_LICENSE_TYPE_LABELS[license.type]}
                    {license.expiry_date ? (
                      <span className="font-mono text-ink-muted"> · vence em {license.expiry_date}</span>
                    ) : null}
                  </span>
                  {license.file_url && (
                    <a href={license.file_url} target="_blank" rel="noreferrer" className="text-tint hover:underline">
                      ver arquivo
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              message="Nenhuma licença cadastrada — adicione a primeira licença abaixo."
              className="mb-4"
            />
          )}

          <form action={boundAddLicense} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="license-type">Tipo</Label>
              <Select id="license-type" name="type" required defaultValue="certificado_conformidade">
                <option value="certificado_conformidade">Certificado de conformidade</option>
                <option value="alvara_funcionamento">Alvará de funcionamento</option>
                <option value="licenca_sanitaria">Licença sanitária</option>
              </Select>
            </div>
            <Field label="Link do arquivo (Drive)" htmlFor="license-file-url">
              <Input id="license-file-url" type="url" name="file_url" />
            </Field>
            <Field label="Data de emissão" htmlFor="license-issue-date">
              <Input id="license-issue-date" type="date" name="issue_date" />
            </Field>
            <Field label="Data de validade" htmlFor="license-expiry-date">
              <Input id="license-expiry-date" type="date" name="expiry_date" />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" size="sm">
                Adicionar licença
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
