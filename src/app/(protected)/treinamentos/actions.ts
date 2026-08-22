"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTraining(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  const workloadRaw = formData.get("default_workload_hours") as string;

  const supabase = await createClient();
  await supabase.from("trainings").insert({
    name,
    description: (formData.get("description") as string) || null,
    default_workload_hours: workloadRaw ? Number(workloadRaw) : null,
  });

  revalidatePath("/treinamentos");
}

export type SessionFormState = { error: string | null };

export async function createTrainingSession(
  _prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const trainingId = formData.get("training_id") as string;
  const sessionDate = formData.get("session_date") as string;
  if (!trainingId || !sessionDate) {
    return { error: "Selecione o treinamento e a data da sessão." };
  }

  const workloadRaw = formData.get("workload_hours") as string;
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("training_sessions")
    .insert({
      training_id: trainingId,
      session_date: sessionDate,
      workload_hours: workloadRaw ? Number(workloadRaw) : null,
      instructor_name: (formData.get("instructor_name") as string) || null,
      instructor_role: (formData.get("instructor_role") as string) || null,
      topics_covered: (formData.get("topics_covered") as string) || null,
    })
    .select("id")
    .single();

  if (error || !session) {
    return { error: "Não foi possível criar a sessão. Tente novamente." };
  }

  revalidatePath("/treinamentos");
  redirect(`/treinamentos/${session.id}`);
}

function generateCertificateCode() {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

export async function saveTrainingRoster(sessionId: string, formData: FormData) {
  const checked = new Set(formData.getAll("employee_ids") as string[]);
  const candidates = formData.getAll("candidate_employee_ids") as string[];

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("training_attendances")
    .select("employee_id, certificate_code")
    .eq("session_id", sessionId)
    .returns<{ employee_id: string; certificate_code: string | null }[]>();

  const existingCodes = new Map((existing ?? []).map((row) => [row.employee_id, row.certificate_code]));

  const rows = Array.from(checked).map((employeeId) => ({
    session_id: sessionId,
    employee_id: employeeId,
    attended: true,
    certificate_code: existingCodes.get(employeeId) ?? generateCertificateCode(),
  }));

  if (rows.length > 0) {
    await supabase.from("training_attendances").upsert(rows, { onConflict: "session_id,employee_id" });
  }

  const toRemove = candidates.filter((id) => !checked.has(id));
  if (toRemove.length > 0) {
    await supabase
      .from("training_attendances")
      .delete()
      .eq("session_id", sessionId)
      .in("employee_id", toRemove);
  }

  revalidatePath(`/treinamentos/${sessionId}`);
  revalidatePath("/treinamentos");
  for (const employeeId of new Set([...checked, ...toRemove])) {
    revalidatePath(`/colaboradores/${employeeId}`);
  }
}
