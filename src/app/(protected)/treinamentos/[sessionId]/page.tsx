import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { saveTrainingRoster } from "../actions";
import { RosterForm, type RosterEmployee } from "./roster-form";
import type { TrainingSession } from "@/types/training";

export default async function SessaoTreinamentoPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const [{ data: session }, { data: employees }, { data: attendances }] = await Promise.all([
    supabase.from("training_sessions").select("*, trainings(name)").eq("id", sessionId).maybeSingle<TrainingSession>(),
    supabase
      .from("employees")
      .select("id, name, employee_number, stores!employees_store_id_fkey(name)")
      .eq("status", "ativo")
      .order("name")
      .returns<{ id: string; name: string; employee_number: string; stores: { name: string } | null }[]>(),
    supabase
      .from("training_attendances")
      .select("employee_id, certificate_code")
      .eq("session_id", sessionId)
      .returns<{ employee_id: string; certificate_code: string | null }[]>(),
  ]);

  if (!session) notFound();

  const certificateByEmployee = new Map((attendances ?? []).map((a) => [a.employee_id, a.certificate_code]));
  const attendedIds = (attendances ?? []).map((a) => a.employee_id);

  const rosterEmployees: RosterEmployee[] = (employees ?? []).map((employee) => ({
    id: employee.id,
    name: employee.name,
    employeeNumber: employee.employee_number,
    storeName: employee.stores?.name ?? null,
    certificateCode: certificateByEmployee.get(employee.id) ?? null,
  }));

  const boundSave = saveTrainingRoster.bind(null, sessionId);

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: "Treinamentos", href: "/treinamentos" }, { label: session.trainings?.name ?? "Sessão" }]}
        title={session.trainings?.name ?? "Sessão"}
        description={`${session.session_date}${session.workload_hours ? ` · ${session.workload_hours}h` : ""}${session.instructor_name ? ` · Instrutor: ${session.instructor_name}${session.instructor_role ? ` (${session.instructor_role})` : ""}` : ""}`}
      />

      {session.topics_covered && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">Conteúdo abordado</h2>
            <p className="text-sm text-ink">{session.topics_covered}</p>
          </CardBody>
        </Card>
      )}

      <RosterForm action={boundSave} employees={rosterEmployees} attendedIds={attendedIds} />
    </div>
  );
}
