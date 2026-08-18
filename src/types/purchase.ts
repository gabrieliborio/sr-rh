export type InstallmentStatus = "pago" | "nao_pago";

export type PurchaseInstallment = {
  id: string;
  purchase_id: string;
  installment_number: number;
  due_date: string;
  value: number;
  status: InstallmentStatus;
  paid_at: string | null;
  whatsapp_notified: boolean;
  whatsapp_notified_at: string | null;
};

export type Purchase = {
  id: string;
  employee_id: string;
  purchase_date: string;
  os_number: string | null;
  total_value: number;
  installments_count: number;
  created_at: string;
  employee_purchase_installments?: PurchaseInstallment[];
};
