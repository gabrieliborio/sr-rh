import { Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox, Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addTrainingAttendance } from "../records-actions";
import type { TrainingAttendance, Training } from "@/types/training";

export async function TrainingsSection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const [{ data: attendances }, { data: trainings }] = await Promise.all([
    supabase
      .from("training_attendances")
      .select("*, trainings(name)")
      .eq("employee_id", employeeId)
      .order("training_date", { ascending: false })
      .returns<TrainingAttendance[]>(),
    supabase.from("trainings").select("*").order("name").returns<Training[]>(),
  ]);

  const boundAdd = addTrainingAttendance.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Treinamentos" />
      <CardBody>
        {attendances && attendances.length > 0 ? (
          <ul className="mb-4 space-y-1.5 text-sm text-ink">
            {attendances.map((attendance) => (
              <li key={attendance.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-ink-muted">{attendance.training_date}</span>
                <span>— {attendance.trainings?.name ?? "Treinamento"}</span>
                {attendance.attended && attendance.certificate_code && (
                  <a
                    href={`/certificados/${attendance.certificate_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <Award size={13} strokeWidth={1.5} />
                    certificado
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            message="Nenhum treinamento registrado — registre a primeira participação abaixo."
            className="mb-4"
          />
        )}

        {trainings && trainings.length > 0 ? (
          <form action={boundAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="tr-training">Treinamento</Label>
              <Select id="tr-training" name="training_id" required>
                {trainings.map((training) => (
                  <option key={training.id} value={training.id}>
                    {training.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="tr-date">Data</Label>
              <Input id="tr-date" type="date" name="training_date" required />
            </div>
            <div>
              <Label htmlFor="tr-workload">Carga horária</Label>
              <Input id="tr-workload" type="number" step="0.5" name="workload_hours" mono />
            </div>
            <div className="flex items-end">
              <Checkbox name="attended" label="Presente" defaultChecked />
            </div>
            <div>
              <Label htmlFor="tr-signed-name">Assinado por</Label>
              <Input id="tr-signed-name" type="text" name="signed_by_name" />
            </div>
            <div>
              <Label htmlFor="tr-signed-role">Cargo de quem assina</Label>
              <Input id="tr-signed-role" type="text" name="signed_by_role" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" size="sm">
                Registrar participação
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-ink-muted">
            Cadastre um treinamento no catálogo antes de registrar participações.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
