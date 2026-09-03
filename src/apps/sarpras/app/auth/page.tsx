"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth";
import { cn } from "@/lib/utils";

const ASSETS = {
  BACKGROUND: "/bg-cover.jpeg",
} as const;

const TEXTS = {
  BRAND: {
    TITLE: "Sarana Prasarana",
    SUBTITLE: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara",
  },
  IMAGE_ALT: "Background Cover",
} as const;

const BackgroundLayer = React.memo(() => (
  <>
    <Image
      src={ASSETS.BACKGROUND}
      alt={TEXTS.IMAGE_ALT}
      fill
      priority
      className="object-cover"
    />
    <div className="absolute inset-0 bg-black/70" />
  </>
));
BackgroundLayer.displayName = "BackgroundLayer";

const BrandSection = React.memo(() => (
  <div className="hidden sm:block absolute bottom-12 left-6 sm:bottom-12 sm:left-12 text-white max-w-[90%] sm:max-w-md">
    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-snug tracking-tight">
      {TEXTS.BRAND.TITLE}
    </h1>
    <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-200">
      {TEXTS.BRAND.SUBTITLE}
    </p>
  </div>
));
BrandSection.displayName = "BrandSection";

const LoginCard = React.memo(({ className }: { className?: string }) => (
  <Card
    className={cn(
      "w-full max-w-sm sm:max-w-md shadow-none rounded-3xl",
      "bg-black backdrop-blur-lg border border-dashed border-gray-400",
      className
    )}
  >
    <CardContent className="px-8 py-4">
      <LoginForm />
    </CardContent>
  </Card>
));
LoginCard.displayName = "LoginCard";

export default function LoginPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <BackgroundLayer />

      <div className="absolute inset-0 flex items-center justify-center p-4 md:justify-end md:pr-12">
        <LoginCard />
      </div>

      <BrandSection />
    </main>
  );
}
