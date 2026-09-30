import React from "react";
import { PROFILE_INFO } from "../data/profile-data";

export function ProfileHero() {
  return (
    <div className="mb-8 sm:mb-12 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
        Profil Lembaga
      </h1>
      <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-loose">
        {PROFILE_INFO.summary}
      </p>
    </div>
  );
}
