// Thin wrapper around the self-hosted Evolution Go instance (api.acelerium.marketing).
// Auth here is the per-instance token (not a global admin key) — every call
// below is scoped to whichever WhatsApp number is linked to that token.
function getConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const instanceToken = process.env.EVOLUTION_API_INSTANCE_TOKEN;
  if (!baseUrl || !instanceToken) return null;
  return { baseUrl, instanceToken };
}

export function isEvolutionApiConfigured() {
  return getConfig() !== null;
}

export async function getInstanceStatus(): Promise<{ connected: boolean; loggedIn: boolean }> {
  const config = getConfig();
  if (!config) return { connected: false, loggedIn: false };

  const response = await fetch(`${config.baseUrl}/instance/status`, {
    headers: { apikey: config.instanceToken },
    cache: "no-store",
  });
  if (!response.ok) return { connected: false, loggedIn: false };

  const body = await response.json();
  return { connected: Boolean(body.data?.Connected), loggedIn: Boolean(body.data?.LoggedIn) };
}

export async function getInstanceQrCode(): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  const response = await fetch(`${config.baseUrl}/instance/qr`, {
    headers: { apikey: config.instanceToken },
    cache: "no-store",
  });
  if (!response.ok) return null;

  const body = await response.json();
  return body.data?.qrcode ?? null;
}

export async function disconnectInstance() {
  const config = getConfig();
  if (!config) throw new Error("Evolution API não configurada.");

  const response = await fetch(`${config.baseUrl}/instance/disconnect`, {
    method: "POST",
    headers: { apikey: config.instanceToken },
  });
  if (!response.ok) throw new Error(`Falha ao desconectar (status ${response.status})`);
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  const config = getConfig();
  if (!config) {
    throw new Error("Evolution API não configurada. Defina EVOLUTION_API_URL e EVOLUTION_API_INSTANCE_TOKEN.");
  }

  const response = await fetch(`${config.baseUrl}/send/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.instanceToken,
    },
    body: JSON.stringify({ number: phone, text: message }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar mensagem via Evolution API (status ${response.status})`);
  }

  return response.json();
}
