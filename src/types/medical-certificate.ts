export type MedicalCertificate = {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  attachment_url: string | null;
  discount_calculated: boolean;
  discount_applied: boolean;
  vt_discount_value: number;
  meal_discount_value: number;
  total_discount_value: number;
  store_id: string | null;
  created_at: string;
  stores?: { name: string } | null;
};
