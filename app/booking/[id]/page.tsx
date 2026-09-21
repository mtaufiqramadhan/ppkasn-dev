import { Metadata } from "next";
import { AirbnbRoomDetailView } from "@/features/booking";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: RoomDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Detail Ruangan ${id} | Ruangan Gaharu PPKASN`,
    description: `Informasi detail, fasilitas, kapasitas, dan formulir reservasi ruangan di Gedung PPKASN Kemensetneg.`,
  };
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { id } = await params;
  return <AirbnbRoomDetailView roomId={id} />;
}
