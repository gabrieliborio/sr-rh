import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addUniformEntry } from "../records-actions";
import type { UniformEntry } from "@/types/records";

export async function UniformSection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("uniform_history")
    .select("*")
    .eq("employee_id", employeeId)
    .order("sent_date", { ascending: false })
    .returns<UniformEntry[]>();

  const boundAdd = addUniformEntry.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Fardamento" />
      <CardBody>
        {entries && entries.length > 0 ? (
          <ul className="mb-4 space-y-1.5 text-sm text-ink">
            {entries.map((entry) => (
              <li key={entry.id} className="flex gap-2">
                <span className="font-mono text-ink-muted">{entry.sent_date}</span>
                {entry.notes && <span>— {entry.notes}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            message="Nenhum envio de fardamento registrado — adicione o primeiro abaixo."
            className="mb-4"
          />
        )}

        <form action={boundAdd} className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="uniform-sent-date">Data do envio</Label>
            <Input id="uniform-sent-date" type="date" name="sent_date" required />
          </div>
          <div className="min-w-[160px] flex-1">
            <Label htmlFor="uniform-notes">Observações</Label>
            <Input id="uniform-notes" type="text" name="notes" />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Adicionar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
