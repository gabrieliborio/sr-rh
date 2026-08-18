"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StoreFormState = { error: string | null };

const storeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().optional(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  opened_at: z.string().optional(),
  manager_id: z.string().optional(),
  transport_benefit_value: z.string().min(1, "Valor de VT é obrigatório"),
  meal_benefit_value: z.string().min(1, "Valor de iFood é obrigatório"),
});

function toStoreRow(formData: FormData) {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    address: (formData.get("address") as string) || undefined,
    cnpj: (formData.get("cnpj") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    opened_at: (formData.get("opened_at") as string) || undefined,
    manager_id: (formData.get("manager_id") as string) || undefined,
    transport_benefit_value: formData.get("transport_benefit_value"),
    meal_benefit_value: formData.get("meal_benefit_value"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  return {
    ok: true as const,
    row: {
      name: data.name,
      address: data.address || null,
      cnpj: data.cnpj || null,
      phone: data.phone || null,
      opened_at: data.opened_at || null,
      manager_id: data.manager_id || null,
      transport_benefit_value: Number(data.transport_benefit_value),
      meal_benefit_value: Number(data.meal_benefit_value),
      observes_fortaleza_holidays: formData.get("observes_fortaleza_holidays") === "on",
    },
  };
}

export async function createStore(
  _prevState: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  const result = toStoreRow(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("stores").insert(result.row).select("id").single();

  if (error) return { error: "Não foi possível salvar a loja. Tente novamente." };

  revalidatePath("/lojas");
  redirect(`/lojas/${data.id}`);
}

export async function updateStore(
  storeId: string,
  _prevState: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  const result = toStoreRow(formData);
  if (!result.ok) return { error: result.error };

  const supabase = await createClient();
  const { error } = await supabase.from("stores").update(result.row).eq("id", storeId);

  if (error) return { error: "Não foi possível salvar a loja. Tente novamente." };

  revalidatePath("/lojas");
  revalidatePath(`/lojas/${storeId}`);
  redirect(`/lojas/${storeId}`);
}

export async function addLicense(storeId: string, formData: FormData) {
  const type = formData.get("type") as string;
  const validTypes = ["certificado_conformidade", "alvara_funcionamento", "licenca_sanitaria"];
  if (!validTypes.includes(type)) return;

  const supabase = await createClient();
  await supabase.from("store_licenses").insert({
    store_id: storeId,
    type,
    file_url: (formData.get("file_url") as string) || null,
    issue_date: (formData.get("issue_date") as string) || null,
    expiry_date: (formData.get("expiry_date") as string) || null,
  });

  revalidatePath(`/lojas/${storeId}`);
}
