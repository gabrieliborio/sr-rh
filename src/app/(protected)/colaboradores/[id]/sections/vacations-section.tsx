import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/badge";
import { Checkbox, Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addVacation, markVacationDiscountApplied } from "../records-actions";
import type { Vacation } from "@/types/records";

export async function VacationsSection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const { data: vacations } = await supabase
    .from("vacations")
    .select("*, stores(name)")
    .eq("employee_id", employeeId)
    .order("start_date", { ascending: false })
    .returns<Vacation[]>();

  const boundAdd = addVacation.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Férias" />
      <CardBody>
        {vacations && vacations.length > 0 ? (
          <ul className="mb-4 space-y-2 text-sm text-ink">
            {vacations.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-ink-muted">
                  {v.start_date} a {v.end_date}
                </span>
                {v.paid && <Badge tone="green">Paga</Badge>}
                {v.negotiated && <Badge tone="blue">Negociada</Badge>}
                {v.discount_calculated && (
                  <>
                    <span className="font-mono text-xs text-ink-muted">
                      VT R$ {v.vt_discount_value.toFixed(2)} · Alimentação R$ {v.meal_discount_value.toFixed(2)}
                      {v.stores ? ` · loja ${v.stores.name}` : ""}
                    </span>
                    <Badge tone={v.discount_applied ? "green" : "amber"}>
                      {v.discount_applied ? "Desconto aplicado" : "Desconto pendente"}
                    </Badge>
                    {!v.discount_applied && (
                      <form action={markVacationDiscountApplied.bind(null, employeeId, v.id)}>
                        <Button type="submit" variant="secondary" size="sm" className="!h-7 !px-2.5 !text-xs">
                          Marcar como aplicado
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Nenhuma férias registrada — cadastre o próximo período abaixo." className="mb-4" />
        )}

        <form action={boundAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="vac-start">Data de início</Label>
            <Input id="vac-start" type="date" name="start_date" required />
          </div>
          <div>
            <Label htmlFor="vac-end">Data de fim</Label>
            <Input id="vac-end" type="date" name="end_date" required />
          </div>
          <div className="flex gap-4">
            <Checkbox name="paid" label="Paga" />
            <Checkbox name="negotiated" label="Negociada" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="vac-notes">Observações</Label>
            <Input id="vac-notes" type="text" name="notes" />
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
