import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { RingDot } from "@/components/ui/ring";
import type { Tone } from "@/components/ui/tokens";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);

  const [
    { count: activeCount },
    { count: evaluationCount },
    { count: pendingDiscountCount },
    { count: expiringLicensesCount },
    { count: dueInstallmentsCount },
  ] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .neq("status", "desligado")
      .gte("evaluation_90_date", today),
    supabase
      .from("medical_certificates")
      .select("id", { count: "exact", head: true })
      .eq("discount_applied", false),
    supabase
      .from("store_licenses")
      .select("id", { count: "exact", head: true })
      .not("expiry_date", "is", null)
      .lte("expiry_date", in30Days),
    supabase
      .from("employee_purchase_installments")
      .select("id", { count: "exact", head: true })
      .eq("status", "nao_pago")
      .lte("due_date", in30Days),
  ]);

  const stats: { label: string; value: number; tone: Tone; href: string }[] = [
    { label: "Colaboradores ativos", value: activeCount ?? 0, tone: "blue", href: "/colaboradores" },
    { label: "Em período de avaliação", value: evaluationCount ?? 0, tone: "accent", href: "/colaboradores" },
    { label: "Descontos de atestado pendentes", value: pendingDiscountCount ?? 0, tone: "amber", href: "/colaboradores" },
    { label: "Licenças vencendo em 30 dias", value: expiringLicensesCount ?? 0, tone: "red", href: "/lojas" },
    { label: "Parcelas a vencer em 30 dias", value: dueInstallmentsCount ?? 0, tone: "amber", href: "/colaboradores" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Painel"
        title="Início"
        description="Visão geral rápida do dia a dia de RH — colaboradores, avaliações, atestados, licenças e pagamentos."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-colors hover:border-accent/40">
              <CardBody className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-3xl tabular-nums text-ink">{stat.value}</p>
                  <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
                </div>
                <RingDot tone={stat.tone} size={11} />
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody>
          <h2 className="mb-3 text-sm font-semibold text-ink">Atalhos</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/colaboradores/novo" className="text-tint hover:text-ink hover:underline">
              Cadastrar colaborador
            </Link>
            <span className="text-border">·</span>
            <Link href="/calendario" className="text-tint hover:text-ink hover:underline">
              Ver calendário do mês
            </Link>
            <span className="text-border">·</span>
            <Link href="/relatorios" className="text-tint hover:text-ink hover:underline">
              Exportar relatório
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
