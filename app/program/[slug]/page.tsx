import { getStoredPrograms } from "@/features/program/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout";
import { ProgramDetailView } from "@/features/program";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = getStoredPrograms().find(program => program.slug === slug || program.id === slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan | PPKASN Kemensetneg RI",
      description: "Program pelatihan yang Anda cari tidak ditemukan atau telah dipindahkan.",
    };
  }

  return {
    title: `${program.title} | PPKASN Kemensetneg RI`,
    description: program.shortDescription,
    openGraph: {
      title: `${program.title} | PPKASN Kemensetneg RI`,
      description: program.shortDescription,
      type: "website",
    },
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const program = getStoredPrograms().find(program => program.slug === slug || program.id === slug);

  if (!program) {
    notFound();
  }

  const allPrograms = getStoredPrograms();

  return (
    <PublicShell>
      <div className="leading-loose">
        <ProgramDetailView program={program} allPrograms={allPrograms} />
      </div>
    </PublicShell>
  );
}
