import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/badge";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addDisciplinaryRecord } from "../records-actions";
import type { DisciplinaryRecord } from "@/types/records";

const STATUS_LABELS: Record<DisciplinaryRecord["status"], string> = {
  suspensao: "Suspensão",
  advertencia: "Advertência",
};

export async function DisciplinarySection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const { data: records } = await supabase
    .from("disciplinary_records")
    .select("*")
    .eq("employee_id", employeeId)
    .order("start_date", { ascending: false })
    .returns<DisciplinaryRecord[]>();

  const boundAdd = addDisciplinaryRecord.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Suspensões e advertências" />
      <CardBody>
        {records && records.length > 0 ? (
          <ul className="mb-4 space-y-2 text-sm text-ink">
            {records.map((record) => (
              <li key={record.id} className="flex flex-wrap items-center gap-2">
                <Badge tone={record.status === "suspensao" ? "amber" : "neutral"}>
                  {STATUS_LABELS[record.status]}
                </Badge>
                <span className="font-mono text-xs text-ink-muted">
                  {record.start_date}
                  {record.end_date ? ` a ${record.end_date}` : ""}
                </span>
                <span>{record.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Nenhum registro disciplinar — bom sinal." className="mb-4" />
        )}

        <form action={boundAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="disc-status">Tipo</Label>
            <Select id="disc-status" name="status" required defaultValue="advertencia">
              <option value="advertencia">Advertência</option>
              <option value="suspensao">Suspensão</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="disc-reason">Motivo</Label>
            <Input id="disc-reason" type="text" name="reason" required />
          </div>
          <div>
            <Label htmlFor="disc-start">Data de início</Label>
            <Input id="disc-start" type="date" name="start_date" required />
          </div>
          <div>
            <Label htmlFor="disc-end">Data de fim</Label>
            <Input id="disc-end" type="date" name="end_date" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="disc-attachment">Link do anexo (Drive)</Label>
            <Input id="disc-attachment" type="url" name="attachment_url" />
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
