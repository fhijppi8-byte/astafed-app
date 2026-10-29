import React from 'react';
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'deposit',
      label: 'إيداع',
      icon: ArrowDownToLine,
      highlight: true,
    },
    {
      id: 'referral',
      label: 'الإحالة',
      icon: Users,
    },
    {
      id: 'withdraw',
      label: 'سحب',
      icon: ArrowUpFromLine,
    },
    {
      id: 'profile',
      label: 'حسابي',
      icon: UserCheck,
    },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'الإدارة',
      icon: ShieldCheck,
      highlight: false,
    });
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 sm:py-3 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center relative py-1 px-2.5 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.highlight && !isActive ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 -mt-3 shadow-lg shadow-emerald-500/20">
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'
                  }`}
                />
              )}
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold text-emerald-400' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
