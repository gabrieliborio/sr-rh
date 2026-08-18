"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TerminationFormState = { error: string | null };

const terminationSchema = z
  .object({
    notice_period_fulfilled: z.boolean(),
    termination_reason: z.string().optional(),
    just_cause: z.boolean(),
    requested_by: z.enum(["empresa", "funcionario"]),
    resignation_letter_url: z.string().optional(),
    termination_exam_done: z.boolean(),
    termination_exam_url: z.string().optional(),
    agreement_notes: z.string().optional(),
    form_completed: z.boolean(),
    termination_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.requested_by === "funcionario" && !data.resignation_letter_url) {
      ctx.addIssue({
        code: "custom",
        message: "Anexe a carta de demissão quando o pedido for do colaborador.",
        path: ["resignation_letter_url"],
      });
    }
    if (data.termination_exam_done && !data.termination_exam_url) {
      ctx.addIssue({
        code: "custom",
        message: "Anexe o exame demissional.",
        path: ["termination_exam_url"],
      });
    }
    if (data.form_completed && !data.termination_date) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a data de desligamento para concluir o formulário.",
        path: ["termination_date"],
      });
    }
  });

export async function saveTermination(
  employeeId: string,
  terminationId: string | null,
  _prevState: TerminationFormState,
  formData: FormData,
): Promise<TerminationFormState> {
  const raw = {
    notice_period_fulfilled: formData.get("notice_period_fulfilled") === "on",
    termination_reason: (formData.get("termination_reason") as string) || undefined,
    just_cause: formData.get("just_cause") === "on",
    requested_by: formData.get("requested_by"),
    resignation_letter_url: (formData.get("resignation_letter_url") as string) || undefined,
    termination_exam_done: formData.get("termination_exam_done") === "on",
    termination_exam_url: (formData.get("termination_exam_url") as string) || undefined,
    agreement_notes: (formData.get("agreement_notes") as string) || undefined,
    form_completed: formData.get("form_completed") === "on",
    termination_date: (formData.get("termination_date") as string) || undefined,
  };

  const parsed = terminationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const row = {
    employee_id: employeeId,
    notice_period_fulfilled: data.notice_period_fulfilled,
    termination_reason: data.termination_reason || null,
    just_cause: data.just_cause,
    requested_by: data.requested_by,
    resignation_letter_url: data.resignation_letter_url || null,
    termination_exam_done: data.termination_exam_done,
    termination_exam_url: data.termination_exam_url || null,
    agreement_notes: data.agreement_notes || null,
    form_completed: data.form_completed,
    termination_date: data.termination_date || null,
  };

  const { error } = terminationId
    ? await supabase.from("terminations").update(row).eq("id", terminationId)
    : await supabase.from("terminations").insert(row);

  if (error) {
    return { error: "Não foi possível salvar o desligamento. Tente novamente." };
  }

  // Business rule: employees.status only moves to 'desligado' once the
  // termination form is saved with form_completed = true.
  if (data.form_completed) {
    await supabase.from("employees").update({ status: "desligado" }).eq("id", employeeId);
  }

  revalidatePath(`/colaboradores/${employeeId}`);
  revalidatePath(`/colaboradores/${employeeId}/desligamento`);
  redirect(`/colaboradores/${employeeId}`);
}
