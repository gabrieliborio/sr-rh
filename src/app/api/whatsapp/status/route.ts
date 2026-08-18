import { NextResponse } from "next/server";
import { getInstanceStatus, getInstanceQrCode, isEvolutionApiConfigured } from "@/lib/evolution-api";

export async function GET() {
  if (!isEvolutionApiConfigured()) {
    return NextResponse.json({ configured: false, connected: false, loggedIn: false, qrcode: null });
  }

  const status = await getInstanceStatus();
  const qrcode = status.loggedIn ? null : await getInstanceQrCode();

  return NextResponse.json({ configured: true, ...status, qrcode });
}
