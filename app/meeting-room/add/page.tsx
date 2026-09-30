"use client";

import { Suspense } from "react";
import { PublicShell } from "@/components/layout";
import { ServicesProvider, RoomBookingSystem } from "@/features/booking";

export default function MeetingRoomBookingPage() {
  return (
    <PublicShell>
      <ServicesProvider>
        <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
          <RoomBookingSystem />
        </Suspense>
      </ServicesProvider>
    </PublicShell>
  );
}
