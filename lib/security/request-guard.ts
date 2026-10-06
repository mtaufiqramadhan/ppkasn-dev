import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, verifySameOrigin } from "@/lib/security";
import { isCmsAdmin } from "./admin-policy";
import { enforceRateLimit } from "./rate-limit";

export class RequestSecurityError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export async function requireCmsAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new RequestSecurityError("Silakan login terlebih dahulu.", 401);
  if (!isCmsAdmin(user)) throw new RequestSecurityError("Akun ini tidak memiliki akses CMS.", 403);
  return { supabase, user };
}

export async function guardMutation(request: NextRequest, namespace: string, limit = 30, windowMs = 60000) {
  if (!verifySameOrigin(request)) throw new RequestSecurityError("Origin permintaan tidak valid.", 403);
  let result;
  try { result = await enforceRateLimit(`${namespace}:${getClientIp(request)}`, limit, windowMs); }
  catch { throw new RequestSecurityError("Layanan sementara tidak tersedia. Silakan coba lagi.", 503); }
  if (!result.success) throw new RequestSecurityError("Terlalu banyak permintaan. Silakan coba beberapa saat lagi.", 429);
}

/** Count bytes while streaming, even when Content-Length is absent or misleading. */
export async function readLimitedBody(request: Request, maxBytes = 512 * 1024): Promise<Uint8Array> {
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) throw new RequestSecurityError("Payload terlalu besar.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestSecurityError("Payload wajib diisi.", 400);
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new RequestSecurityError("Payload terlalu besar.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

export async function readJsonBody(request: Request, maxBytes = 512 * 1024): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new RequestSecurityError("Content-Type harus application/json.", 415);
  const bytes = await readLimitedBody(request, maxBytes);
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; }
  catch { throw new RequestSecurityError("JSON tidak valid.", 400); }
}

export function securityFailure(error: unknown) {
  if (error instanceof RequestSecurityError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store", ...(error.status === 429 ? { "Retry-After": "60" } : {}) } });
  console.error("Server request failed", error instanceof Error ? error.name : "Unknown error");
  return NextResponse.json({ error: "Gagal memproses permintaan. Silakan coba lagi." }, { status: 500, headers: { "Cache-Control": "no-store" } });
}
