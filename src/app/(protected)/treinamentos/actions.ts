"use server";

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
