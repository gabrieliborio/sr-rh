import { NextResponse } from "next/server";
import { google } from "googleapis";

// Shows the refresh token once so it can be copied into
// GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN — nothing is persisted here.
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Defina GOOGLE_DRIVE_OAUTH_CLIENT_ID e GOOGLE_DRIVE_OAUTH_CLIENT_SECRET antes de autorizar." },
      { status: 500 },
    );
  }

  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Código de autorização ausente." }, { status: 400 });
  }

  const redirectUri = new URL("/api/google-drive/callback", request.url).toString();
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        error:
          "Google não retornou um refresh token (provavelmente já autorizado antes). Revogue o acesso em https://myaccount.google.com/permissions e tente de novo.",
      },
      { status: 400 },
    );
  }

  return new NextResponse(
    `<pre style="font-family:monospace;white-space:pre-wrap;padding:24px;">Copie este valor para GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN no .env.local:\n\n${tokens.refresh_token}</pre>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
