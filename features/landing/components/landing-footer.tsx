"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
} from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0b0b] text-neutral-300 border-t border-neutral-800/90 selection:bg-white/20 selection:text-white flex flex-col justify-between">
      {/* Main Container with balanced spacing and layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col pt-10 sm:pt-12 lg:pt-14 pb-6 sm:pb-8 gap-8 sm:gap-10">

        {/* Main Footer Content: Brand on Left, Simplified Navigation on Right */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16">
          {/* Brand Identity & Location */}
          <div className="max-w-md space-y-5">
            <Link href="/" className="flex items-center gap-3.5 group focus:outline-none" aria-label="Beranda PPKASN Kemensetneg">
              <div className="size-11 sm:size-12 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-none border border-neutral-200/50 transition-transform duration-200 group-hover:scale-105">
                <img
                  src="/setneg-emblem.webp"
                  alt="Logo Kemensetneg RI"
                  className="size-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base text-white tracking-tight leading-loose group-hover:text-neutral-100 transition-colors">
                  Pusat Pengembangan Kompetensi ASN
                </h4>
                <p className="text-xs text-neutral-400 font-medium leading-loose">
                  Kementerian Sekretariat Negara Republik Indonesia
                </p>
              </div>
            </Link>

            <div className="space-y-3 pt-1 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5 max-w-sm">
                <MapPin className="size-4 text-neutral-400 shrink-0 mt-1" />
                <span className="leading-loose text-xs text-neutral-300">
                  Jl. Gaharu I No.1, RT.10/RW.11, Cipete Sel., Kec. Cilandak, DKI Jakarta, Daerah Khusus Ibukota Jakarta 12430
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-neutral-400 shrink-0" />
                <a
                  href="mailto:ppkasn@setneg.go.id"
                  className="text-xs text-neutral-200 hover:text-white transition-colors font-medium underline-offset-4 hover:underline leading-loose"
                >
                  ppkasn@setneg.go.id
                </a>
              </div>
            </div>
          </div>

          {/* Simplified Navigation Menu */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 w-full lg:w-auto">
            {/* Column 1: Layanan */}
            <div className="space-y-3.5">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Layanan
              </h5>
              <ul className="space-y-2.5 text-xs leading-loose">
                <li>
                  <Link
                    href="/booking"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Halaman Booking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/meeting-room"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Jadwal Ruang Rapat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/room"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Jadwal Ruangan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dorm"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Jadwal Asrama
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Informasi */}
            <div className="space-y-3.5">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Informasi
              </h5>
              <ul className="space-y-2.5 text-xs leading-loose">
                <li>
                  <Link
                    href="/program"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Program Pelatihan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/berita"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Berita Terkini
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profil"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Profil Lembaga
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Tautan Terkait */}
            <div className="space-y-3.5 col-span-2 sm:col-span-1">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Tautan Terkait
              </h5>
              <ul className="space-y-2.5 text-xs leading-loose">
                <li>
                  <a
                    href="https://pionir.setneg.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    PIONIR Kemensetneg
                  </a>
                </li>
                <li>
                  <a
                    href="https://setneg.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Portal Kemensetneg
                  </a>
                </li>
                <li>
                  <Link
                    href="/pengaduan"
                    className="text-neutral-400 hover:text-white transition-colors block"
                  >
                    Saluran Pengaduan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar (Mobbin Minimalist Legal & Social Strip) */}
        <div className="pt-5 border-t border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400 leading-loose">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-center md:text-left">
            <span>&copy; {currentYear} Badan Teknologi, Data, dan Informasi Kementerian Sekretariat Negara RI</span>
          </div>

          {/* Social Media Links in Footer */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://www.instagram.com/ppkasn.kemensetneg/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Resmi PPKASN"
              className="size-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@ppkasnkemensetneg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Resmi PPKASN"
              className="size-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://wa.me/6282110002114"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Halo Gaharu"
              className="size-8 rounded-full bg-neutral-800/80 hover:bg-[#25D366] text-neutral-300 hover:text-white border border-neutral-700/80 hover:border-transparent flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}



