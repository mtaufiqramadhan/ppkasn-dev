"use client";

import { Suspense } from "react";
import { ServicesProvider, RoomBookingSystem } from "@/features/booking";

export default function RoomBookingPage() {
  return (
    <ServicesProvider>
      <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
        <RoomBookingSystem />
      </Suspense>
    </ServicesProvider>
  );
}
