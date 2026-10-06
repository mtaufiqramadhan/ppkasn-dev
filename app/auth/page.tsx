import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animation";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-stretch bg-background selection:bg-primary/30 lg:bg-neutral-950 lg:p-2">
      <section className="relative isolate hidden w-2/3 items-center overflow-hidden rounded-l-3xl bg-neutral-950 lg:flex" aria-label="Pusat Pengembangan Kompetensi Aparatur Sipil Negara">
        <Image
          src="/bg-cover.webp"
          alt="Gedung Pusat Pengembangan Kompetensi Aparatur Sipil Negara"
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-neutral-950/70" />
        <Link href="/" aria-label="Kembali ke beranda" className="absolute left-12 top-10 z-10 flex items-center gap-3 rounded-2xl text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <Image src="/logo-badan.png" alt="Badan Teknologi, Data & Informasi Kementerian Sekretariat Negara" width={1726} height={295} className="h-10 w-auto" />
        </Link>
        <div className="relative z-10 w-full px-12 py-36 xl:px-24">
          <FadeIn>
            <h2 className="max-w-2xl text-5xl font-black leading-tight tracking-tighter text-white [text-wrap:balance] xl:text-6xl">Sarana Prasarana</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">Pusat Pengembangan Kompetensi Aparatur Sipil Negara</p>
          </FadeIn>
        </div>
      </section>

      <section className="relative flex min-h-dvh w-full items-center justify-center bg-white text-neutral-900 dark:bg-card dark:text-card-foreground lg:min-h-[calc(100dvh-1rem)] lg:w-1/3 lg:rounded-r-3xl">
        <div className="w-full max-w-md px-6 py-10 sm:px-12">
          <FadeIn>
            <div className="mb-10">
              <h1 className="text-4xl font-black tracking-tighter">Login</h1>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">Masukkan email dan kata sandi Anda untuk melanjutkan.</p>
            </div>
            <LoginForm />
            <Link href="/" className="mt-8 inline-flex rounded-2xl text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Kembali ke beranda</Link>
            <div className="mt-10 flex items-center justify-center gap-3 lg:hidden">
              <Image src="/logo-badan.png" alt="Badan Teknologi, Data & Informasi Kementerian Sekretariat Negara" width={1726} height={295} className="h-auto w-60 max-w-full brightness-0 dark:brightness-100" />
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
