export function buildContentSecurityPolicy(nonce?: string, development = process.env.NODE_ENV !== "production") {
  const scripts = development
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
    : nonce ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com` : "'self' https://challenges.cloudflare.com";
  return [
    "default-src 'self'",
    `script-src ${scripts}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://ppkasn.setneg.go.id https://github.com https://*.githubusercontent.com https://*.googleusercontent.com https://*.supabase.co",
    "font-src 'self' https://fonts.gstatic.com data:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com${development ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'", "form-action 'self'", "base-uri 'self'", "object-src 'none'",
  ].join("; ") + ";";
}
