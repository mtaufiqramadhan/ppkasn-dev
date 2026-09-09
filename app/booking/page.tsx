import { redirect } from "next/navigation";

export default async function RoomBookingRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : undefined;
  if (date) {
    redirect(`/meeting-room/add?date=${encodeURIComponent(date)}`);
  }
  redirect("/meeting-room/add");
}

