export const EMPLOYEE_STATUSES = ["ativo", "ferias", "afastado", "desligado"] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ativo: "Ativo",
  ferias: "Férias",
  afastado: "Afastado",
  desligado: "Desligado",
};

export const EMPLOYEE_STATUS_BADGE_TONE: Record<EmployeeStatus, "green" | "blue" | "amber" | "neutral"> = {
  ativo: "green",
  ferias: "blue",
  afastado: "amber",
  desligado: "neutral",
};

// Fixed list of job titles — single source of truth, mirrors the
// `employee_role_enum` Postgres type. Update both together.
export const EMPLOYEE_ROLES = [
  "Auxiliar de vendas",
  "Vendedor",
  "Consultor de vendas",
  "Consultor comercial",
  "Auxiliar de Laboratório",
  "Montador Óptico",
  "Gerente de Laboratório",
  "Gerente de loja",
  "Gerente Comercial",
  "Assistente administrativo",
  "Auxiliar administrativo",
  "Estoquista",
  "Motoqueiro",
  "Assistente de estoque",
  "Assistente de operações",
  "Assistente de departamento de pessoas",
  "Motoboy",
  "Balcão",
  "Auxiliar de manutenção",
  "Assistente de Marketing",
  "Auxiliar de atendimento",
] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];
