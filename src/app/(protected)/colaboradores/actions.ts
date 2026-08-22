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

export type TransferFormState = { error: string | null };

export async function transferEmployeeStore(
  employeeId: string,
  _prevState: TransferFormState,
  formData: FormData,
): Promise<TransferFormState> {
  const newStoreId = formData.get("store_id") as string;
  if (!newStoreId) return { error: "Selecione a loja de destino." };

  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("store_id")
    .eq("id", employeeId)
    .maybeSingle<{ store_id: string }>();

  if (employee?.store_id === newStoreId) {
    return { error: "Selecione uma loja diferente da atual." };
  }

  // employee_store_history is kept in sync automatically by a DB trigger
  // on this update (closes the open row, opens a new one from today).
  const { error } = await supabase.from("employees").update({ store_id: newStoreId }).eq("id", employeeId);
  if (error) {
    return { error: "Não foi possível transferir o colaborador. Tente novamente." };
  }

  revalidatePath(`/colaboradores/${employeeId}`);
  revalidatePath("/colaboradores");
  redirect(`/colaboradores/${employeeId}`);
}

export type DeleteEmployeeFormState = { error: string | null };

// Confirmation happens client-side (typed-name match) — state/formData are
// unused but required by useActionState's action signature.
export async function deleteEmployee(
  employeeId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: DeleteEmployeeFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<DeleteEmployeeFormState> {
  const supabase = await createClient();

  const { data: managedStores } = await supabase
    .from("stores")
    .select("name")
    .eq("manager_id", employeeId)
    .returns<{ name: string }[]>();

  if (managedStores && managedStores.length > 0) {
    const names = managedStores.map((s) => s.name).join(", ");
    return {
      error: `Não é possível excluir: este colaborador é o gestor responsável da loja ${names}. Troque o gestor na ficha da loja antes de excluir.`,
    };
  }

  // Recruitment history keeps a soft link to the hired employee — clear it
  // rather than blocking the delete, the candidate record itself is untouched.
  await supabase.from("candidates").update({ hired_employee_id: null }).eq("hired_employee_id", employeeId);

  const { error } = await supabase.from("employees").delete().eq("id", employeeId);
  if (error) {
    return { error: "Não foi possível excluir o colaborador. Tente novamente." };
  }

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}
