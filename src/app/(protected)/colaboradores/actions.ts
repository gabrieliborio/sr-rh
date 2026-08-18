"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from "@/lib/constants";

export type EmployeeFormState = { error: string | null };

const employeeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  hire_date: z.string().min(1, "Data de admissão é obrigatória"),
  admission_exam_date: z.string().optional(),
  status: z.enum(EMPLOYEE_STATUSES),
  store_id: z.string().min(1, "Loja é obrigatória"),
  role: z.union([z.enum(EMPLOYEE_ROLES), z.literal("")]).optional(),
  current_salary: z.string().optional(),
  notes: z.string().optional(),
  hapvida_dependents_count: z.string().optional(),
});

function toEmployeeRow(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = employeeSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  const hasHapvida = formData.get("has_hapvida") === "on";

  return {
    ok: true as const,
    row: {
      name: data.name,
      cpf: data.cpf,
      phone: data.phone || null,
      birth_date: data.birth_date || null,
      hire_date: data.hire_date,
      admission_exam_date: data.admission_exam_date || null,
      status: data.status,
      store_id: data.store_id,
      role: data.role || null,
      current_salary: data.current_salary ? Number(data.current_salary) : null,
      notes: data.notes || null,
      has_hapvida: hasHapvida,
      // Never allow dependents to be set without the plan itself.
      hapvida_dependents_count: hasHapvida ? Number(data.hapvida_dependents_count || 0) : 0,
      has_wellhub: formData.get("has_wellhub") === "on",
    },
  };
}

export async function createEmployee(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const result = toEmployeeRow(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .insert(result.row)
    .select("id")
    .single();

  if (error) {
    return { error: translateEmployeeError(error.message) };
  }

  revalidatePath("/colaboradores");
  redirect(`/colaboradores/${data.id}`);
}

export async function updateEmployee(
  employeeId: string,
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const result = toEmployeeRow(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("employees")
    .update(result.row)
    .eq("id", employeeId);

  if (error) {
    return { error: translateEmployeeError(error.message) };
  }

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${employeeId}`);
  redirect(`/colaboradores/${employeeId}`);
}

export async function upsertOnboarding(employeeId: string, formData: FormData) {
  const completed = formData.get("completed") === "on";
  const notes = (formData.get("notes") as string) || null;

  const supabase = await createClient();
  await supabase.from("onboarding").upsert(
    {
      employee_id: employeeId,
      completed,
      completed_date: completed ? new Date().toISOString().slice(0, 10) : null,
      notes,
    },
    { onConflict: "employee_id" },
  );

  revalidatePath(`/colaboradores/${employeeId}`);
}

function translateEmployeeError(message: string) {
  if (message.includes("employees_cpf_key")) return "Já existe um colaborador com esse CPF.";
  if (message.includes("employees_employee_number_key")) return "Já existe um colaborador com essa matrícula.";
  return "Não foi possível salvar o colaborador. Tente novamente.";
}
