import React, { useState } from 'react';
import { Sparkles, Shield, TrendingUp, X, Award, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeBanner: React.FC = () => {
  const [closed, setClosed] = useState(false);
  const { setActiveTab } = useApp();

  if (closed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl shadow-emerald-950/20 mb-6">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>نموذج التداول التجميعي الموحد (الذهب والفوركس)</span>
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug">
            مرحباً بك في منصة استفيد! المنصة الأولى للربط بين التحليل المالي الاحترافي وأسواق المال العالمية.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-3xl">
            نوفر لك بيئة استثمارية شفافة، متابعة دقيقة لصفقات اليوم، وتحديثات مباشرة لأرباحك. تجمع كافة الإيداعات بحساب موحد يديره خبراء التداول على الذهب (XAUUSD) وتوزع الأرباح بنسبة عادلة يومياً.
          </p>

          {/* Core values badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              حساب تجميعي آمن 100%
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              توزيع أرباح يومي من الاثنين للجمعة
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 font-medium">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              سحب فوري يبدأ من 10$ فقط
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <span>اختر باقتك وابدأ الآن</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>

          <button
            onClick={() => setClosed(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="إخفاء الترحيب"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
