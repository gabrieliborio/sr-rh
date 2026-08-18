import type { StoreLicenseType, StoreLicenseStatus } from "@/types/store";

export const STORE_LICENSE_TYPE_LABELS: Record<StoreLicenseType, string> = {
  certificado_conformidade: "Certificado de conformidade",
  alvara_funcionamento: "Alvará de funcionamento",
  licenca_sanitaria: "Licença sanitária",
};

export const STORE_LICENSE_STATUS_LABELS: Record<StoreLicenseStatus, string> = {
  valido: "Válido",
  vencendo_em_breve: "Vencendo em breve",
  vencido: "Vencido",
  sem_validade: "Sem validade definida",
};

export const STORE_LICENSE_STATUS_TONE: Record<StoreLicenseStatus, "green" | "amber" | "red" | "neutral"> = {
  valido: "green",
  vencendo_em_breve: "amber",
  vencido: "red",
  sem_validade: "neutral",
};
