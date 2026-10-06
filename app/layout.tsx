import { headers } from "next/headers";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import { QueryProvider } from "@/providers";
import { AccessibilityProvider } from "@/providers/accessibility-provider";
import { AccessibilityWidget } from "@/components/layout/accessibility-widget";

const font = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SARPRAS - Sistem Manajemen Sarana & Prasarana",
  description:
    "Sistem Informasi Pengelolaan Aset dan Peminjaman Ruangan & Asrama PPKASN Kemensetneg",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <AccessibilityProvider nonce={nonce}>
          <QueryProvider>{children}</QueryProvider>
          <AccessibilityWidget />
          <Toaster />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
