import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  UserCheck,
  LogOut,
  Bell,
  Coins,
  ChevronDown,
  Sparkles,
  Lock,
  Radio,
  SlidersHorizontal,
  CircleDot
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    switchUserRole,
    isMarketOpen,
    marketDayText,
    transactions,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingCount = currentUser?.role === 'admin'
    ? transactions.filter((t) => t.status === 'pending').length
    : transactions.filter((t) => t.userId === currentUser?.id && t.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      {/* Top financial ticker */}
      <div className="bg-slate-900/90 text-[11px] text-slate-300 py-1 px-4 border-b border-slate-800/50 flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            بث مباشر للأسواق
          </span>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-slate-400">
              الذهب XAU/USD: <strong className="text-amber-400">$2,738.40</strong> <span className="text-emerald-400 text-[10px]">+0.82%</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              EUR/USD: <strong className="text-sky-400">1.0864</strong> <span className="text-emerald-400 text-[10px]">+0.14%</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              USDT/TRC20: <strong className="text-emerald-400">1.00$</strong>
            </span>
          </div>
        </div>

        {/* Market day indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isMarketOpen
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            <CircleDot className={`w-2.5 h-2.5 ${isMarketOpen ? 'text-emerald-400 fill-emerald-400' : 'text-rose-400 fill-rose-400'}`} />
            {isMarketOpen ? 'السوق مفتوح' : 'عطلة السوق (السبت والأحد)'}
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/40 group-hover:scale-105 transition-transform">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                استفيد
              </span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                ASTAFED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">تداولك الذكي.. واستثمارك الآمن</p>
          </div>
        </div>

        {/* User Actions */}
        {currentUser && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Badge shortcut when logged in as admin */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>لوحة الإدارة</span>
              </button>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all text-right"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.role === 'admin' && (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-1.5 rounded">
                        أدمن
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    ${currentUser.balance.toFixed(2)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute left-0 sm:left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-right backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800/80">
                    <p className="text-xs text-slate-400">مرحباً بك</p>
                    <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] font-mono text-emerald-400">@{currentUser.username}</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full px-4 py-2 text-xs text-slate-200 hover:bg-slate-800/60 flex items-center gap-2 text-right"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    الملف الشخصي والمحفظة
                  </button>

                  <button
                    onClick={() => setActiveTab('referral')}
                    className="w-full px-4 py-2 text-xs text-slate-200 hover:bg-slate-800/60 flex items-center gap-2 text-right"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    نظام الإحالة والأرباح
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="w-full px-4 py-2 text-xs text-amber-300 hover:bg-slate-800/60 flex items-center gap-2 text-right"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      لوحة الإدارة والتحكم
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-800/80"></div>

                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 text-right"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
