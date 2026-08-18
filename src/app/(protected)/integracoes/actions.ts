"use server";

import { revalidatePath } from "next/cache";
import { disconnectInstance } from "@/lib/evolution-api";

export async function disconnectWhatsApp() {
  await disconnectInstance();
  revalidatePath("/integracoes");
}
