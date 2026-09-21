import { Metadata } from "next";
import { AirbnbBookingView } from "@/features/booking";

export const metadata: Metadata = {
  title: "Eksplorasi & Booking Ruangan | Ruangan Gaharu PPKASN",
  description:
    "Eksplorasi dan booking ruang rapat eksekutif, auditorium representatif, studio multimedia, dan ruang diskusi di Gedung PPKASN Kemensetneg dengan fasilitas lengkap.",
  openGraph: {
    title: "Eksplorasi & Booking Ruangan | Ruangan Gaharu PPKASN",
    description:
      "Sistem peminjaman dan reservasi ruangan modern bergaya Airbnb di PPKASN Kemensetneg.",
    type: "website",
  },
};

export default function BookingPage() {
  return <AirbnbBookingView />;
}
