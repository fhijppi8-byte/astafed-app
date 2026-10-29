import React from 'react';
import { TrendingUp, TrendingDown, Radio, Activity, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveTradesWidget: React.FC = () => {
  const { dailyLog, isMarketOpen } = useApp();

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl mb-12 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white">
              سجل صفقات الحساب التجميعي الحي (الذهب XAUUSD والفوركس)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            شفافية كاملة: الصفقات المنفذة فعلياً في السوق المالي بواسطة خبراء المنصة لحساب رأس المال المجمع.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>جلسة: {dailyLog.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dailyLog.trades.map((trade, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-xs">{trade.pair}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  trade.type === 'BUY'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {trade.type}
              </span>
            </div>

            <div className="my-2 space-y-1 text-[11px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>سعر الدخول:</span>
                <span className="text-slate-200">{trade.entryPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>سعر الخروج:</span>
                <span className="text-slate-200">{trade.exitPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>حجم العقد (Lot):</span>
                <span className="text-slate-200">{trade.lotSize}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">صافي عائد الصفقة:</span>
              <span
                className={`font-mono font-bold ${
                  trade.profitDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trade.profitDollar >= 0 ? `+${trade.profitDollar}$` : `${trade.profitDollar}$`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
