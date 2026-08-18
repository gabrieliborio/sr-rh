"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { disconnectWhatsApp } from "./actions";

type Status = { configured: boolean; connected: boolean; loggedIn: boolean; qrcode: string | null };

export function WhatsAppCard({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!status.configured || status.loggedIn) return;

    const interval = setInterval(async () => {
      const response = await fetch("/api/whatsapp/status", { cache: "no-store" });
      if (response.ok) setStatus(await response.json());
    }, 5000);

    return () => clearInterval(interval);
  }, [status.configured, status.loggedIn]);

  if (!status.configured) {
    return (
      <Card>
        <CardHeader title="WhatsApp" action={<Badge tone="neutral">Não configurado</Badge>} />
        <CardBody>
          <p className="text-sm text-ink-muted">
            Defina EVOLUTION_API_URL e EVOLUTION_API_INSTANCE_TOKEN no .env.local para ativar as notificações.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="WhatsApp"
        action={
          <Badge tone={status.loggedIn ? "green" : "amber"}>
            {status.loggedIn ? "Conectado" : "Aguardando conexão"}
          </Badge>
        }
      />
      <CardBody>
        {status.loggedIn ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink-muted">
              O número está conectado — as notificações automáticas por WhatsApp estão ativas.
            </p>
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() => startTransition(async () => {
                await disconnectWhatsApp();
                setStatus((s) => ({ ...s, loggedIn: false }));
              })}
            >
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            {status.qrcode ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={status.qrcode}
                alt="QR code para conectar o WhatsApp"
                width={220}
                height={220}
                className="rounded-[var(--radius-card)] border border-border"
              />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border text-sm text-ink-muted">
                Gerando QR code...
              </div>
            )}
            <p className="max-w-sm text-sm text-ink-muted">
              Abra o WhatsApp no celular que vai representar o Sr. RH → Configurações → Aparelhos conectados →
              Conectar um aparelho, e escaneie o código acima. Ele se renova automaticamente a cada poucos segundos.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => startTransition(async () => {
                const response = await fetch("/api/whatsapp/status", { cache: "no-store" });
                if (response.ok) setStatus(await response.json());
              })}
              disabled={pending}
            >
              <RefreshCw size={14} strokeWidth={1.75} />
              Atualizar agora
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
