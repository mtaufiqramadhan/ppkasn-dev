"use client";

import React, { useState, useEffect } from "react";
import { ComplaintHero } from "./complaint-hero";
import { ComplaintChannels } from "./complaint-channels";
import { ComplaintService, type CmsComplaintsData } from "../services/complaint-service";

export function ComplaintView() {
  const [data, setData] = useState<CmsComplaintsData | null>(null);

  useEffect(() => {
    ComplaintService.getComplaintsData().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16 leading-loose">
      <ComplaintHero
        title={data?.hero?.title}
        description={data?.hero?.description}
      />

      {/* Official Banner Image */}
      <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] overflow-hidden shadow-none mb-8 sm:mb-12">
        <img
          src={data?.bannerUrl || "/images/pengaduan-banner.webp"}
          alt={data?.hero?.title || "Banner Layanan Pengaduan PPKASN Kemensetneg"}
          className="w-full h-auto block"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/pengaduan-banner.jpeg";
          }}
        />
      </div>

      {/* Official Channels & Infographic */}
      <ComplaintChannels
        channelsTitle={data?.channelsTitle}
        channelsDescription={data?.channelsDescription}
        channels={data?.channels}
        commitment1={data?.commitment1}
        commitment2={data?.commitment2}
      />
    </div>
  );
}
