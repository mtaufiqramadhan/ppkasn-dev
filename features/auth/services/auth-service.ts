"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getClientIpFromHeaders, verifyOrigin } from "@/lib/security";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isCmsAdmin } from "@/lib/security/admin-policy";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "../schemas/login-schema";
import { type LoginState } from "../types";

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Input tidak valid. Silakan periksa email dan password Anda.",
      email: typeof rawData.email === "string" ? rawData.email : "",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const requestHeaders = await headers();
  const expectedOrigin = process.env.APP_ORIGIN || `${process.env.NODE_ENV === "production" ? "https" : "http"}://${requestHeaders.get("host") || "localhost:3000"}`;
  if (!verifyOrigin(requestHeaders, expectedOrigin)) return { error: "Permintaan login tidak valid.", email };
  try {
    const limits = await Promise.all([
      enforceRateLimit(`login:account:${email.toLowerCase()}`, 5, 15 * 60000),
      enforceRateLimit(`login:ip:${getClientIpFromHeaders(requestHeaders)}`, 15, 15 * 60000),
      enforceRateLimit("login:global", 100, 60000),
    ]);
    if (limits.some(result => !result.success)) return { error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.", email };
  } catch { return { error: "Login sementara tidak tersedia. Silakan coba lagi.", email }; }
  const captchaToken = formData.get("cf-turnstile-response");
  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (typeof captchaToken !== "string" || !captchaToken || captchaToken.length > 2048)) return { error: "Selesaikan verifikasi keamanan terlebih dahulu.", email };
  const supabase = await createClient();


  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: typeof captchaToken === "string" && captchaToken ? { captchaToken } : undefined,
  });

  if (error) {
    return {
      error: "Email atau password tidak valid, atau akun tidak memiliki akses CMS.",
      email,
    };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !isCmsAdmin(user)) {
    await supabase.auth.signOut();
    return { error: "Email atau password tidak valid, atau akun tidak memiliki akses CMS.", email };
  }
  revalidatePath("/", "layout");
  redirect("/cms/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}
