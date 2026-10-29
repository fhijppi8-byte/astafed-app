import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  TrendingUp,
  UserPlus,
  QrCode,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReferralModal: React.FC = () => {
  const { currentUser } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentUser) return null;

  const referralLink = `${window.location.origin}/#register?ref=${currentUser.referralCode}`;
  const referredList = currentUser.referredUsers || [];
  const totalReferredCapital = referredList.reduce((sum, r) => sum + r.capital, 0);
  const totalCommissions = referredList.reduce((sum, r) => sum + r.commissionEarned, 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `انضم معي إلى منصة "استفيد" (ASTAFED) لتداول الذهب والفوركس وأرباح يومية تصل إلى 50$!\nرابط التسجيل المباشر:\n${referralLink}\nكود الإحالة: ${currentUser.referralCode}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 text-right">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          برنامج شركاء النجاح والإحالة
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          نافذة رمز ورابط الإحالة المباشر
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          لكل مستخدم رمز ورابط إحالة خاص به يتضمن أرقام تعريفية. عند تسجيل أي شخص من خلالك يظهر مباشرة في هذه القائمة مع تفاصيل أرباح الإحالة.
        </p>
      </div>

      {/* Main Referral Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 p-6 sm:p-7 shadow-2xl mb-8">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Code Box */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-300">رمز الإحالة الخاص بك (يحتوي أرقامك):</span>
              <div className="mt-2 flex items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-wider dir-ltr select-all">
                  {currentUser.referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Link Box */}
            <div>
              <span className="text-xs font-bold text-slate-300">رابط الدعوة المباشر:</span>
              <div className="mt-2 flex items-center justify-between gap-2 p-2.5 px-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-mono text-emerald-400 truncate dir-ltr select-all max-w-[220px]">
                  {referralLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all active:scale-95 cursor-pointer flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ الرابط</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleShareTelegram}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة عبر تليجرام</span>
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white font-mono">
                {referredList.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">الأعضاء المسجلين عبرك</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-amber-400 font-mono">
                ${totalCommissions}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">أرباح العمولات المكتسبة</p>
            </div>

            <div className="col-span-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xs text-slate-300 flex items-center justify-center gap-2">
                <span>إجمالي إيداعات شبكتك:</span>
                <strong className="font-mono text-emerald-400 font-black text-sm">
                  ${totalReferredCapital}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List of Referred People (وعند إحالة شخص ما يظهر لديه الشخص في هذه النافذة) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              قائمة الأعضاء المحالين عبر كودك:
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
            {referredList.length} عضو
          </span>
        </div>

        {referredList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              لم يقم أي شخص بالتسجيل من خلال كودك حتى الآن
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              شارك رابط الإحالة مع أصدقائك أو مجتمعات التداول لتحصل على عمولات فورية تضاف لأرباحك بمجرد تفعيلهم لأي باقة!
            </p>
            <button
              onClick={handleCopyLink}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              نسخ الرابط والبدء بالمشاركة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">العضو المحال</th>
                  <th className="py-3 px-3">اسم المستخدم</th>
                  <th className="py-3 px-3">تاريخ الانضمام</th>
                  <th className="py-3 px-3">رأس المال النشط</th>
                  <th className="py-3 px-3 text-left">عمولتك المكتسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {referredList.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {ref.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{ref.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">@{ref.username}</td>
                    <td className="py-3.5 px-3 text-slate-400">{ref.joinedAt}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                      ${ref.capital}
                    </td>
                    <td className="py-3.5 px-3 text-left font-mono font-bold text-emerald-400">
                      +${ref.commissionEarned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
