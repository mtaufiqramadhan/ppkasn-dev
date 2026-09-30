"use client";

import { PublicShell } from "@/components/layout";
import { RoomBookingForm } from "@/features/room";

export default function RoomBookingAddPage() {
  return (
    <PublicShell>
      <RoomBookingForm />
    </PublicShell>
  );
}
