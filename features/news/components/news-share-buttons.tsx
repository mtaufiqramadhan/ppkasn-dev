"use client";

import React, { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface NewsShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
  showLabel?: boolean;
}

export function NewsShareButtons({
  title,
  url,
  className = "",
  showLabel = true,
}: NewsShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (typeof window !== "undefined") {
      return url || window.location.href;
    }
    return url || "";
  };

  const handleCopyLink = async () => {
    const shareUrl = getFullUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Tautan artikel berhasil disalin!", {
        description: "Tautan siap dibagikan.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin tautan.");
    }
  };

  const handleShareWhatsApp = () => {
    const shareUrl = getFullUrl();
    const text = encodeURIComponent(`${title}\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const shareUrl = getFullUrl();
    const text = encodeURIComponent(title);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShareLinkedIn = () => {
    const shareUrl = getFullUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {showLabel && (
        <span className="text-[11px] font-medium text-neutral-400 mr-1 hidden sm:inline-flex items-center gap-1">
          <Share2 className="size-3 text-neutral-400" />
          <span>Bagikan:</span>
        </span>
      )}

      {/* Copy link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="rounded-full text-[11px] h-7 px-2.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-500 mr-1" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="size-3 mr-1 text-neutral-400" />
            <span>Salin</span>
          </>
        )}
      </Button>

      {/* WhatsApp */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShareWhatsApp}
        className="rounded-full text-[11px] h-7 px-2.5 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
      >
        WhatsApp
      </Button>

      {/* X / Twitter */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShareTwitter}
        className="rounded-full text-[11px] h-7 px-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 hidden xs:inline-flex"
      >
        X
      </Button>

      {/* LinkedIn */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShareLinkedIn}
        className="rounded-full text-[11px] h-7 px-2 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hidden sm:inline-flex"
      >
        LinkedIn
      </Button>
    </div>
  );
}
