"use client";

import { useActionState } from "react";
import { EMPLOYEE_ROLES } from "@/lib/constants";
import { Field, Input, Select, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";
import type { HireFormState } from "../../actions";

const initialState: HireFormState = { error: null };

export function HireForm({
  action,
  defaultRole,
  stores,
}: {
  action: (state: HireFormState, formData: FormData) => Promise<HireFormState>;
  defaultRole: string;
  stores: Store[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const matchedRole = EMPLOYEE_ROLES.find((role) => role === defaultRole) ?? "";

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <Field label="CPF" htmlFor="cpf" required>
        <Input id="cpf" name="cpf" required mono />
      </Field>

      <Field label="Data de admissão" htmlFor="hire_date" required>
        <Input id="hire_date" name="hire_date" type="date" required />
      </Field>

      <Field label="Loja" htmlFor="store_id" required>
        <Select id="store_id" name="store_id" required defaultValue="">
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

      <Field label="Cargo" htmlFor="role" hint={defaultRole && !matchedRole ? `Vaga era "${defaultRole}" — não corresponde a um cargo da lista` : undefined}>
        <Select id="role" name="role" defaultValue={matchedRole}>
          <option value="">Selecione</option>
          {EMPLOYEE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar colaborador"}
      </Button>
    </form>
  );
}
