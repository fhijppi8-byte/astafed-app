import React, { useState, useEffect } from 'react';
import {
  Coins,
  Lock,
  Mail,
  User as UserIcon,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelegram, setRegTelegram] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [referralDetected, setReferralDetected] = useState<string | null>(null);
  const [regError, setRegError] = useState('');

  // Auto-detect referral code from URL query or hash if arriving via invite link
  useEffect(() => {
    try {
      let code: string | null = null;

      // 1. Check window.location.search (?ref=CODE or ?invite=CODE)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('ref')) {
        code = urlParams.get('ref');
      } else if (urlParams.get('invite')) {
        code = urlParams.get('invite');
      }

      // 2. Check window.location.hash (#register?ref=CODE or #ref=CODE)
      if (!code && window.location.hash) {
        const hash = window.location.hash;
        const match = hash.match(/[?&#]ref=([^&#]+)/) || hash.match(/#ref=([^&#]+)/) || hash.match(/[?&#]invite=([^&#]+)/);
        if (match && match[1]) {
          code = match[1];
        }
      }

      if (code) {
        const cleanCode = decodeURIComponent(code).trim().toUpperCase();
        setRegReferral(cleanCode);
        setReferralDetected(cleanCode);
        setMode('register'); // Open registration immediately so user can sign up with the code
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const res = login(loginIdentifier, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    const res = register(
      regName,
      regUsername,
      regEmail,
      regPassword,
      regTelegram,
      regReferral
    );

    if (!res.success) {
      setRegError(res.error || 'فشل في إنشاء الحساب');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-['Cairo',sans-serif]">
      {/* Background radial decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/95 border border-slate-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-right">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
            <Coins className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black text-white">استفيد</h1>
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
              ASTAFED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            تداولك الذكي.. واستثمارك الآمن في أسواق الذهب والفوركس
          </p>
        </div>

        {/* Referral Code Detected Banner */}
        {referralDetected && mode === 'register' && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="text-right">
              <span>تم تطبيق كود الدعوة التلقائي: </span>
              <strong className="font-mono text-white bg-amber-500/20 px-1.5 py-0.5 rounded dir-ltr inline-block">
                {referralDetected}
              </strong>
            </div>
          </div>
        )}

        {/* Tab switch: Login vs Register */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <button
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تسجيل مستخدم جديد
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="اسم المستخدم أو البريد الإلكتروني"
                  className="w-full py-3 px-4 pr-10 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors text-right dir-ltr"
                  required
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3 px-4 pr-10 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors text-right dir-ltr"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* RED ERROR ALERT on invalid credentials */}
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              تسجيل الدخول للمنصة
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM (تسجيل مستخدم جديد) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الاسم الكامل:
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none text-right"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم المستخدم (Username):
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="ahmed99"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none text-right dir-ltr"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                البريد الإلكتروني:
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ahmed@example.com"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none text-right dir-ltr"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                كلمة المرور:
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none text-right dir-ltr"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  يوزر التليجرام:
                </label>
                <input
                  type="text"
                  value={regTelegram}
                  onChange={(e) => setRegTelegram(e.target.value)}
                  placeholder="@telegram"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none text-right dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  كود الإحالة (اختياري):
                </label>
                <input
                  type="text"
                  value={regReferral}
                  onChange={(e) => setRegReferral(e.target.value)}
                  placeholder="ASTA...."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs focus:border-emerald-500 focus:outline-none text-right dir-ltr font-bold"
                />
              </div>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              إنشاء حساب والبدء فوراً
            </button>
          </form>
        )}

        <div className="mt-5 text-center text-[11px] text-slate-500">
          تطبيق "استفيد" - الحساب التجميعي الموحد لتداول الذهب والفوركس © 2026
        </div>
      </div>
    </div>
  );
};
