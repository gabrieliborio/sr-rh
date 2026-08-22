"use client";

import { useActionState } from "react";
import { Field, Select, FormError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";
import type { TransferFormState } from "../../actions";

const initialState: TransferFormState = { error: null };

export function TransferForm({
  action,
  currentStoreId,
  stores,
}: {
  action: (state: TransferFormState, formData: FormData) => Promise<TransferFormState>;
  currentStoreId: string;
  stores: Store[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-6">
      <Field label="Nova loja" htmlFor="store_id" required>
        <Select id="store_id" name="store_id" defaultValue="" required>
          <option value="" disabled>
            Selecione
          </option>
          {stores
            .filter((store) => store.id !== currentStoreId)
            .map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
        </Select>
      </Field>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={pending}>
        {pending ? "Transferindo..." : "Confirmar transferência"}
      </Button>
    </form>
  );
}
