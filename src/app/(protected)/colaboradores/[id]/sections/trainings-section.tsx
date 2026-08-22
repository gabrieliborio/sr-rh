import Link from "next/link";
import { Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { addEmployeeToSession } from "../records-actions";
import type { TrainingAttendance } from "@/types/training";

type RecentSession = {
  id: string;
  session_date: string;
  trainings: { name: string } | null;
};

export async function TrainingsSection({ employeeId }: { employeeId: string }) {
  const supabase = await createClient();
  const [{ data: attendances }, { data: recentSessions }] = await Promise.all([
    supabase
      .from("training_attendances")
      .select("*, training_sessions(session_date, workload_hours, instructor_name, instructor_role, topics_covered, trainings(name))")
      .eq("employee_id", employeeId)
      .eq("attended", true)
      .order("session_date", { foreignTable: "training_sessions", ascending: false })
      .returns<TrainingAttendance[]>(),
    supabase
      .from("training_sessions")
      .select("id, session_date, trainings(name)")
      .order("session_date", { ascending: false })
      .limit(20)
      .returns<RecentSession[]>(),
  ]);

  const totalHours = (attendances ?? []).reduce(
    (sum, a) => sum + (a.training_sessions?.workload_hours ?? 0),
    0,
  );

  const boundAdd = addEmployeeToSession.bind(null, employeeId);

  return (
    <Card className="mt-6">
      <CardHeader title="Treinamentos" />
      <CardBody>
        {attendances && attendances.length > 0 ? (
          <>
            <p className="mb-3 text-xs text-ink-muted">
              {attendances.length} treinamento{attendances.length === 1 ? "" : "s"} concluído
              {attendances.length === 1 ? "" : "s"}
              {totalHours > 0 && ` · ${totalHours}h totais`}
            </p>
            <ul className="mb-4 space-y-2 text-sm text-ink">
              {attendances.map((attendance) => (
                <li key={attendance.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-ink-muted">{attendance.training_sessions?.session_date}</span>
                    <span>— {attendance.training_sessions?.trainings?.name ?? "Treinamento"}</span>
                    {attendance.certificate_code && (
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
                  </div>
                  {attendance.training_sessions?.topics_covered && (
                    <p className="mt-0.5 text-xs text-ink-muted">{attendance.training_sessions.topics_covered}</p>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState message="Nenhum treinamento registrado ainda." className="mb-4" />
        )}

        {recentSessions && recentSessions.length > 0 ? (
          <form action={boundAdd} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Select name="session_id" required defaultValue="">
                <option value="" disabled>
                  Selecione uma sessão
                </option>
                {recentSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.session_date} — {session.trainings?.name ?? "Treinamento"}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Marcar presença nesta sessão
            </Button>
          </form>
        ) : (
          <p className="text-sm text-ink-muted">Nenhuma sessão criada ainda.</p>
        )}
        <p className="mt-2 text-xs text-ink-muted">
          Não encontra a sessão?{" "}
          <Link href="/treinamentos/novo" className="text-tint hover:underline">
            Crie em Treinamentos
          </Link>
          .
        </p>
      </CardBody>
    </Card>
  );
}
