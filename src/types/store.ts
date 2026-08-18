export type Store = {
  id: string;
  name: string;
  address: string | null;
  cnpj: string | null;
  phone: string | null;
  opened_at: string | null;
  manager_id: string | null;
  transport_benefit_value: number;
  meal_benefit_value: number;
  observes_fortaleza_holidays: boolean;
};

export type EmployeeStoreHistoryEntry = {
  id: string;
  employee_id: string;
  store_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type StoreLicenseType = "certificado_conformidade" | "alvara_funcionamento" | "licenca_sanitaria";
export type StoreLicenseStatus = "valido" | "vencendo_em_breve" | "vencido" | "sem_validade";

export type StoreLicense = {
  id: string;
  store_id: string;
  type: StoreLicenseType;
  file_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
  status: StoreLicenseStatus;
};
