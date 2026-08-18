"use client";

import { useActionState } from "react";
import { Field, FieldGroup, Input, Select, Checkbox, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";
import type { StoreFormState } from "./actions";

const initialState: StoreFormState = { error: null };

export function StoreForm({
  action,
  store,
  employees,
}: {
  action: (state: StoreFormState, formData: FormData) => Promise<StoreFormState>;
  store?: Store;
  employees: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <FieldGroup title="Dados da loja">
        <Field label="Nome" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={store?.name} required />
        </Field>

        <Field label="Endereço" htmlFor="address">
          <Input id="address" name="address" defaultValue={store?.address ?? ""} />
        </Field>

        <Field label="CNPJ" htmlFor="cnpj">
          <Input id="cnpj" name="cnpj" defaultValue={store?.cnpj ?? ""} mono />
        </Field>

        <Field label="Telefone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={store?.phone ?? ""} mono />
        </Field>

        <Field label="Data de inauguração" htmlFor="opened_at">
          <Input id="opened_at" name="opened_at" type="date" defaultValue={store?.opened_at ?? ""} />
        </Field>
      </FieldGroup>

      <FieldGroup title="Gestor e benefícios">
        <Field label="Gestor responsável" htmlFor="manager_id">
          <Select id="manager_id" name="manager_id" defaultValue={store?.manager_id ?? ""}>
            <option value="">Nenhum</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </Select>
        </Field>

        <div />

        <Field label="Valor de VT/dia" htmlFor="transport_benefit_value" required>
          <Input
            id="transport_benefit_value"
            name="transport_benefit_value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={store?.transport_benefit_value ?? ""}
            required
            mono
          />
        </Field>

        <Field label="Valor de iFood/dia" htmlFor="meal_benefit_value" required>
          <Input
            id="meal_benefit_value"
            name="meal_benefit_value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={store?.meal_benefit_value ?? ""}
            required
            mono
          />
        </Field>

        <div className="sm:col-span-2">
          <Checkbox
            name="observes_fortaleza_holidays"
            label="Observa feriados municipais de Fortaleza"
            defaultChecked={store ? store.observes_fortaleza_holidays : true}
          />
        </div>
      </FieldGroup>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar loja"}
      </Button>
    </form>
  );
}
