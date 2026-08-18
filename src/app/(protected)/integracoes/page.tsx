import { PageHeader } from "@/components/ui/page-header";
import { getInstanceStatus, getInstanceQrCode, isEvolutionApiConfigured } from "@/lib/evolution-api";
import { WhatsAppCard } from "./whatsapp-card";

export default async function IntegracoesPage() {
  const configured = isEvolutionApiConfigured();
  const status = configured ? await getInstanceStatus() : { connected: false, loggedIn: false };
  const qrcode = configured && !status.loggedIn ? await getInstanceQrCode() : null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Integrações" description="Conexão do WhatsApp usada pelo Sr. RH para notificações." />

      <WhatsAppCard initialStatus={{ configured, ...status, qrcode }} />
    </div>
  );
}
