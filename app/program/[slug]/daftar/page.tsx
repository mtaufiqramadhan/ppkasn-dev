import { getStoredPrograms } from "@/features/program/server";
import { notFound, redirect } from "next/navigation";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProgramRegistrationPage({ params }: PageProps) {
  const { slug } = await params;
  const program = getStoredPrograms().find(program => program.slug === slug || program.id === slug);

  if (!program) {
    notFound();
  }

  redirect(`/program/${program.slug}#form-pendaftaran`);
}
