import { google } from "googleapis";
import { Readable } from "stream";

// Personal Gmail accounts have no Shared Drives, and service accounts have
// no storage quota outside them — so uploads run as the real Google account
// via OAuth (one-time authorization, refresh token stored in env),
// not a service account.
function getOAuthClient() {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Drive não configurado. Defina GOOGLE_DRIVE_OAUTH_CLIENT_ID, GOOGLE_DRIVE_OAUTH_CLIENT_SECRET e GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN.",
    );
  }

  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export async function uploadFileToDrive(file: File): Promise<{ id: string; webViewLink: string }> {
  const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!folderId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado.");

  const auth = getOAuthClient();
  const drive = google.drive({ version: "v3", auth });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data } = await drive.files.create({
    requestBody: { name: file.name, parents: [folderId] },
    media: { mimeType: file.type || "application/octet-stream", body: Readable.from(buffer) },
    fields: "id, webViewLink",
  });

  if (!data.id || !data.webViewLink) throw new Error("Falha ao enviar arquivo para o Drive.");

  await drive.permissions.create({
    fileId: data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  return { id: data.id, webViewLink: data.webViewLink };
}
