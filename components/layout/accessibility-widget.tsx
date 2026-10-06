"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Accessibility, Sun, Moon, Eye, RotateCcw, BookOpen, Volume2, ZoomIn, Target, Palette, Check, type LucideIcon } from "lucide-react";
import { useAccessibility, type TextSize, type ColorFilterType } from "@/providers/accessibility-provider";
import { useAccessibilityTools } from "@/hooks/use-accessibility-tools";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};
const fontSizes: { value: TextSize; label: string; desc: string; font: string }[] = [
  { value: "sm", label: "Kecil", desc: "14px", font: "text-[10px]" },
  { value: "base", label: "Normal", desc: "16px", font: "text-xs" },
  { value: "lg", label: "Besar", desc: "18px", font: "text-sm" },
  { value: "xl", label: "Sangat Besar", desc: "20px", font: "text-base" },
];
const colorOptions: { value: ColorFilterType; label: string; desc: string }[] = [
  { value: "none", label: "Normal", desc: "Tampilan standar" },
  { value: "grayscale", label: "Grayscale", desc: "Skala abu-abu" },
];
const optionStyle = (active: boolean) => cn("rounded-2xl sm:rounded-3xl border p-3 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", active ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted");
function ToolOption({ active, onClick, icon: Icon, title, description, wide }: { active: boolean; onClick: () => void; icon: LucideIcon; title: string; description: string; wide?: boolean }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={cn(optionStyle(active), "flex items-center gap-3", wide && "col-span-2")}>
    <Icon className="size-5 shrink-0" aria-hidden="true" />
    <span className="min-w-0"><span className="block text-xs font-bold">{title}</span><span className="mt-1 block text-[10px] opacity-70">{description}</span></span>
  </button>;
}

export function AccessibilityWidget() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const rulerRef = useRef<HTMLDivElement>(null);
  const a = useAccessibility();
  useAccessibilityTools({ voiceMode: a.voiceMode, magnifierMode: a.magnifierMode, adhdMode: a.adhdMode && !isOpen, rulerRef });
  useEffect(() => {
    const toggle = () => setIsOpen(previous => !previous);
    window.addEventListener("toggle-accessibility", toggle);
    return () => window.removeEventListener("toggle-accessibility", toggle);
  }, []);
  if (!mounted) return null;

  return <>
    {a.adhdMode && !isOpen && <div ref={rulerRef} data-accessibility-ruler aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]" style={{ "--focus-y": "50vh" } as CSSProperties}>
      <div className="absolute inset-x-0 top-0 bg-black/40" style={{ height: "max(0px, calc(var(--focus-y) - 25px))" }} />
      <div className="absolute inset-x-0 h-[50px] border-y-2 border-dashed border-primary bg-primary/10" style={{ top: "calc(var(--focus-y) - 25px)" }} />
      <div className="absolute inset-x-0 bottom-0 bg-black/40" style={{ top: "calc(var(--focus-y) + 25px)" }} />
    </div>}
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label="Menu Aksesibilitas" title="Menu Aksesibilitas" className="accessibility-widget-ignore group fixed right-0 bottom-10 z-[45] flex cursor-pointer items-center gap-2 rounded-l-2xl border-y border-l border-white/20 bg-primary p-3.5 text-white shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Accessibility className="size-6" aria-hidden="true" />
          <span className="hidden text-xs font-black uppercase tracking-wider lg:group-hover:block lg:group-focus-visible:block">Aksesibilitas</span>
        </button>
      </DialogTrigger>
      <DialogContent className="accessibility-widget-ignore flex max-h-[90dvh] w-[92vw] flex-col overflow-y-auto scroll-auto bg-card p-6 text-card-foreground shadow-2xl sm:max-w-[760px] md:p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:animate-none!">
        <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
          <header className="flex items-center gap-3 border-b border-border pb-6 pr-8">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary"><Accessibility className="size-5" aria-hidden="true" /></div>
            <DialogTitle className="text-base font-black">Aksesibilitas</DialogTitle>
            <DialogDescription className="sr-only">Sesuaikan tema, ukuran tulisan, warna, dan alat bantu membaca.</DialogDescription>
          </header>
          <div className="space-y-6 py-6">
            <div className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-6">
                <fieldset className="space-y-3">
                  <legend className="mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground">Tema Aplikasi</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" aria-pressed={a.theme === "light"} onClick={() => a.setTheme("light")} className={cn(optionStyle(a.theme === "light"), "flex flex-col items-center gap-2 text-sm font-bold")}><Sun className="size-5" aria-hidden="true" />Terang</button>
                    <button type="button" aria-pressed={a.theme === "dark"} onClick={() => a.setTheme("dark")} className={cn(optionStyle(a.theme === "dark"), "flex flex-col items-center gap-2 text-sm font-bold")}><Moon className="size-5" aria-hidden="true" />Gelap</button>
                  </div>
                </fieldset>
                <fieldset className="space-y-3">
                  <legend className="mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground">Ukuran Tulisan</legend>
                  <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-border bg-muted/50 p-1">
                    {fontSizes.map(size => <button type="button" key={size.value} aria-label={`${size.label} ${size.desc}`} aria-pressed={a.textSize === size.value} onClick={() => a.setTextSize(size.value)} className={cn("flex cursor-pointer flex-col items-center justify-center rounded-2xl py-2 font-bold focus-visible:outline-2 focus-visible:outline-primary", a.textSize === size.value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}><span className={size.font}>A</span><span className="mt-1 text-[10px] opacity-70">{size.desc}</span></button>)}
                  </div>
                </fieldset>
              </div>
              <fieldset className="space-y-3">
                <legend className="mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground">Alat Bantu Tampilan</legend>
                <div className="grid grid-cols-2 gap-2">
                  <ToolOption active={a.highContrast} onClick={() => a.setHighContrast(!a.highContrast)} icon={Eye} title="Kontras Tinggi" description="Warna kontras" />
                  <ToolOption active={a.dyslexiaMode} onClick={() => a.setDyslexiaMode(!a.dyslexiaMode)} icon={BookOpen} title="Ramah Disleksia" description="Huruf disleksia" />
                  <ToolOption active={a.voiceMode} onClick={() => a.setVoiceMode(!a.voiceMode)} icon={Volume2} title="Pembaca Suara" description="Suara saat hover atau fokus" />
                  <ToolOption active={a.magnifierMode} onClick={() => a.setMagnifierMode(!a.magnifierMode)} icon={ZoomIn} title="Kaca Pembesar" description="Perbesar elemen" />
                  <ToolOption active={a.adhdMode} onClick={() => a.setAdhdMode(!a.adhdMode)} icon={Target} title="Mode Fokus ADHD" description="Penggaris visual yang mengikuti kursor" wide />
                </div>
              </fieldset>
            </div>
            <fieldset className="space-y-3 border-t border-border pt-6">
              <legend className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground"><Palette className="size-4" aria-hidden="true" />Ubah Warna</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {colorOptions.map(option => <button type="button" key={option.value} aria-pressed={a.colorFilter === option.value} onClick={() => a.setColorFilter(option.value)} className={cn(optionStyle(a.colorFilter === option.value), "flex items-center justify-between gap-2")}><span><span className="block text-xs font-bold">{option.label}</span><span className="mt-1 block text-[10px] opacity-70">{option.desc}</span></span>{a.colorFilter === option.value && <Check className="size-4 shrink-0" aria-hidden="true" />}</button>)}
              </div>
            </fieldset>
          </div>
          <footer className="border-t border-border pt-6"><button type="button" onClick={a.resetAll} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl sm:rounded-3xl border border-border py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><RotateCcw className="size-4" aria-hidden="true" />Atur Ulang Pengaturan</button></footer>
        </motion.div>
      </DialogContent>
    </Dialog>
  </>;
}
