import type { EmployeeRole, EmployeeStatus } from "@/lib/constants";

export type Employee = {
  id: string;
  name: string;
  cpf: string;
  employee_number: string;
  phone: string | null;
  birth_date: string | null;
  hire_date: string;
  admission_exam_date: string | null;
  status: EmployeeStatus;
  store_id: string;
  role: EmployeeRole | null;
  current_salary: number | null;
  notes: string | null;
  has_hapvida: boolean;
  hapvida_dependents_count: number;
  has_wellhub: boolean;
  evaluation_30_date: string;
  evaluation_90_date: string;
  created_at: string;
  updated_at: string;
};

export type EmployeeListItem = Pick<
  Employee,
  "id" | "name" | "employee_number" | "store_id" | "role" | "status"
>;

export type Onboarding = {
  id: string;
  employee_id: string;
  completed: boolean;
  completed_date: string | null;
  notes: string | null;
};

export type EmployeeAbsence = {
  id: string;
  employee_id: string;
  date: string;
  justified: boolean;
  reason: string | null;
  created_at: string;
};
