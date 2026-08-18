"use client";

import { useActionState, useState } from "react";
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES, EMPLOYEE_STATUS_LABELS } from "@/lib/constants";
import { Field, FieldGroup, Input, Select, Textarea, Checkbox, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/types/employee";
import type { Store } from "@/types/store";
import type { EmployeeFormState } from "./actions";

const initialState: EmployeeFormState = { error: null };

export function EmployeeForm({
  action,
  employee,
  stores,
  managerName,
}: {
  action: (state: EmployeeFormState, formData: FormData) => Promise<EmployeeFormState>;
  employee?: Employee;
  stores: Store[];
  managerName?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [hasHapvida, setHasHapvida] = useState(employee?.has_hapvida ?? false);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <FieldGroup title="Dados pessoais">
        <Field label="Nome" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={employee?.name} required />
        </Field>

        <Field label="CPF" htmlFor="cpf" required>
          <Input id="cpf" name="cpf" defaultValue={employee?.cpf} required mono />
        </Field>

        <Field label="Telefone (WhatsApp)" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" placeholder="5585999999999" defaultValue={employee?.phone ?? ""} mono />
        </Field>

        <Field label="Data de nascimento" htmlFor="birth_date">
          <Input id="birth_date" name="birth_date" type="date" defaultValue={employee?.birth_date ?? ""} />
        </Field>
      </FieldGroup>

      <FieldGroup title="Dados de admissão">
        {employee ? (
          <Field label="Matrícula" htmlFor="employee_number">
            <Input id="employee_number" defaultValue={employee.employee_number} readOnly disabled mono />
          </Field>
        ) : (
          <Field label="Matrícula" htmlFor="employee_number" hint="Gerada automaticamente ao salvar">
            <Input id="employee_number" placeholder="SRO-0000" disabled mono />
          </Field>
        )}

        <Field label="Data de admissão" htmlFor="hire_date" required>
          <Input id="hire_date" name="hire_date" type="date" defaultValue={employee?.hire_date} required />
        </Field>

        <Field label="Data do exame admissional" htmlFor="admission_exam_date">
          <Input
            id="admission_exam_date"
            name="admission_exam_date"
            type="date"
            defaultValue={employee?.admission_exam_date ?? ""}
          />
        </Field>

        <Field label="Loja" htmlFor="store_id" required>
          <Select id="store_id" name="store_id" defaultValue={employee?.store_id ?? ""} required>
            <option value="" disabled>
              Selecione
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
        </Field>

        {employee && (
          <Field label="Gestor responsável" htmlFor="manager_display" hint="Definido na loja — edite em Lojas">
            <Input id="manager_display" defaultValue={managerName ?? "Nenhum"} readOnly disabled />
          </Field>
        )}

        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={employee?.status ?? "ativo"} required>
            {EMPLOYEE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {EMPLOYEE_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Cargo" htmlFor="role">
          <Select id="role" name="role" defaultValue={employee?.role ?? ""}>
            <option value="">Selecione</option>
            {EMPLOYEE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Salário atual" htmlFor="current_salary">
          <Input id="current_salary" name="current_salary" type="number" step="0.01" defaultValue={employee?.current_salary ?? ""} mono />
        </Field>
      </FieldGroup>

      <FieldGroup title="Benefícios">
        <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
          <Checkbox
            name="has_hapvida"
            label="Hapvida"
            checked={hasHapvida}
            onChange={(e) => setHasHapvida(e.target.checked)}
          />
          <Checkbox name="has_wellhub" label="Wellhub" defaultChecked={employee?.has_wellhub} />
        </div>

        {hasHapvida && (
          <Field label="Dependentes no Hapvida" htmlFor="hapvida_dependents_count">
            <Input
              id="hapvida_dependents_count"
              name="hapvida_dependents_count"
              type="number"
              min={0}
              step={1}
              defaultValue={employee?.hapvida_dependents_count ?? 0}
              mono
            />
          </Field>
        )}
      </FieldGroup>

      <Field label="Observações" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} defaultValue={employee?.notes ?? ""} />
      </Field>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar colaborador"}
      </Button>
    </form>
  );
}
