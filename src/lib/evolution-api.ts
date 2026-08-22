// Thin wrapper around the self-hosted Evolution Go instance (api.acelerium.marketing).
// Auth here is the per-instance token (not a global admin key) — scoped to
// whichever WhatsApp number is linked to that token.
function getConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const instanceToken = process.env.EVOLUTION_API_INSTANCE_TOKEN;
  if (!baseUrl || !instanceToken) return null;
  return { baseUrl, instanceToken };
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
