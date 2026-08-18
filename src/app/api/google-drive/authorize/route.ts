import { NextResponse } from "next/server";
import { google } from "googleapis";

// One-time setup route: redirects RH's Google login through the consent
// screen so we can capture a refresh token for src/lib/google-drive.ts.
// Protected by proxy.ts like every other route — only a logged-in Sr. RH
// user can reach it.
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Defina GOOGLE_DRIVE_OAUTH_CLIENT_ID e GOOGLE_DRIVE_OAUTH_CLIENT_SECRET antes de autorizar." },
      { status: 500 },
    );
  }

  const redirectUri = new URL("/api/google-drive/callback", request.url).toString();
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive"],
  });

  return NextResponse.redirect(url);
}
