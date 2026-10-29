import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Check,
  X,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Sparkles,
  Calculator,
  RefreshCw,
  Clock,
  Layers,
  Coins,
  Edit,
  Save,
  Radio,
  Trash2,
  RotateCcw,
  Gift,
  Ban,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Sliders,
  DollarSign,
  AlertTriangle,
  UserX,
  Award,
  ChevronRight,
  Send,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, PackageTier, Transaction } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    users,
    transactions,
    dailyLog,
    packageTiers,
    companyWallet,
    isMarketOpen,
    marketDayText,
    marketScheduleMode,
    manualMarketOpen,
    holidayNotice,
    refreshSecondsLeft,
    lastRefreshedAt,
    isCloudConnected,
    refreshDataNow,
    setMarketSchedule,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    publishDailyPnL,
    adminUpdateUserBalance,
    updateUserWalletAddress,
    banUser,
    unbanUser,
    restrictUser,
    sendBonus,
    moveToTrash,
    restoreFromTrash,
    permanentDeleteUser,
    getGeneralStatistics,
  } = useApp();

  // Active Main Tab in Admin
  const [activeAdminTab, setActiveAdminTab] = useState<
    'stats' | 'users' | 'referrals' | 'deposits' | 'withdrawals' | 'pnl' | 'market_schedule' | 'trash'
  >('stats');

  // Search & Filter state for Users
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDepositFilter, setUserDepositFilter] = useState<'all' | 'depositors' | 'non_depositors' | 'suspended' | 'restricted'>('all');

  // Bonus Modal State
  const [bonusModalUser, setBonusModalUser] = useState<User | null>(null);
  const [bonusAmount, setBonusAmount] = useState<number>(25);
  const [bonusTarget, setBonusTarget] = useState<'profitWallet' | 'balance'>('profitWallet');
  const [bonusReason, setBonusReason] = useState<string>('مكافأة نشاط وإيداع متميز');
  const [bonusSuccessMsg, setBonusSuccessMsg] = useState('');

  // Edit Balance & Tier Modal State
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editProfitWallet, setEditProfitWallet] = useState<number>(0);
  const [editTierId, setEditTierId] = useState<number>(1);
  const [editWalletAddress, setEditWalletAddress] = useState<string>('');

  // Ban/Restrict Modal
  const [actionUser, setActionUser] = useState<{ user: User; type: 'ban' | 'restrict' } | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  // Proof Image Preview Modal
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Daily PnL Distribution Form
  const [netPnLDollar, setNetPnLDollar] = useState<number>(150);
  const [marketNotes, setMarketNotes] = useState<string>('تداولات ممتازة على عقود الذهب XAUUSD وزوج اليورو دولار');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Market Schedule Settings State
  const [schedMode, setSchedMode] = useState<'auto' | 'manual'>(marketScheduleMode);
  const [schedManualOpen, setSchedManualOpen] = useState<boolean>(manualMarketOpen);
  const [schedNotice, setSchedNotice] = useState<string>(holidayNotice);
  const [schedSavedMsg, setSchedSavedMsg] = useState(false);

  // Rejection note prompt
  const [rejectingTx, setRejectingTx] = useState<{ id: string; type: 'deposit' | 'withdrawal' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Withdrawal TXID input
  const [approvingWithdrawalId, setApprovingWithdrawalId] = useState<string | null>(null);
  const [txHashInput, setTxHashInput] = useState('');

  // Statistics
  const stats = getGeneralStatistics();

  // Users Lists
  const nonDeletedUsers = users.filter((u) => u.role === 'user' && !u.isDeleted);
  const trashUsers = users.filter((u) => u.role === 'user' && u.isDeleted);

  // Filtered Users
  const filteredUsers = nonDeletedUsers.filter((u) => {
    // Search query
    const query = userSearchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.telegramUsername && u.telegramUsername.toLowerCase().includes(query)) ||
      u.referralCode.toLowerCase().includes(query);

    // Deposit status filter
    if (userDepositFilter === 'depositors') {
      return matchSearch && u.balance > 0;
    }
    if (userDepositFilter === 'non_depositors') {
      return matchSearch && u.balance === 0;
    }
    if (userDepositFilter === 'suspended') {
      return matchSearch && u.status === 'suspended';
    }
    if (userDepositFilter === 'restricted') {
      return matchSearch && u.status === 'restricted';
    }

    return matchSearch;
  });

  // Pending items
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');

  // Handle Bonus Submission
  const handleSendBonusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusModalUser || bonusAmount <= 0) return;
    sendBonus(bonusModalUser.id, bonusAmount, bonusTarget, bonusReason);
    setBonusSuccessMsg(`تم إرسال مكافأة بقيمة $${bonusAmount} للمستخدم ${bonusModalUser.name} بنجاح!`);
    setTimeout(() => {
      setBonusSuccessMsg('');
      setBonusModalUser(null);
    }, 1500);
  };

  // Handle Edit Balance Submission
  const handleEditBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    adminUpdateUserBalance(editModalUser.id, editBalance, editProfitWallet, editTierId);
    if (editWalletAddress.trim() && editWalletAddress !== editModalUser.withdrawalAddress) {
      updateUserWalletAddress(editModalUser.id, editWalletAddress, true);
    }
    setEditModalUser(null);
  };

  // Handle Ban/Restrict
  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionUser) return;
    if (actionUser.type === 'ban') {
      banUser(actionUser.user.id, actionReason);
    } else {
      restrictUser(actionUser.user.id, actionReason);
    }
    setActionUser(null);
    setActionReason('');
  };

  // Handle PnL Distribution
  const handlePublishPnL = (e: React.FormEvent) => {
    e.preventDefault();
    publishDailyPnL(netPnLDollar, marketNotes, 'تم اعتماد توزيع صفقات اليوم بنجاح لجميع المشتركين');
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  // Handle Market Settings Save
  const handleSaveMarketSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setMarketSchedule(schedMode, schedManualOpen, schedNotice);
    setSchedSavedMsg(true);
    setTimeout(() => setSchedSavedMsg(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 text-right">
      {/* Top Admin Header with Live 20-second indicator */}
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            لوحة الإدارة والتحكم الشاملة - منصة استفيد
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              مركز القيادة والرقابة المالية (Master Admin Portal)
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              قاعدة بيانات سحابية مركزية (Firebase Live)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            إدارة كافة حسابات المودعين وغير المودعين، التحكم بالإيداعات والسحوبات يدوياً، شبكة الإحالات، وضبط نظام العطلة التلقائي أو اليدوي.
          </p>
        </div>

        {/* Live Auto-Refresh every 20 seconds counter & instant trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/90 p-3 px-4 rounded-2xl border border-slate-800 self-stretch md:self-auto">
          <div className="text-right sm:text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>تحديث مباشر كل 20 ثانية</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
              <span>متبقي:</span>
              <strong className="text-emerald-400 font-bold">{refreshSecondsLeft} ثانية</strong>
              <span>| آخر تحديث: {lastRefreshedAt}</span>
            </div>
          </div>

          <button
            onClick={refreshDataNow}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer active:scale-95"
            title="تحديث فوري للبيانات الآن"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>تحديث الآن</span>
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto text-xs sm:text-sm no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('stats')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'stats'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الإحصائيات العامة</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'users'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة المستخدمين ({nonDeletedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('referrals')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'referrals'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>الإحالات والدعوات</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('deposits')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
            activeAdminTab === 'deposits'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>طلبات الإيداع</span>
          {pendingDeposits.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('withdrawals')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
            activeAdminTab === 'withdrawals'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpFromLine className="w-4 h-4" />
          <span>طلبات السحب</span>
          {pendingWithdrawals.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('pnl')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'pnl'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>توزيع أرباح اليوم (12 ليلاً)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('market_schedule')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'market_schedule'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>العطلة وضبط السوق</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('trash')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
            activeAdminTab === 'trash'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>سلة المحذوفات ({trashUsers.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. GENERAL STATISTICS TAB (الإحصائيات العامة الشاملة)                      */}
      {/* ========================================================================= */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              التقرير المالي والإحصائي الشامل لمنصة استفيد
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              نظرة عامة متكاملة على إجمالي السيولة المودعة، المودعين النشطين، غير المودعين، السحوبات، والعمليات المنتظرة.
            </p>

            {/* Grid of Key Financial Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Balances */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي الأرصدة المودعة (السيولة المجمعة)</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  ${stats.totalBalances.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">رأس مال قيد التداول على الذهب والفوركس</span>
              </div>

              {/* Total Profit Wallets */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي صناديق الأرباح للمستخدمين</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  ${stats.totalProfitWallets.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">أرباح جاهزة للسحب في أي وقت</span>
              </div>

              {/* Active Depositors */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20">
                <span className="text-xs text-slate-400 block mb-1">الأشخاص المفعلين المودعين</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white flex items-center gap-2">
                  <span>{stats.activeDepositorsCount}</span>
                  <span className="text-xs font-normal text-emerald-400">مستثمر</span>
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  بإجمالي مبالغ: ${stats.activeDepositorsSum.toFixed(2)}
                </span>
              </div>

              {/* Non-depositors */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">الأشخاص غير المودعين (مسجلين فقط)</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-300 flex items-center gap-2">
                  <span>{stats.nonDepositorsCount}</span>
                  <span className="text-xs font-normal text-slate-500">حساب</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">بانتظار تفعيل وإيداع الباقة</span>
              </div>

              {/* Real Completed Deposits */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">الإيداعات الحقيقية المعتمدة</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-sky-400">
                  ${stats.realDepositsTotal.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">{stats.realDepositsCount} عملية إيداع مؤكدة</span>
              </div>

              {/* Pending Deposits */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                <span className="text-xs text-amber-300 block mb-1">الإيداعات المنتظرة (قيد المراجعة)</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 flex items-center gap-2">
                  <span>{stats.pendingDepositsCount}</span>
                  <span className="text-xs font-normal text-amber-400">طلب</span>
                </div>
                <span className="text-[11px] text-amber-300/80 mt-1 block">
                  بإجمالي: ${stats.pendingDepositsTotal.toFixed(2)}
                </span>
              </div>

              {/* Completed Withdrawals */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">السحوبات المكتملة المنفذة</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-teal-400">
                  ${stats.completedWithdrawalsTotal.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">{stats.completedWithdrawalsCount} تحويل ناجح</span>
              </div>

              {/* Pending Withdrawals */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30">
                <span className="text-xs text-rose-300 block mb-1">السحوبات المنتظرة (قيد التنفيذ)</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 flex items-center gap-2">
                  <span>{stats.pendingWithdrawalsCount}</span>
                  <span className="text-xs font-normal text-rose-400">طلب</span>
                </div>
                <span className="text-[11px] text-rose-300/80 mt-1 block">
                  بإجمالي: ${stats.pendingWithdrawalsTotal.toFixed(2)}
                </span>
              </div>

              {/* Suspended & Restricted Accounts */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">الحسابات الموقوفة والمقيدة</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
                  {stats.suspendedCount + stats.restrictedCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {stats.suspendedCount} محظور | {stats.restrictedCount} مقيد
                </span>
              </div>

              {/* Distributed Profits */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي الأرباح الموزعة</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  ${stats.totalDistributedProfits.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">توزيعات يومية تمت للمستثمرين</span>
              </div>

              {/* Total Registered Users */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي المستخدمين المسجلين</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {stats.totalUsersCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">حسابات محفوظة بأمان تام</span>
              </div>

              {/* Trash Count */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">عناصر سلة المحذوفات</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-400">
                  {stats.trashCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">قابلة للاستعادة أو الحذف النهائي</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USERS MANAGEMENT TAB (إدارة المستخدمين - المودعين وغير المودعين)        */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                قاعدة بيانات وتسجيلات المستخدمين (المودعين وغير المودعين)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                جميع الحسابات محفوظة ومحمية بشكل دائم. تملك كامل الصلاحيات في الحظر، التقييد، إرسال المكافآت، وتعديل المحافظ والأرصدة.
              </p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، اليوزر، الإيميل، التليجرام أو كود الإحالة..."
                className="w-full py-2.5 px-3 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Pills */}
            <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
              <button
                onClick={() => setUserDepositFilter('all')}
                className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userDepositFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                الكل ({nonDeletedUsers.length})
              </button>

              <button
                onClick={() => setUserDepositFilter('depositors')}
                className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userDepositFilter === 'depositors'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                المودعين المفعلين ({stats.activeDepositorsCount})
              </button>

              <button
                onClick={() => setUserDepositFilter('non_depositors')}
                className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userDepositFilter === 'non_depositors'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                غير المودعين ({stats.nonDepositorsCount})
              </button>

              <button
                onClick={() => setUserDepositFilter('suspended')}
                className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userDepositFilter === 'suspended'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                الموقوفين ({stats.suspendedCount})
              </button>

              <button
                onClick={() => setUserDepositFilter('restricted')}
                className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  userDepositFilter === 'restricted'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                المقيدين ({stats.restrictedCount})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/90">
                  <th className="py-3 px-3">المستخدم والبيانات</th>
                  <th className="py-3 px-3">رأس المال الحالي</th>
                  <th className="py-3 px-3">صندوق الأرباح</th>
                  <th className="py-3 px-3">رمز الدعوة</th>
                  <th className="py-3 px-3">الداعي (Sponsor)</th>
                  <th className="py-3 px-3">حالة الحساب</th>
                  <th className="py-3 px-3">محفظة السحب TRC-20</th>
                  <th className="py-3 px-3 text-center">إجراءات الإدارة الكاملة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      لا يوجد مستخدمين يطابقون خيارات البحث أو التصفية الحالية
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const uTier = packageTiers.find((p) => p.id === u.packageId) || packageTiers[0];
                    const isDepositor = u.balance > 0;

                    return (
                      <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                        {/* Name and details */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isDepositor ? (
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                                مودع
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium">
                                غير مودع
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            @{u.username} | {u.email}
                          </div>
                          {u.telegramUsername && (
                            <div className="text-[10px] text-sky-400 font-mono">
                              تليجرام: {u.telegramUsername}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500">انضم: {u.joinedDate}</div>
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          ${u.balance.toFixed(2)}
                          <div className="text-[10px] text-amber-400 font-normal">{uTier.name}</div>
                        </td>

                        {/* Profit Wallet */}
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          ${u.profitWallet.toFixed(2)}
                          {u.totalBonuses && u.totalBonuses > 0 ? (
                            <div className="text-[10px] text-amber-300 font-normal">
                              مكافآت: +${u.totalBonuses}
                            </div>
                          ) : null}
                        </td>

                        {/* Referral Code */}
                        <td className="py-3 px-3 font-mono text-amber-300 font-bold">
                          {u.referralCode}
                        </td>

                        {/* Referred By */}
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                          {u.referredBy || '— (مباشر)'}
                        </td>

                        {/* Account Status */}
                        <td className="py-3 px-3">
                          {u.status === 'suspended' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                              <Ban className="w-3 h-3 text-rose-400" />
                              محظور
                            </span>
                          ) : u.status === 'restricted' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              مقيد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              نشط
                            </span>
                          )}
                        </td>

                        {/* TRC-20 Wallet */}
                        <td className="py-3 px-3">
                          <div className="font-mono text-[11px] text-slate-300 truncate max-w-[150px] dir-ltr select-all">
                            {u.withdrawalAddress || 'لم تُحدد بعد'}
                          </div>
                          {u.isAddressLocked && (
                            <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                              <Lock className="w-2.5 h-2.5" /> مقفلة
                            </span>
                          )}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {/* Send Bonus */}
                            <button
                              onClick={() => {
                                setBonusModalUser(u);
                                setBonusAmount(25);
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                              title="إرسال مكافأة مالية"
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Balance & Wallet */}
                            <button
                              onClick={() => {
                                setEditModalUser(u);
                                setEditBalance(u.balance);
                                setEditProfitWallet(u.profitWallet);
                                setEditTierId(u.packageId);
                                setEditWalletAddress(u.withdrawalAddress || '');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                              title="تعديل الرصيد والباقة والمحفظة"
                            >
                              <Edit className="w-3.5 h-3.5 text-sky-400" />
                            </button>

                            {/* Ban / Unban */}
                            {u.status === 'suspended' ? (
                              <button
                                onClick={() => unbanUser(u.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                                title="فك الحظر"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setActionUser({ user: u, type: 'ban' })}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                                title="حظر الحساب"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Move to Trash */}
                            <button
                              onClick={() => moveToTrash(u.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all cursor-pointer"
                              title="نقل إلى سلة المحذوفات"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REFERRALS & INVITATIONS NETWORK TAB (خانة الإحالات والدعوات)             */}
      {/* ========================================================================= */}
      {activeAdminTab === 'referrals' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              شبكة الإحالات والدعوات لكل مستخدم
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              لكل مستخدم رمز دعوة خاص به، يمكنك تتبع من دعا من، حجم السيولة المجلوبة، والعمولات المستحقة.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/90">
                  <th className="py-3 px-3">العضو الداعي</th>
                  <th className="py-3 px-3">رمز الدعوة الخاص به</th>
                  <th className="py-3 px-3">عدد الأعضاء المحالين</th>
                  <th className="py-3 px-3">إجمالي السيولة المجلوبة</th>
                  <th className="py-3 px-3">عمولات الإحالة المكتسبة</th>
                  <th className="py-3 px-3">تفاصيل المدعوين</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {nonDeletedUsers.map((u) => {
                  const refList = u.referredUsers || [];
                  const totalCap = refList.reduce((s, r) => s + r.capital, 0);
                  const totalComm = refList.reduce((s, r) => s + r.commissionEarned, 0);

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">
                        {u.referralCode}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {refList.length} أعضاء
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        ${totalCap.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        ${totalComm.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        {refList.length === 0 ? (
                          <span className="text-slate-500">لا يوجد مدعوين حتى الآن</span>
                        ) : (
                          <div className="space-y-1">
                            {refList.map((ref) => (
                              <div key={ref.id} className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200">{ref.name}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">(${ref.capital})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEPOSIT REQUESTS TAB (طلبات الإيداع - قبول ورفض يدوي)                    */}
      {/* ========================================================================= */}
      {activeAdminTab === 'deposits' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
                طلبات الإيداع الواردة (مراجعة وقبول/رفض يدوي)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                قارن صورة الوصل مع الحوالة على شبكة TRC-20، واضغط قبول لشحن رصيد العميل فوراً.
              </p>
            </div>
            <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-xl">
              {pendingDeposits.length} طلب معلق
            </span>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              لا توجد طلبات إيداع معلقة حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDeposits.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.userName}</span>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {tx.id}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        +{tx.amount}$ USDT
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>طريقة الدفع: <strong className="text-slate-200">{tx.method}</strong></span>
                      <span>تليجرام: <strong className="text-sky-400 dir-ltr">{tx.telegramUsername}</strong></span>
                      <span>التاريخ: {tx.date} {tx.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {tx.proofImage && (
                      <button
                        onClick={() => setSelectedProof(tx.proofImage || null)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>معاينة الوصل</span>
                      </button>
                    )}

                    <button
                      onClick={() => approveDeposit(tx.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>قبول وشحن الرصيد</span>
                    </button>

                    <button
                      onClick={() => setRejectingTx({ id: tx.id, type: 'deposit' })}
                      className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WITHDRAWAL REQUESTS TAB (طلبات السحب - قبول ورفض يدوي)                   */}
      {/* ========================================================================= */}
      {activeAdminTab === 'withdrawals' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
                طلبات سحب الأرباح المطلوب تنفيذها يدوياً
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                حول المبلغ إلى عنوان محفظة TRC-20 المقفلة للعميل ثم اعتمد العملية مع إضافة كود التحويل (TXID).
              </p>
            </div>
            <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-xl">
              {pendingWithdrawals.length} طلب سحب معلق
            </span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              لا توجد طلبات سحب معلقة حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.userName}</span>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {tx.id}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        -{tx.amount}$ USDT
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      محفظة السحب المقفلة (TRC-20):
                      <span className="font-mono text-emerald-400 mr-2 dir-ltr select-all font-bold">
                        {tx.walletAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setApprovingWithdrawalId(tx.id);
                        setTxHashInput('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>اعتماد التحويل (TXID)</span>
                    </button>

                    <button
                      onClick={() => setRejectingTx({ id: tx.id, type: 'withdrawal' })}
                      className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>رفض وإعادة الرصيد</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DAILY PNL DISTRIBUTION TAB (توزيع أرباح اليوم - 12 ليلاً)               */}
      {/* ========================================================================= */}
      {activeAdminTab === 'pnl' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                أداة حساب وتوزيع أرباح/خسائر اليوم (الساعة 12 ليلاً)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                اكتب صافي ربح أو خسارة اليوم بالإجمالي للحساب التجميعي، وسيقوم النظام آلياً بحساب النسبة المئوية وإظهار جدول معاينة (Preview) يوضح حصة كل عميل حسب رأس ماله وباقته مع تطبيق الحد الأقصى (Cap).
              </p>
            </div>

            <form onSubmit={handlePublishPnL} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    صافي ربح أو خسارة تداول اليوم ($):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="5"
                      value={netPnLDollar}
                      onChange={(e) => setNetPnLDollar(Number(e.target.value))}
                      placeholder="+150 أو -50"
                      className="w-full py-3 px-4 pr-12 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold focus:border-emerald-500 focus:outline-none text-right"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                      $
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                  <span className="text-xs text-slate-400 mb-1">نسبة النمو المئوية المحسوبة:</span>
                  <div
                    className={`text-2xl font-black font-mono ${
                      stats.totalBalances > 0 && netPnLDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stats.totalBalances > 0
                      ? `${Math.round((netPnLDollar / stats.totalBalances) * 1000) / 10}%`
                      : '0%'}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    مبنية على سيولة ${stats.totalBalances.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>اعتماد ونشر الأرباح والخسائر للجميع</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  بيان جلسة التداول (يظهر بكارت الكشف للعملاء):
                </label>
                <input
                  type="text"
                  value={marketNotes}
                  onChange={(e) => setMarketNotes(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {publishSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  تم اعتماد ونشر النتائج بنجاح! سيتمكن العملاء من كشف نتائجهم في موعد الكشف المعتمد.
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MARKET SCHEDULE & HOLIDAY SETTINGS (العطلة وضبط السوق)                  */}
      {/* ========================================================================= */}
      {activeAdminTab === 'market_schedule' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              إعدادات عطلة السوق (تلقائي / ضبط يدوي)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              يمكنك الاختيار بين النظام التلقائي (من الاثنين إلى الجمعة مفتوح، والسبت والأحد عطلة)، أو تحويله إلى الضبط اليدوي لتحديد العطل والمناسبات الخاصة في أي وقت.
            </p>
          </div>

          <form onSubmit={handleSaveMarketSchedule} className="space-y-4 max-w-2xl">
            {/* Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                اختر نمط إدارة العطلة:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSchedMode('auto')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                    schedMode === 'auto'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">تلقائي (Automatic)</span>
                    {schedMode === 'auto' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    مفتوح من الاثنين للجمعة، وعطلة السبت والأحد فقط
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSchedMode('manual')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                    schedMode === 'manual'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">ضبط يدوي (Manual Control)</span>
                    {schedMode === 'manual' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    تحديد حالة السوق يدوياً (مفتوح أو عطلة) في أي وقت
                  </p>
                </button>
              </div>
            </div>

            {/* Manual Controls if selected */}
            {schedMode === 'manual' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    حالة السوق اليدوية الحالية:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSchedManualOpen(true)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                        schedManualOpen
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      السوق مفتوح (جلسة تداول نشطة)
                    </button>

                    <button
                      type="button"
                      onClick={() => setSchedManualOpen(false)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                        !schedManualOpen
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      عطلة سوق (إيقاف الأرباح مؤقتاً)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    سبب العطلة / الإشعار الظاهر للمستخدمين:
                  </label>
                  <input
                    type="text"
                    value={schedNotice}
                    onChange={(e) => setSchedNotice(e.target.value)}
                    placeholder="مثال: عطلة أعياد البنوك أو إغلاق الأسواق العالمية"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Current Result Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">حالة السوق الحالية للمستخدمين:</span>
              <span className={`font-bold ${isMarketOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {marketDayText}
              </span>
            </div>

            {schedSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                تم حفظ وتطبيق إعدادات السوق بنجاح!
              </div>
            )}

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              حفظ وتطبيق إعدادات السوق
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TRASH CAN TAB (سلة المحذوفات)                                            */}
      {/* ========================================================================= */}
      {activeAdminTab === 'trash' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                سلة المحذوفات (الحسابات المؤرشفة)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                الحسابات المنقولة هنا لا تُحذف تلقائياً بل تبقى محفوظة. يمكنك استعادتها بضغطة زر أو حذفها نهائياً.
              </p>
            </div>
            <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl">
              {trashUsers.length} حساب في السلة
            </span>
          </div>

          {trashUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              سلة المحذوفات فارغة حالياً
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950">
                    <th className="py-3 px-3">المستخدم</th>
                    <th className="py-3 px-3">الرصيد عند الحذف</th>
                    <th className="py-3 px-3">صندوق الأرباح</th>
                    <th className="py-3 px-3">تاريخ النقل للسلة</th>
                    <th className="py-3 px-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {trashUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{u.username} | {u.email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">${u.balance.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">${u.profitWallet.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-400">{u.deletedAt || 'مؤخراً'}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => restoreFromTrash(u.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>استعادة</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من الحذف النهائي لحساب ${u.name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                                permanentDeleteUser(u.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف نهائي</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* 1. Send Bonus Modal */}
      {bonusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setBonusModalUser(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                إرسال مكافأة مالية للمستخدم
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              المستفيد: <strong className="text-emerald-400">{bonusModalUser.name}</strong> (@{bonusModalUser.username})
            </p>

            <form onSubmit={handleSendBonusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">قيمة المكافأة بالدولار ($):</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold text-right"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">إيداع المكافأة في:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBonusTarget('profitWallet')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      bonusTarget === 'profitWallet'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    صندوق الأرباح (قابل للسحب)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBonusTarget('balance')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      bonusTarget === 'balance'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    رأس المال (نشط في السوق)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">سبب أو مناسبة المكافأة:</label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              {bonusSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-center">
                  {bonusSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                تأكيد وإرسال المكافأة (${bonusAmount})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Balance & Tier Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setEditModalUser(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Edit className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">
                تعديل رصيد ومحفظة: {editModalUser.name}
              </h3>
            </div>

            <form onSubmit={handleEditBalanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">رأس المال الحالي ($):</label>
                <input
                  type="number"
                  step="1"
                  value={editBalance}
                  onChange={(e) => setEditBalance(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm text-right"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">صندوق الأرباح ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editProfitWallet}
                  onChange={(e) => setEditProfitWallet(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm text-right"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">الباقة الاستثمارية (المستوى):</label>
                <select
                  value={editTierId}
                  onChange={(e) => setEditTierId(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  {packageTiers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.minAmount} - حد ربح ${p.dailyCap}/يوم)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">محفظة السحب المقفلة (TRC-20):</label>
                <input
                  type="text"
                  value={editWalletAddress}
                  onChange={(e) => setEditWalletAddress(e.target.value)}
                  placeholder="T..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs dir-ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Ban / Restrict Reason Modal */}
      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setActionUser(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Ban className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">
                {actionUser.type === 'ban' ? 'حظر حساب المستخدم' : 'تقييد حساب المستخدم'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              المستخدم: <strong>{actionUser.user.name}</strong> (@{actionUser.user.username})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">سبب الإجراء:</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="اكتب سبب الحظر أو التقييد..."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                تأكيد الإجراء
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Approve Withdrawal Modal (TXID Input) */}
      {approvingWithdrawalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setApprovingWithdrawalId(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2">
              تأكيد تحويل السحب وإضافة رمز التحويل (TXID)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              أدخل رقم المعاملة من محفظتك لإشعار العميل باكتمال التحويل.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                approveWithdrawal(approvingWithdrawalId, txHashInput || undefined);
                setApprovingWithdrawalId(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">رمز المعاملة (TXID / Hash):</label>
                <input
                  type="text"
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  placeholder="0x... أو رقم الإشعار"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs dir-ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                تأكيد اكتمال السحب
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Reject Request Modal */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => {
                setRejectingTx(null);
                setRejectionReason('');
              }}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2">
              رفض طلب {rejectingTx.type === 'deposit' ? 'الإيداع' : 'السحب'}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (rejectingTx.type === 'deposit') {
                  rejectDeposit(rejectingTx.id, rejectionReason);
                } else {
                  rejectWithdrawal(rejectingTx.id, rejectionReason);
                }
                setRejectingTx(null);
                setRejectionReason('');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">سبب الرفض (يظهر للعميل):</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="وصل غير مطابق، رقم المعاملة غير صحيح..."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                تأكيد الرفض
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Proof Image Zoom Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-4 border border-slate-800 text-center">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-3 left-3 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-3 text-right">
              معاينة صورة وصل التحويل
            </h3>
            <img
              src={selectedProof}
              alt="وصل التحويل"
              className="max-h-[75vh] mx-auto rounded-xl object-contain border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
