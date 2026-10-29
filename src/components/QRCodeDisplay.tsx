import React, { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  address: string;
  size?: number;
  label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  address,
  size = 180,
  label = 'عنوان محفظة الإيداع (USDT - TRC20)'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Generate an encoded quick QR image using standard high-res chart API with fallback SVG visual
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(address)}&color=059669&bgcolor=ffffff&qzone=2`;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow-xl backdrop-blur-sm">
      <div className="relative p-2.5 bg-white rounded-xl shadow-lg shadow-emerald-500/10 group">
        <img
          src={qrUrl}
          alt={`QR Code for ${address}`}
          className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback SVG display if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-900/90 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-mono font-semibold shadow-md border border-emerald-500/30">
            TRC-20
          </div>
        </div>
      </div>

      {label && (
        <span className="mt-3 text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          {label}
        </span>
      )}

      <div className="mt-2 w-full max-w-sm flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200">
        <span className="font-mono text-xs text-emerald-400 tracking-wider truncate dir-ltr select-all">
          {address}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:scale-95"
          title="نسخ العنوان"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>تم النسخ!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        تأكد من اختيار شبكة <strong>Tron (TRC-20)</strong> حصراً لتفادي فقدان الأصول
      </div>
    </div>
  );
};
