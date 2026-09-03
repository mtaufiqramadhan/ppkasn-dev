"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { type BookingServices } from "../types";
import { roomRepository, bookingRepository } from "../services/booking-service";

const defaultServices: BookingServices = {
  roomRepo: roomRepository,
  bookingRepo: bookingRepository,
};

const ServicesContext = createContext<BookingServices>(defaultServices);

export function ServicesProvider({
  services = {},
  children,
}: {
  services?: Partial<BookingServices>;
  children: ReactNode;
}) {
  const merged = useMemo(
    () => ({ ...defaultServices, ...services }),
    [services]
  );
  return (
    <ServicesContext.Provider value={merged}>
      {children}
    </ServicesContext.Provider>
  );
}

export const useServices = () => useContext(ServicesContext);
