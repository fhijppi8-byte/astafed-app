import React, { useState } from 'react';
import {
  ArrowUpFromLine,
  Lock,
  ShieldCheck,
  AlertCircle,
  Coins,
  Check,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WithdrawModal: React.FC = () => {
  const {
    currentUser,
    createWithdrawalRequest,
    updateUserWalletAddress,
    setActiveTab,
  } = useApp();

  const [withdrawAmount, setWithdrawAmount] = useState<number>(20);
  const [walletInput, setWalletInput] = useState<string>(currentUser?.withdrawalAddress || '');
  const [isSettingWallet, setIsSettingWallet] = useState<boolean>(!currentUser?.isAddressLocked);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [completedWithdrawal, setCompletedWithdrawal] = useState<boolean>(false);

  if (!currentUser) return null;

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = updateUserWalletAddress(currentUser.id, walletInput, false);
    if (!res.success) {
      setErrorMsg(res.error || 'حدث خطأ في حفظ المحفظة');
    } else {
      setSuccessMsg('تم حفظ وتثبيت محفظتك بنجاح وقفلها لحمايتك!');
      setIsSettingWallet(false);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser.withdrawalAddress) {
      setErrorMsg('يرجى تثبيت رابط محفظة TRC-20 الخاصة بك أولاً قبل طلب السحب');
      return;
    }

    if (withdrawAmount < 10) {
      setErrorMsg('الحد الأدنى لأي عملية سحب هو 10 دولارات (USDT)');
      return;
    }

    if (withdrawAmount > currentUser.profitWallet) {
      setErrorMsg(`رصيدك المتاح في صندوق الأرباح هو $${currentUser.profitWallet.toFixed(2)} فقط`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = createWithdrawalRequest(withdrawAmount);
      setIsSubmitting(false);

      if (res.success) {
        setCompletedWithdrawal(true);
      } else {
        setErrorMsg(res.error || 'حدث خطأ في تنفيذ الطلب');
      }
    }, 800);
  };

  if (completedWithdrawal) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in duration-200">
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            تم تسجيل طلب السحب بنجاح!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            تم خصم مبلغ <strong className="text-emerald-400">${withdrawAmount}</strong> من صندوق الأرباح، وهو الآن قيد اعتماد التحويل من قبل الإدارة إلى محفظة TRC-20 الخاصة بك.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-right text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">المبلغ المطلوب:</span>
              <span className="font-mono font-bold text-emerald-400">${withdrawAmount}.00 USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">محفظة الاستلام المقفلة:</span>
              <span className="font-mono text-slate-200 truncate max-w-[200px] dir-ltr select-all">
                {currentUser.withdrawalAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">الرصيد المتبقي في صندوق الأرباح:</span>
              <span className="font-mono text-white">${currentUser.profitWallet.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400">حالة الطلب:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                قيد التنفيذ والمراجعة
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              العودة للواجهة الرئيسية
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm"
            >
              عرض سجل العمليات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-4">
      {/* Title */}
      <div className="text-right mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <ArrowUpFromLine className="w-3.5 h-3.5" />
          سحب الأرباح المباشر
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          خانة السحب من صندوق الأرباح
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          أقل عملية سحب هي 10$ عن طريق رابط محفظتك الخاصة (TRC-20) المقفلة بأمان.
        </p>
      </div>

      {/* Available Profit Box Preview */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 sm:p-6 shadow-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-right">
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            صندوق الأرباح المتاحة للسحب حالياً:
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              ${currentUser.profitWallet.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-400">USDT</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-left bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
          <p className="text-slate-300 font-bold mb-1">شروط السحب المعتمدة:</p>
          <ul className="space-y-0.5 text-[11px] text-slate-400">
            <li>• الحد الأدنى للسحب: <strong className="text-white">10$</strong></li>
            <li>• لا توجد رسوم سحب خفية</li>
            <li>• التحويل عبر شبكة Tron TRC-20 حصراً</li>
          </ul>
        </div>
      </div>

      {/* Locked Wallet Section (المحفظة الخاصة بالسحب - تثبيت مرة واحدة فقط) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl mb-6 text-right">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock className={`w-4 h-4 ${currentUser.isAddressLocked ? 'text-amber-400' : 'text-slate-400'}`} />
            <h3 className="text-sm font-bold text-white">
              محفظة السحب الخاصة بك (USDT TRC-20):
            </h3>
          </div>

          {currentUser.isAddressLocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              مقفلة ومحمية
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
              تثبيت لأول مرة
            </span>
          )}
        </div>

        {currentUser.isAddressLocked ? (
          /* Address is locked: user cannot change it, only admin can */
          <div className="space-y-2">
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs sm:text-sm text-emerald-400 tracking-wider truncate dir-ltr select-all">
                {currentUser.withdrawalAddress}
              </span>
              <span className="text-[11px] text-slate-400 flex-shrink-0 bg-slate-800 px-2 py-1 rounded-lg">
                TRC-20
              </span>
            </div>
            <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
              تم قفل وتثبيت هذه المحفظة لحماية أصولك. لا يمكن تعديلها إلا من قبل مدير المنصة من لوحة الإدارة.
            </p>
          </div>
        ) : (
          /* Address not set or unlocked: allow user to set it ONCE */
          <form onSubmit={handleSaveWallet} className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>تنبيه هام جداً:</strong> يمكنك إدخال وتثبيت عنوان محفظتك الخاصة بالسحب <strong>لمرة واحدة فقط</strong>. بعد الحفظ سيتم قفلها تلقائياً ولن تستطيع تعديلها إلا بمراجعة إدارة المنصة.
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="أدخل عنوان محفظتك الشخصية TRC-20 (مثال: T...)"
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition-colors dir-ltr"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تثبيت وقفل المحفظة الآن</span>
            </button>
          </form>
        )}
      </div>

      {/* Withdrawal Execution Form */}
      <form
        onSubmit={handleWithdrawSubmit}
        className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 text-right"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300">
              مبلغ السحب المطلوب (الحد الأدنى 10$):
            </label>
            <span className="text-xs text-slate-400">
              المتاح: <strong className="text-emerald-400 font-mono">${currentUser.profitWallet.toFixed(2)}</strong>
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min="10"
              max={currentUser.profitWallet}
              step="1"
              value={withdrawAmount || ''}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              placeholder="10"
              className="w-full py-3.5 px-4 pr-12 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold focus:border-emerald-500 focus:outline-none transition-colors text-right"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">
              $
            </span>
          </div>

          {/* Quick Percentage Buttons */}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => setWithdrawAmount(10)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              الحد الأدنى ($10)
            </button>
            <button
              type="button"
              onClick={() => setWithdrawAmount(Math.floor(currentUser.profitWallet * 0.5))}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setWithdrawAmount(Math.floor(currentUser.profitWallet))}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              سحب كامل الأرباح (100%)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || currentUser.profitWallet < 10 || !currentUser.withdrawalAddress}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري إرسال طلب السحب...</span>
            </>
          ) : (
            <>
              <ArrowUpFromLine className="w-4 h-4" />
              <span>تأكيد طلب السحب (${withdrawAmount})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
