"use client";

import React from "react";
import { PublicShell } from "@/components/layout";
import { LandingHero } from "./landing-hero";
import { LandingNews } from "./landing-news";
import { LandingBerakhlak } from "./landing-berakhlak";
import { LandingSpbe } from "./landing-spbe";
import { LandingGeneralInfo } from "./landing-general-info";
import { LandingSocial } from "./landing-social";

export function LandingPageView() {
  return (
    <PublicShell>
      <div className="leading-loose">
        <LandingHero />
        <LandingNews />
        <LandingBerakhlak />
        <LandingSpbe />
        <LandingGeneralInfo />
        <LandingSocial />
      </div>
    </PublicShell>
  );
}
