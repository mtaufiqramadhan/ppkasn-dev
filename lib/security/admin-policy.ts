/** Only server-controlled app_metadata or a server-side allowlist can grant CMS access. */
export interface CmsIdentity {
  email?: string;
  email_confirmed_at?: string;
  app_metadata?: Record<string, unknown>;
  is_anonymous?: boolean;
}

export function isCmsAdmin(user: CmsIdentity | null, adminEmails = process.env.CMS_ADMIN_EMAILS || ""): boolean {
  if (!user || user.is_anonymous) return false;
  if (user.app_metadata?.cms_role === "admin") return true;
  const allowed = adminEmails.split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return !!user.email_confirmed_at && !!user.email && allowed.includes(user.email.toLowerCase());
}
