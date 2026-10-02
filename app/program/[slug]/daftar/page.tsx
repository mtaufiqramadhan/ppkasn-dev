import { notFound, redirect } from "next/navigation";
import { ProgramService } from "@/features/program";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = ProgramService.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProgramRegistrationPage({ params }: PageProps) {
  const { slug } = await params;
  const program = ProgramService.getProgramBySlugOrId(slug);

  if (!program) {
    notFound();
  }

  redirect(`/program/${program.slug}#form-pendaftaran`);
}
