"use client";

import { useActionState } from "react";
import { Field, Input, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { PurchaseFormState } from "../actions";

const initialState: PurchaseFormState = { error: null };

export function PurchaseForm({
  action,
}: {
  action: (state: PurchaseFormState, formData: FormData) => Promise<PurchaseFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <Field label="Data da compra" htmlFor="purchase_date" required>
        <Input id="purchase_date" name="purchase_date" type="date" required />
      </Field>

      <Field label="Número da OS" htmlFor="os_number">
        <Input id="os_number" name="os_number" type="text" mono />
      </Field>

      <Field label="Valor total" htmlFor="total_value" required>
        <Input id="total_value" name="total_value" type="number" step="0.01" required mono />
      </Field>

      <Field label="Número de parcelas" htmlFor="installments_count" required>
        <Input id="installments_count" name="installments_count" type="number" min={1} defaultValue={1} required mono />
      </Field>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar compra"}
      </Button>
    </form>
  );
}
