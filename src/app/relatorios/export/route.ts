import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { EMPLOYEE_STATUS_LABELS, type EmployeeStatus } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "colaboradores";
  const storeId = searchParams.get("store_id") || null;

  const supabase = await createClient();
  let csv = "";
  let filename = "relatorio.csv";

  if (type === "colaboradores") {
    let query = supabase
      .from("employees")
      .select("name, employee_number, role, status, hire_date, stores!employees_store_id_fkey!inner(name)")
      .order("name");
    if (storeId) query = query.eq("store_id", storeId);

    const { data } = await query.returns<
      { name: string; employee_number: string; role: string | null; status: EmployeeStatus; hire_date: string; stores: { name: string } }[]
    >();

    csv = toCsv(
      (data ?? []).map((e) => ({
        Nome: e.name,
        Matrícula: e.employee_number,
        Cargo: e.role ?? "",
        Status: EMPLOYEE_STATUS_LABELS[e.status],
        Loja: e.stores.name,
        "Data de admissão": e.hire_date,
      })),
    );
    filename = "colaboradores.csv";
  } else if (type === "ferias_programadas") {
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("vacations")
      .select("start_date, end_date, paid, negotiated, employees!inner(name, store_id, stores!employees_store_id_fkey(name))")
      .gte("start_date", today)
      .order("start_date");
    if (storeId) query = query.eq("employees.store_id", storeId);

    const { data } = await query.returns<
      { start_date: string; end_date: string; paid: boolean; negotiated: boolean; employees: { name: string; stores: { name: string } } }[]
    >();

    csv = toCsv(
      (data ?? []).map((v) => ({
        Colaborador: v.employees.name,
        Loja: v.employees.stores.name,
        Início: v.start_date,
        Fim: v.end_date,
        Paga: v.paid ? "Sim" : "Não",
        Negociada: v.negotiated ? "Sim" : "Não",
      })),
    );
    filename = "ferias-programadas.csv";
  } else if (type === "avaliacoes_pendentes") {
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("employees")
      .select("name, role, hire_date, evaluation_30_date, evaluation_90_date, stores!employees_store_id_fkey!inner(name)")
      .neq("status", "desligado")
      .gte("evaluation_90_date", today)
      .order("hire_date");
    if (storeId) query = query.eq("store_id", storeId);

    const { data } = await query.returns<
      { name: string; role: string | null; hire_date: string; evaluation_30_date: string; evaluation_90_date: string; stores: { name: string } }[]
    >();

    csv = toCsv(
      (data ?? []).map((e) => ({
        Colaborador: e.name,
        Loja: e.stores.name,
        Cargo: e.role ?? "",
        "Data de admissão": e.hire_date,
        "Fim da avaliação (30d)": e.evaluation_30_date,
        "Fim da avaliação (90d)": e.evaluation_90_date,
      })),
    );
    filename = "avaliacoes-pendentes.csv";
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
