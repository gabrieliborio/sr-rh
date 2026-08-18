import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";

const REPORT_TYPES = [
  { value: "colaboradores", label: "Lista de colaboradores" },
  { value: "ferias_programadas", label: "Férias programadas" },
  { value: "avaliacoes_pendentes", label: "Avaliações pendentes (30/90 dias)" },
];

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase.from("stores").select("*").order("name").returns<Store[]>();

  return (
    <div className="max-w-md">
      <PageHeader
        title="Relatórios"
        description="Exporte um CSV para enviar aos gestores das lojas, que não têm acesso ao sistema."
      />

      <Card>
        <CardBody>
          <form action="/relatorios/export" method="get" className="space-y-4">
            <Field label="Relatório" htmlFor="type">
              <Select id="type" name="type" defaultValue="colaboradores">
                {REPORT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Loja" htmlFor="store_id">
              <Select id="store_id" name="store_id" defaultValue="">
                <option value="">Todas as lojas</option>
                {(stores ?? []).map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Button type="submit">
              <Download size={16} strokeWidth={1.75} />
              Baixar CSV
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
