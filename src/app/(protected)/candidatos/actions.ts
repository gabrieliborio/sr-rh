"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYEE_ROLES } from "@/lib/constants";
import { CANDIDATE_STATUSES } from "@/lib/candidates";

export type CandidateFormState = { error: string | null };

const candidateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().optional(),
  role_applied: z.string().optional(),
  resume_url: z.string().optional(),
});

function toCandidateRow(formData: FormData) {
  const parsed = candidateSchema.safeParse({
    name: formData.get("name"),
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    role_applied: (formData.get("role_applied") as string) || undefined,
    resume_url: (formData.get("resume_url") as string) || undefined,
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  return {
    ok: true as const,
    row: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      role_applied: data.role_applied || null,
      resume_url: data.resume_url || null,
    },
  };
}

export async function createCandidate(
  _prevState: CandidateFormState,
  formData: FormData,
): Promise<CandidateFormState> {
  const result = toCandidateRow(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("candidates").insert(result.row).select("id").single();

  if (error) return { error: "Não foi possível salvar o candidato. Tente novamente." };

  revalidatePath("/candidatos");
  redirect(`/candidatos/${data.id}`);
}

const progressSchema = z.object({
  current_stage: z.string().min(1),
  status: z.enum(CANDIDATE_STATUSES as [string, ...string[]]),
  rejection_stage: z.string().optional(),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateCandidateProgress(candidateId: string, formData: FormData) {
  const parsed = progressSchema.safeParse({
    current_stage: formData.get("current_stage"),
    status: formData.get("status"),
    rejection_stage: (formData.get("rejection_stage") as string) || undefined,
    rejection_reason: (formData.get("rejection_reason") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });

  if (!parsed.success) return;

  const data = parsed.data;
  const supabase = await createClient();
  await supabase
    .from("candidates")
    .update({
      current_stage: data.current_stage,
      status: data.status,
      rejection_stage: data.status === "reprovado" ? data.rejection_stage || null : null,
      rejection_reason: data.status === "reprovado" ? data.rejection_reason || null : null,
      notes: data.notes || null,
    })
    .eq("id", candidateId);

  revalidatePath(`/candidatos/${candidateId}`);
  revalidatePath("/candidatos");
}

export type HireFormState = { error: string | null };

const hireSchema = z.object({
  cpf: z.string().min(1, "CPF é obrigatório"),
  hire_date: z.string().min(1, "Data de admissão é obrigatória"),
  store_id: z.string().min(1, "Loja é obrigatória"),
  role: z.union([z.enum(EMPLOYEE_ROLES), z.literal("")]).optional(),
});

export async function hireCandidate(
  candidateId: string,
  _prevState: HireFormState,
  formData: FormData,
): Promise<HireFormState> {
  const parsed = hireSchema.safeParse({
    cpf: formData.get("cpf"),
    hire_date: formData.get("hire_date"),
    store_id: formData.get("store_id"),
    role: (formData.get("role") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("name, phone")
    .eq("id", candidateId)
    .maybeSingle<{ name: string; phone: string | null }>();

  if (candidateError || !candidate) {
    return { error: "Candidato não encontrado." };
  }

  const { cpf, hire_date, store_id, role } = parsed.data;

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .insert({
      name: candidate.name,
      phone: candidate.phone,
      cpf,
      hire_date,
      store_id,
      role: role || null,
      status: "ativo",
    })
    .select("id")
    .single();

  if (employeeError || !employee) {
    const message =
      employeeError?.message.includes("employees_cpf_key")
        ? "Já existe um colaborador com esse CPF."
        : employeeError?.message.includes("employees_employee_number_key")
          ? "Já existe um colaborador com essa matrícula."
          : "Não foi possível criar o colaborador. Tente novamente.";
    return { error: message };
  }

  await supabase
    .from("candidates")
    .update({ status: "contratado", hired_employee_id: employee.id })
    .eq("id", candidateId);

  revalidatePath("/candidatos");
  revalidatePath("/colaboradores");
  redirect(`/colaboradores/${employee.id}`);
}
