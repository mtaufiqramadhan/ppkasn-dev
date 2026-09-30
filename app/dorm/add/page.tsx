"use client";

import { PublicShell } from "@/components/layout";
import { DormBookingForm } from "@/features/dorm";

export default function DormBookingAddPage() {
  return (
    <PublicShell>
      <DormBookingForm />
    </PublicShell>
  );
}
