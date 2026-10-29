import React, { useState } from 'react';
import {
  UserCheck,
  Lock,
  ShieldCheck,
  LogOut,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Mail,
  Send,
  Sparkles,
  ListTodo,
  ExternalLink,
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    logout,
    transactions,
    packageTiers,
    updateUserWalletAddress,
    setActiveTab,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'daily_profit' | 'tasks'>('all');
  const [walletInput, setWalletInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ error?: string; success?: string } | null>(null);

  if (!currentUser) return null;

  const currentTier = packageTiers.find((p) => p.id === currentUser.packageId) || packageTiers[0];

  // User's transactions
  const userTxList = transactions.filter((t) => t.userId === currentUser.id);
  const filteredList = activeFilter === 'all'
    ? userTxList
    : userTxList.filter((t) => t.type === activeFilter);

  const handleSetWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    const res = updateUserWalletAddress(currentUser.id, walletInput, false);
    if (!res.success) {
      setSaveStatus({ error: res.error });
    } else {
      setSaveStatus({ success: 'تم تثبيت وقفل المحفظة بنجاح!' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 text-right">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          الملف الشخصي وإدارة الأمان
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          معلومات الحساب، المحفظة المقفلة، وسجل العمليات
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          إدارة بياناتك الشخصية، متابعة سجل طلبات الإيداع والسحب، ومراجعة المحفظة المقفلة الخاصة بك.
        </p>
      </div>

      {/* User Information Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  @{currentUser.username}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                تاريخ التسجيل: {currentUser.joinedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={logout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">البريد الإلكتروني:</span>
            <span className="font-mono text-xs text-slate-200 truncate block dir-ltr text-right">
              {currentUser.email}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">يوزر التليجرام:</span>
            <span className="font-mono text-xs text-sky-400 truncate block dir-ltr text-right">
              {currentUser.telegramUsername || 'غير محدد'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">الباقة النشطة:</span>
            <span className="font-bold text-xs text-amber-400">
              {currentTier.name} (${currentTier.minAmount})
            </span>
          </div>
        </div>
      </div>

      {/* LOCKED WITHDRAWAL WALLET (المحفظة الخاصة بالسحب - مقفلة ولا يمكن تغييرها إلا عبر الأدمن) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              المحفظة الخاصة بالسحب (USDT - TRC20)
            </h3>
          </div>

          {currentUser.isAddressLocked ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              مقفلة أمنياً
            </span>
          ) : (
            <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              بانتظار التثبيت
            </span>
          )}
        </div>

        {currentUser.isAddressLocked ? (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-mono text-xs sm:text-sm text-emerald-400 tracking-wider truncate dir-ltr select-all">
                {currentUser.withdrawalAddress}
              </span>
              <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                شبكة TRC-20
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2.5">
              <Lock className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <p className="leading-relaxed">
                <strong>حماية مشددة:</strong> هذه المحفظة مقفلة بأمان ولا يمكن تغييرها مطلقاً من طرفك، لحماية أموالك من أي محاولات اختراق أو تعديل مفاجئ. إذا كنت ترغب بتغيير العنوان، يرجى التواصل مع الإدارة لطلب فك القفل من لوحة التحكم.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSetWallet} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>تنبيه:</strong> يمكنك إدخال وتثبيت عنوان محفظتك الخاصة بالسحب <strong>لمرة واحدة فقط</strong>. بعد الحفظ يتم إقفالها تلقائياً ولا يستطيع تعديلها إلا مدير المنصة.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="أدخل عنوان محفظة TRC-20 الخاصة بك (يبدأ بـ T...)"
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-xs sm:text-sm focus:border-emerald-500 focus:outline-none dir-ltr"
                required
              />
              <button
                type="submit"
                className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                تثبيت وقفل المحفظة
              </button>
            </div>

            {saveStatus?.error && (
              <p className="text-xs text-rose-400">{saveStatus.error}</p>
            )}
            {saveStatus?.success && (
              <p className="text-xs text-emerald-400">{saveStatus.success}</p>
            )}
          </form>
        )}
      </div>

      {/* OPERATIONS LOG & TASKS (السجل للسحب والإيداع والمهام) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              سجل العمليات، السحب، الإيداع، والمهام
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'all'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveFilter('deposit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'deposit'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الإيداعات
            </button>
            <button
              onClick={() => setActiveFilter('withdrawal')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'withdrawal'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              السحوبات
            </button>
            <button
              onClick={() => setActiveFilter('daily_profit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'daily_profit'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الأرباح
            </button>
            <button
              onClick={() => setActiveFilter('tasks')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'tasks'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              المهام
            </button>
          </div>
        </div>

        {/* Content of selected filter */}
        {activeFilter === 'tasks' ? (
          /* Tasks tab */
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    مهمة كشف الأرباح اليومية (الساعة 12 ليلاً)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    متابعة نتائج جلسة التداول واستلام أرباح اليوم
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                مكتملة اليوم
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    مهمة دعوة الأصدقاء عبر كود الإحالة
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    شارك كودك واحصل على عمولات فورية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('referral')}
                className="text-xs font-bold text-amber-300 hover:underline"
              >
                فتح النافذة
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    جلسة تداول الغد (الذهب والفوركس)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    تفتح الصفقات عند الساعة 08:00 صباحاً بتوقيت مكة
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400">مجدول</span>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            لا توجد عمليات مسجلة تحت هذا التصنيف حتى الآن
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredList.map((tx) => (
              <div
                key={tx.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-950/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : tx.type === 'withdrawal'
                        ? 'bg-sky-500/15 text-sky-400'
                        : tx.type === 'daily_profit'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {tx.type === 'deposit' && <ArrowDownToLine className="w-5 h-5" />}
                    {tx.type === 'withdrawal' && <ArrowUpFromLine className="w-5 h-5" />}
                    {tx.type === 'daily_profit' && <TrendingUp className="w-5 h-5" />}
                    {tx.type === 'daily_loss' && <TrendingDown className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {tx.type === 'deposit' && 'طلب إيداع رصيد'}
                        {tx.type === 'withdrawal' && 'طلب سحب أرباح'}
                        {tx.type === 'daily_profit' && 'أرباح تداول يومية'}
                        {tx.type === 'daily_loss' && 'خصم نسبة خسارة'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {tx.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {tx.note || (tx.type === 'deposit' ? 'إيداع عبر USDT TRC20' : 'سحب عبر USDT')}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {tx.date} {tx.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right sm:text-left">
                    <span
                      className={`text-sm sm:text-base font-black font-mono block ${
                        tx.type === 'deposit' || tx.type === 'daily_profit'
                          ? 'text-emerald-400'
                          : tx.type === 'withdrawal'
                          ? 'text-sky-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'withdrawal' || tx.type === 'daily_loss' ? '-' : '+'}${tx.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {tx.status === 'approved' || tx.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        مكتمل / معتمد
                      </span>
                    ) : tx.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3 text-amber-400" />
                        قيد المراجعة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        مرفوض
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
