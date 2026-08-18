import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/badge";
import { Checkbox, Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addAbsence } from "../records-actions";
import type { EmployeeAbsence } from "@/types/employee";

export async function AbsencesSection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const { data: absences } = await supabase
    .from("employee_absences")
    .select("*")
    .eq("employee_id", employeeId)
    .order("date", { ascending: false })
    .returns<EmployeeAbsence[]>();

  const boundAdd = addAbsence.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Faltas" />
      <CardBody>
        {absences && absences.length > 0 ? (
          <ul className="mb-4 space-y-2 text-sm text-ink">
            {absences.map((absence) => (
              <li key={absence.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-ink-muted">{absence.date}</span>
                <Badge tone={absence.justified ? "blue" : "amber"}>
                  {absence.justified ? "Justificada" : "Não justificada"}
                </Badge>
                {absence.reason && <span>{absence.reason}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Nenhuma falta registrada — bom sinal." className="mb-4" />
        )}

        <form action={boundAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="absence-date">Data</Label>
            <Input id="absence-date" type="date" name="date" required />
          </div>
          <div className="flex items-end">
            <Checkbox name="justified" label="Justificada" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="absence-reason">Motivo</Label>
            <Input id="absence-reason" type="text" name="reason" />
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
