export type UniformEntry = {
  id: string;
  employee_id: string;
  sent_date: string;
  notes: string | null;
};

export type DisciplinaryStatus = "suspensao" | "advertencia";

export type DisciplinaryRecord = {
  id: string;
  employee_id: string;
  reason: string;
  status: DisciplinaryStatus;
  start_date: string;
  end_date: string | null;
  attachment_url: string | null;
};

export type Negotiation = {
  id: string;
  employee_id: string;
  description: string;
  agreement_date: string;
  attachment_url: string | null;
  notes: string | null;
};

export type Vacation = {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  paid: boolean;
  negotiated: boolean;
  notes: string | null;
  days_count: number | null;
  discount_calculated: boolean;
  discount_applied: boolean;
  vt_discount_value: number;
  meal_discount_value: number;
  total_discount_value: number;
  store_id: string | null;
  stores?: { name: string } | null;
};
