import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addNegotiation } from "../records-actions";
import type { Negotiation } from "@/types/records";

export async function NegotiationsSection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const { data: negotiations } = await supabase
    .from("negotiations")
    .select("*")
    .eq("employee_id", employeeId)
    .order("agreement_date", { ascending: false })
    .returns<Negotiation[]>();

  const boundAdd = addNegotiation.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Negociações" />
      <CardBody>
        {negotiations && negotiations.length > 0 ? (
          <ul className="mb-4 space-y-1.5 text-sm text-ink">
            {negotiations.map((n) => (
              <li key={n.id} className="flex gap-2">
                <span className="font-mono text-ink-muted">{n.agreement_date}</span>
                <span>— {n.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Nenhuma negociação registrada — adicione a primeira abaixo." className="mb-4" />
        )}

        <form action={boundAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="neg-description">Descrição</Label>
            <Input id="neg-description" type="text" name="description" required />
          </div>
          <div>
            <Label htmlFor="neg-date">Data do acordo</Label>
            <Input id="neg-date" type="date" name="agreement_date" required />
          </div>
          <div>
            <Label htmlFor="neg-attachment">Link do anexo (Drive)</Label>
            <Input id="neg-attachment" type="url" name="attachment_url" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="neg-notes">Observações</Label>
            <Input id="neg-notes" type="text" name="notes" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" size="sm">
              Adicionar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
