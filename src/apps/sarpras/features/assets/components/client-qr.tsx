"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ClientQRProps {
  readonly assetId: string;
  readonly assetName: string;
  readonly customId?: string;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const generatePrintHtml = (displayId: string, assetName: string, dataUrl: string): string => {
  const safeDisplayId = escapeHtml(displayId);
  const safeAssetName = escapeHtml(assetName);
  const isSafeDataUrl = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl);

  return `
    <!DOCTYPE html>
    <html lang="id">
        <head>
            <meta charset="utf-8" />
            <title>Print Label - ${safeDisplayId}</title>
            <style>
                body {
                    font-family: sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .label-container {
                    border: 2px solid black;
                    padding-top: 28px;
                    padding-bottom: 28px;
                    border-radius: 10px;
                    text-align: center;
                    width: 300px;
                }
                img {
                    margin-bottom: 10px;
                    width: 240px;
                    height: 240px;
                }
                .asset-id {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .asset-name {
                    font-size: 14px;
                    color: #555;
                    margin-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="label-container">
                ${isSafeDataUrl ? `<img src="${dataUrl}" alt="QR Code" />` : "<div>Error loading QR</div>"}
                <div class="asset-id">${safeDisplayId}</div>
                <div class="asset-name">${safeAssetName}</div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                }
            </script>
        </body>
    </html>
`;
};

const openPrintWindow = (displayId: string, assetName: string): void => {
  if (typeof window === "undefined") return;

  const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const dataUrl = canvas.toDataURL();
  const printWindow = window.open("", "_blank", "width=600,height=600");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(generatePrintHtml(displayId, assetName, dataUrl));
    printWindow.document.close();
  }
};

export function ClientQR({ assetId, assetName, customId }: ClientQRProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const qrValue = origin ? `${origin}/assets/${assetId}` : "";

  const handlePrint = (): void => {
    const displayId = customId || assetId;
    openPrintWindow(displayId, assetName);
  };

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center">
      <p className="font-mono text-lg font-bold text-gray-900 mb-4 select-all">
        {customId || assetId}
      </p>

      <div className="bg-white p-3 rounded-lg border border-dashed mb-4">
        {qrValue && (
          <QRCodeCanvas
            id="qr-canvas"
            value={qrValue}
            size={150}
            level={"H"}
            includeMargin={true}
            className="rounded-lg"
          />
        )}
      </div>

      <Button onClick={handlePrint} className="rounded-xl shadow-none">
        <Printer className="mr-2 h-4 w-4" /> Cetak QR Code
      </Button>
    </div>
  );
}
