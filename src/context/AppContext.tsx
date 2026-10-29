import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, Transaction, DailyLog, PackageTier } from '../types';
import {
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
  INITIAL_DAILY_LOG,
  PACKAGE_TIERS,
  COMPANY_TRC20_WALLET
} from '../data/mockData';
import {
  subscribeToUsers,
  subscribeToTransactions,
  subscribeToDailyLog,
  subscribeToSystemSettings,
  syncUserToFirestore,
  syncTransactionToFirestore,
  syncDailyLogToFirestore,
  syncSystemSettingsToFirestore,
  deleteUserFromFirestore
} from '../firebase/services';

export interface GeneralStatistics {
  totalBalances: number;
  totalProfitWallets: number;
  activeDepositorsCount: number;
  activeDepositorsSum: number;
  nonDepositorsCount: number;
  suspendedCount: number;
  restrictedCount: number;
  trashCount: number;
  realDepositsTotal: number;
  realDepositsCount: number;
  pendingDepositsTotal: number;
  pendingDepositsCount: number;
  completedWithdrawalsTotal: number;
  completedWithdrawalsCount: number;
  pendingWithdrawalsTotal: number;
  pendingWithdrawalsCount: number;
  totalDistributedProfits: number;
  totalUsersCount: number;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  dailyLog: DailyLog;
  packageTiers: PackageTier[];
  activeTab: 'dashboard' | 'deposit' | 'withdraw' | 'referral' | 'profile' | 'admin';
  companyWallet: string;
  isMarketOpen: boolean;
  marketDayText: string;
  marketScheduleMode: 'auto' | 'manual';
  manualMarketOpen: boolean;
  holidayNotice: string;
  refreshSecondsLeft: number;
  lastRefreshedAt: string;
  isCloudConnected: boolean;
  setActiveTab: (tab: 'dashboard' | 'deposit' | 'withdraw' | 'referral' | 'profile' | 'admin') => void;
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  register: (name: string, username: string, email: string, password: string, telegram?: string, referralCode?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUserRole: (role: 'user' | 'admin') => void;
  createDepositRequest: (amount: number, proofImage: string, telegram: string, method?: 'USDT_TRC20' | 'ZAIN_CASH' | 'JUST_MARKETS') => string;
  createWithdrawalRequest: (amount: number, targetAddress?: string) => { success: boolean; error?: string };
  updateUserWalletAddress: (userId: string, address: string, forceAdmin?: boolean) => { success: boolean; error?: string };
  revealDailyResult: () => { success: boolean; profitEarned: number; isProfit: boolean; message: string };
  // Admin actions
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string, note?: string) => void;
  approveWithdrawal: (transactionId: string, txHash?: string) => void;
  rejectWithdrawal: (transactionId: string, note?: string) => void;
  publishDailyPnL: (netDollarAmount: number, marketSummary: string, adminNote?: string) => void;
  adminUpdateUserBalance: (userId: string, newBalance: number, newProfitWallet: number, newPackageId: number) => void;
  banUser: (userId: string, reason?: string) => void;
  unbanUser: (userId: string) => void;
  restrictUser: (userId: string, reason?: string) => void;
  sendBonus: (userId: string, amount: number, target: 'balance' | 'profitWallet', reason: string) => void;
  moveToTrash: (userId: string) => void;
  restoreFromTrash: (userId: string) => void;
  permanentDeleteUser: (userId: string) => void;
  setMarketSchedule: (mode: 'auto' | 'manual', manualOpen: boolean, notice?: string) => void;
  refreshDataNow: () => void;
  getGeneralStatistics: () => GeneralStatistics;
  calculatePoolStats: () => {
    totalCapital: number;
    totalProfitDistributed: number;
    activeInvestorsCount: number;
    pendingDepositsCount: number;
    pendingWithdrawalsCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_USER_SESSION = 'astafed_session_auth_v3';
const STORAGE_KEY_USERS = 'astafed_users_db_v3';
const STORAGE_KEY_TRANSACTIONS = 'astafed_transactions_v2';
const STORAGE_KEY_DAILY_LOG = 'astafed_daily_log_v2';
const STORAGE_KEY_MARKET_MODE = 'astafed_market_mode_v2';
const STORAGE_KEY_MARKET_MANUAL = 'astafed_market_manual_v2';
const STORAGE_KEY_MARKET_NOTICE = 'astafed_market_notice_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Load users (ensures admin vitamin11 is always present)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasAdmin = parsed.some((u: User) => u.role === 'admin');
        if (!hasAdmin) {
          return [...parsed, INITIAL_USERS[0]];
        }
        return parsed.map((u: User) => {
          if (u.role === 'admin') {
            return {
              ...u,
              username: 'vitamin11',
              email: 'vitamin11@astafed.com',
              password: '200336i',
            };
          }
          return u;
        });
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  // Load transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Load daily log
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DAILY_LOG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DAILY_LOG;
      }
    }
    return INITIAL_DAILY_LOG;
  });

  // Market Schedule Settings
  const [marketScheduleMode, setMarketScheduleMode] = useState<'auto' | 'manual'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARKET_MODE);
    return (saved === 'manual' ? 'manual' : 'auto');
  });

  const [manualMarketOpen, setManualMarketOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARKET_MANUAL);
    return saved !== null ? saved === 'true' : true;
  });

  const [holidayNotice, setHolidayNotice] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARKET_NOTICE);
    return saved || 'عطلة رسمية في الأسواق المالية العالمية';
  });

  // 20-Second Live Refresh Timer
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState<number>(20);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  });

  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = localStorage.getItem(STORAGE_KEY_USER_SESSION);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const found = users.find((u) => u.id === parsed.id);
        return found || parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposit' | 'withdraw' | 'referral' | 'profile' | 'admin'>('dashboard');

  // Real-time Firestore Cloud Listeners
  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubTx: (() => void) | undefined;
    let unsubLog: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    try {
      unsubUsers = subscribeToUsers((cloudUsers) => {
        setIsCloudConnected(true);
        if (cloudUsers && cloudUsers.length > 0) {
          // Merge admin vitamin11 if missing
          const hasAdmin = cloudUsers.some((u) => u.role === 'admin');
          let merged = cloudUsers;
          if (!hasAdmin) {
            merged = [INITIAL_USERS[0], ...cloudUsers];
            syncUserToFirestore(INITIAL_USERS[0]);
          }
          setUsers(merged);
        } else {
          // Seed cloud with initial users
          INITIAL_USERS.forEach((u) => syncUserToFirestore(u));
        }
      });

      unsubTx = subscribeToTransactions((cloudTxs) => {
        if (cloudTxs && cloudTxs.length > 0) {
          setTransactions(cloudTxs);
        } else {
          INITIAL_TRANSACTIONS.forEach((tx) => syncTransactionToFirestore(tx));
        }
      });

      unsubLog = subscribeToDailyLog((cloudLog) => {
        if (cloudLog) {
          setDailyLog(cloudLog);
        } else {
          syncDailyLogToFirestore(INITIAL_DAILY_LOG);
        }
      });

      unsubSettings = subscribeToSystemSettings((cloudSettings) => {
        if (cloudSettings) {
          if (cloudSettings.marketScheduleMode) setMarketScheduleMode(cloudSettings.marketScheduleMode);
          if (typeof cloudSettings.manualMarketOpen === 'boolean') setManualMarketOpen(cloudSettings.manualMarketOpen);
          if (cloudSettings.holidayNotice) setHolidayNotice(cloudSettings.holidayNotice);
        }
      });
    } catch (err) {
      console.warn('Firestore subscription initialized with local fallback:', err);
    }

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubTx) unsubTx();
      if (unsubLog) unsubLog();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  // Sync users to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  // Sync transactions to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Sync dailyLog to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DAILY_LOG, JSON.stringify(dailyLog));
  }, [dailyLog]);

  // Sync session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER_SESSION);
    }
  }, [currentUser]);

  // Keep currentUser in sync with users
  useEffect(() => {
    if (currentUser) {
      const refreshed = users.find((u) => u.id === currentUser.id);
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    }
  }, [users]);

  // 20-Second Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshSecondsLeft((prev) => {
        if (prev <= 1) {
          refreshDataNow();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const refreshDataNow = () => {
    const d = new Date();
    setLastRefreshedAt(d.toTimeString().split(' ')[0]);
    setRefreshSecondsLeft(20);
  };

  // Determine market open status
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let isMarketOpen = true;
  let marketDayText = '';

  if (marketScheduleMode === 'manual') {
    isMarketOpen = manualMarketOpen;
    marketDayText = manualMarketOpen
      ? 'السوق مفتوح (جلسة تداول نشطة)'
      : `عطلة سوق: ${holidayNotice}`;
  } else {
    isMarketOpen = !isWeekend;
    marketDayText = isMarketOpen
      ? 'السوق مفتوح (الاثنين - الجمعة) - تداولات جارية'
      : 'عطلة نهاية الأسبوع (السبت والأحد) - السوق مغلق';
  }

  // Market Schedule Setter
  const setMarketSchedule = (mode: 'auto' | 'manual', manualOpen: boolean, notice?: string) => {
    setMarketScheduleMode(mode);
    setManualMarketOpen(manualOpen);
    if (notice) setHolidayNotice(notice);

    localStorage.setItem(STORAGE_KEY_MARKET_MODE, mode);
    localStorage.setItem(STORAGE_KEY_MARKET_MANUAL, String(manualOpen));
    if (notice) localStorage.setItem(STORAGE_KEY_MARKET_NOTICE, notice);

    syncSystemSettingsToFirestore({
      marketScheduleMode: mode,
      manualMarketOpen: manualOpen,
      holidayNotice: notice || holidayNotice,
    });
  };

  // Login handler
  const login = (identifier: string, pass: string): { success: boolean; error?: string } => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // Check for admin account with vitamin11 / 200336i
    if (trimmedId === 'vitamin11' || trimmedId === 'vitamin11@astafed.com' || trimmedId === 'admin') {
      const adminAcc = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      if (trimmedPass === '200336i' || trimmedPass === adminAcc.password) {
        const fullAdmin: User = {
          ...adminAcc,
          username: 'vitamin11',
          email: 'vitamin11@astafed.com',
          password: '200336i',
        };
        setCurrentUser(fullAdmin);
        localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(fullAdmin));
        setActiveTab('admin');
        syncUserToFirestore(fullAdmin);
        return { success: true };
      }
    }

    const foundUser = users.find(
      (u) =>
        !u.isDeleted &&
        (u.username.toLowerCase() === trimmedId || u.email.toLowerCase() === trimmedId) &&
        u.password === trimmedPass
    );

    if (foundUser) {
      if (foundUser.status === 'suspended') {
        return {
          success: false,
          error: `تم إيقاف هذا الحساب من قبل الإدارة: ${foundUser.restrictionReason || 'يرجى مراجعة الدعم الفني'}`,
        };
      }

      setCurrentUser(foundUser);
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(foundUser));
      setActiveTab(foundUser.role === 'admin' ? 'admin' : 'dashboard');
      return { success: true };
    }

    return {
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    };
  };

  // Register handler (Syncs directly to Firestore Cloud)
  const register = (
    name: string,
    username: string,
    email: string,
    pass: string,
    telegram?: string,
    referralCode?: string
  ): { success: boolean; error?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => !u.isDeleted && u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم آخر' };
    }
    if (users.some((u) => !u.isDeleted && u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'البريد الإلكتروني هذا مستخدم مسبقاً' };
    }

    const generatedCode = `ASTA${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      name: name.trim(),
      email: cleanEmail,
      password: pass,
      role: 'user',
      balance: 0,
      profitWallet: 0,
      packageId: 1,
      referralCode: generatedCode,
      referredBy: referralCode ? referralCode.trim().toUpperCase() : undefined,
      telegramUsername: telegram ? (telegram.startsWith('@') ? telegram : `@${telegram}`) : undefined,
      withdrawalAddress: '',
      isAddressLocked: false,
      joinedDate: new Date().toISOString().split('T')[0],
      hasRevealedToday: false,
      status: 'active',
      isDeleted: false,
      totalBonuses: 0,
      referredUsers: [],
    };

    let updatedUsers = [...users, newUser];
    if (referralCode) {
      const refCode = referralCode.trim().toUpperCase();
      updatedUsers = updatedUsers.map((u) => {
        if (u.referralCode === refCode) {
          const newRefList = u.referredUsers ? [...u.referredUsers] : [];
          newRefList.push({
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            joinedAt: newUser.joinedDate,
            capital: 0,
            commissionEarned: 0,
          });
          const updatedSponsor = { ...u, referredUsers: newRefList };
          syncUserToFirestore(updatedSponsor);
          return updatedSponsor;
        }
        return u;
      });
    }

    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(newUser));
    setActiveTab('dashboard');

    // Sync to Cloud
    syncUserToFirestore(newUser);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER_SESSION);
    setActiveTab('dashboard');
  };

  const switchUserRole = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      const adminAcc = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminAcc);
      setActiveTab('admin');
    } else {
      const normalUser = users.find((u) => u.role === 'user' && !u.isDeleted) || INITIAL_USERS[1];
      setCurrentUser(normalUser);
      setActiveTab('dashboard');
    }
  };

  const updateUserWalletAddress = (userId: string, address: string, forceAdmin = false): { success: boolean; error?: string } => {
    const cleanAddress = address.trim();
    if (!cleanAddress.startsWith('T') || cleanAddress.length < 26) {
      return { success: false, error: 'يرجى إدخال عنوان محفظة TRC-20 صحيح يبدأ بحرف T' };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'المستخدم غير موجود' };

    if (target.isAddressLocked && !forceAdmin) {
      return {
        success: false,
        error: 'المحفظة مقفلة مسبقاً لحمايتك، ولا يمكن تغييرها إلا عبر طلب من إدارة المنصة',
      };
    }

    const updatedUser: User = {
      ...target,
      withdrawalAddress: cleanAddress,
      isAddressLocked: true,
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    syncUserToFirestore(updatedUser);

    return { success: true };
  };

  const createDepositRequest = (
    amount: number,
    proofImage: string,
    telegram: string,
    method: 'USDT_TRC20' | 'ZAIN_CASH' | 'JUST_MARKETS' = 'USDT_TRC20'
  ): string => {
    if (!currentUser) return '';
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date();

    const newTx: Transaction = {
      id: orderId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'deposit',
      amount,
      status: 'pending',
      date: nowTime.toISOString().split('T')[0],
      time: nowTime.toTimeString().split(' ')[0].substring(0, 5),
      method,
      proofImage,
      telegramUsername: telegram.startsWith('@') ? telegram : `@${telegram}`,
      walletAddress: COMPANY_TRC20_WALLET,
      note: `طلب إيداع باقة بقيمة ${amount}$ قيد المراجعة`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    syncTransactionToFirestore(newTx);

    return orderId;
  };

  const createWithdrawalRequest = (amount: number, targetAddress?: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'يرجى تسجيل الدخول' };

    if (currentUser.status === 'restricted') {
      return {
        success: false,
        error: `تم تقييد عمليات السحب لهذا الحساب مؤقتاً: ${currentUser.restrictionReason || 'يرجى مراجعة الإدارة'}`,
      };
    }

    if (amount < 10) {
      return { success: false, error: 'الحد الأدنى لعملية السحب هو 10 دولارات' };
    }

    if (amount > currentUser.profitWallet) {
      return {
        success: false,
        error: `رصيد صندوق الأرباح المتاح للسحب هو $${currentUser.profitWallet.toFixed(2)} فقط`,
      };
    }

    const wallet = targetAddress || currentUser.withdrawalAddress;
    if (!wallet || !wallet.startsWith('T')) {
      return {
        success: false,
        error: 'يرجى تثبيت رابط محفظة TRC-20 الخاصة بك في ملفك أولاً لتنفيذ السحب',
      };
    }

    const orderId = `WTH-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date();

    const newTx: Transaction = {
      id: orderId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdrawal',
      amount,
      status: 'pending',
      date: nowTime.toISOString().split('T')[0],
      time: nowTime.toTimeString().split(' ')[0].substring(0, 5),
      method: 'USDT_TRC20',
      walletAddress: wallet,
      telegramUsername: currentUser.telegramUsername,
      note: `طلب سحب أرباح بقيمة ${amount}$ قيد تدقيق الإدارة`,
    };

    const updatedUser: User = {
      ...currentUser,
      profitWallet: Math.max(0, currentUser.profitWallet - amount),
    };

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setTransactions((prev) => [newTx, ...prev]);

    syncUserToFirestore(updatedUser);
    syncTransactionToFirestore(newTx);

    return { success: true };
  };

  const revealDailyResult = (): { success: boolean; profitEarned: number; isProfit: boolean; message: string } => {
    if (!currentUser) return { success: false, profitEarned: 0, isProfit: true, message: 'غير مسجل' };

    if (!isMarketOpen) {
      return {
        success: false,
        profitEarned: 0,
        isProfit: true,
        message: `السوق في حالة عطلة حالياً (${marketDayText}).`,
      };
    }

    if (currentUser.balance <= 0) {
      return {
        success: false,
        profitEarned: 0,
        isProfit: true,
        message: 'رأس مالك الحالي 0$. يرجى إيداع مبلغ وتفعيل باقة للبدء في جني أرباح التداول اليومية',
      };
    }

    if (currentUser.hasRevealedToday) {
      return {
        success: false,
        profitEarned: 0,
        isProfit: true,
        message: 'لقد قمت بكشف أرباح اليوم مسبقاً! انتظر اعتماد صفقات الغد عند الساعة 12:00 ليلاً',
      };
    }

    const userTier = PACKAGE_TIERS.find((p) => p.id === currentUser.packageId) || PACKAGE_TIERS[0];
    const growthPercent = dailyLog.growthPercentage;
    const isProfit = growthPercent >= 0;

    let finalAmount = 0;

    if (isProfit) {
      const rawProfit = currentUser.balance * (growthPercent / 100);
      finalAmount = Math.min(rawProfit, userTier.dailyCap);
      finalAmount = Math.round(finalAmount * 100) / 100;

      const updatedUser: User = {
        ...currentUser,
        profitWallet: Math.round((currentUser.profitWallet + finalAmount) * 100) / 100,
        hasRevealedToday: true,
      };

      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      syncUserToFirestore(updatedUser);

      const tx: Transaction = {
        id: `PRF-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'daily_profit',
        amount: finalAmount,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        time: '00:00',
        method: 'USDT_TRC20',
        note: `أرباح تداول اليوم بنسبة +${growthPercent}% (ضمن سقف باقتك $${userTier.dailyCap})`,
      };

      setTransactions((prev) => [tx, ...prev]);
      syncTransactionToFirestore(tx);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b'],
        });
      } catch {
        // ignore
      }

      return {
        success: true,
        profitEarned: finalAmount,
        isProfit: true,
        message: `مبارك! حققت صفقات اليوم نمواً بنسبة +${growthPercent}%، وتم إيداع $${finalAmount.toFixed(2)} في صندوق أرباحك المتاحة للسحب`,
      };
    } else {
      const lossAmount = Math.abs(currentUser.balance * (growthPercent / 100));
      finalAmount = Math.round(lossAmount * 100) / 100;

      const updatedUser: User = {
        ...currentUser,
        balance: Math.max(0, Math.round((currentUser.balance - finalAmount) * 100) / 100),
        hasRevealedToday: true,
      };

      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      syncUserToFirestore(updatedUser);

      const tx: Transaction = {
        id: `LOS-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'daily_loss',
        amount: finalAmount,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        time: '00:00',
        method: 'USDT_TRC20',
        note: `خصم خسارة تداول اليوم بنسبة ${growthPercent}% من رأس المال بشفافية كاملة`,
      };

      setTransactions((prev) => [tx, ...prev]);
      syncTransactionToFirestore(tx);

      return {
        success: true,
        profitEarned: finalAmount,
        isProfit: false,
        message: `تم تسجيل تراجع في السوق بنسبة ${growthPercent}%. تم خصم $${finalAmount.toFixed(2)} من رأس المال وفق مبدأ الشفافية التامة`,
      };
    }
  };

  // ADMIN OPERATIONS
  const approveDeposit = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.type !== 'deposit') return;

    let targetUpdatedUser: User | null = null;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === tx.userId) {
          const newBal = u.balance + tx.amount;
          let matchedTierId = 1;
          for (let i = PACKAGE_TIERS.length - 1; i >= 0; i--) {
            if (newBal >= PACKAGE_TIERS[i].minAmount) {
              matchedTierId = PACKAGE_TIERS[i].id;
              break;
            }
          }
          targetUpdatedUser = {
            ...u,
            balance: newBal,
            packageId: matchedTierId,
          };
          return targetUpdatedUser;
        }
        return u;
      })
    );

    const updatedTx: Transaction = { ...tx, status: 'approved' };
    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? updatedTx : t)));

    if (targetUpdatedUser) syncUserToFirestore(targetUpdatedUser);
    syncTransactionToFirestore(updatedTx);
  };

  const rejectDeposit = (transactionId: string, note?: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const updatedTx: Transaction = {
      ...tx,
      status: 'rejected',
      note: note || 'تم رفض الإيداع لعدم مطابقة الإشعار',
    };

    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? updatedTx : t)));
    syncTransactionToFirestore(updatedTx);
  };

  const approveWithdrawal = (transactionId: string, txHash?: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const updatedTx: Transaction = {
      ...tx,
      status: 'completed',
      txHash: txHash || `0x${Math.random().toString(16).substring(2, 34)}`,
    };

    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? updatedTx : t)));
    syncTransactionToFirestore(updatedTx);
  };

  const rejectWithdrawal = (transactionId: string, note?: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.type !== 'withdrawal') return;

    let targetUpdatedUser: User | null = null;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === tx.userId) {
          targetUpdatedUser = { ...u, profitWallet: u.profitWallet + tx.amount };
          return targetUpdatedUser;
        }
        return u;
      })
    );

    const updatedTx: Transaction = {
      ...tx,
      status: 'rejected',
      note: note || 'تم رفض السحب وإعادة الرصيد لصندوق أرباحك',
    };

    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? updatedTx : t)));

    if (targetUpdatedUser) syncUserToFirestore(targetUpdatedUser);
    syncTransactionToFirestore(updatedTx);
  };

  const publishDailyPnL = (netDollarAmount: number, marketSummary: string, adminNote?: string) => {
    const totalPooledCapital = users.reduce(
      (sum, u) => (u.role === 'user' && !u.isDeleted ? sum + u.balance : sum),
      0
    );
    const growthPercent = totalPooledCapital > 0
      ? Math.round((netDollarAmount / totalPooledCapital) * 1000) / 10
      : (netDollarAmount > 0 ? 3.5 : -1.5);

    const newLog: DailyLog = {
      id: `LOG-${new Date().toISOString().split('T')[0]}`,
      date: new Date().toISOString().split('T')[0],
      marketSummary,
      overallPoolResultDollar: netDollarAmount,
      growthPercentage: growthPercent,
      status: 'published',
      timestamp: `${new Date().toISOString().split('T')[0]} 00:00`,
      adminNote: adminNote || 'تم اعتماد وتوزيع نتائج جلسة التداول لجميع المشتركين',
      trades: [
        {
          pair: 'XAU/USD (عقود الذهب)',
          type: netDollarAmount >= 0 ? 'BUY' : 'SELL',
          entryPrice: 2728.00,
          exitPrice: 2742.50,
          lotSize: 0.6,
          profitDollar: Math.round(netDollarAmount * 0.7),
          status: netDollarAmount >= 0 ? 'WIN' : 'LOSS',
        },
        {
          pair: 'EUR/USD (فوركس)',
          type: 'BUY',
          entryPrice: 1.0850,
          exitPrice: 1.0880,
          lotSize: 1.0,
          profitDollar: Math.round(netDollarAmount * 0.3),
          status: netDollarAmount >= 0 ? 'WIN' : 'LOSS',
        },
      ],
    };

    setDailyLog(newLog);
    syncDailyLogToFirestore(newLog);

    // Reset reveal flag for users
    setUsers((prev) =>
      prev.map((u) => {
        const resetUser = { ...u, hasRevealedToday: false };
        syncUserToFirestore(resetUser);
        return resetUser;
      })
    );
  };

  const adminUpdateUserBalance = (
    userId: string,
    newBalance: number,
    newProfitWallet: number,
    newPackageId: number
  ) => {
    let targetUpdated: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUpdated = {
            ...u,
            balance: newBalance,
            profitWallet: newProfitWallet,
            packageId: newPackageId,
          };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) syncUserToFirestore(targetUpdated);
  };

  const banUser = (userId: string, reason?: string) => {
    let targetUpdated: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUpdated = {
            ...u,
            status: 'suspended',
            restrictionReason: reason || 'تم حظر الحساب لمخالفة شروط التداول',
          };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) syncUserToFirestore(targetUpdated);
  };

  const unbanUser = (userId: string) => {
    let targetUpdated: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUpdated = {
            ...u,
            status: 'active',
            restrictionReason: undefined,
          };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) syncUserToFirestore(targetUpdated);
  };

  const restrictUser = (userId: string, reason?: string) => {
    let targetUpdated: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUpdated = {
            ...u,
            status: 'restricted',
            restrictionReason: reason || 'تقييد مؤقت لعمليات السحب والمكافآت',
          };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) syncUserToFirestore(targetUpdated);
  };

  const sendBonus = (userId: string, amount: number, target: 'balance' | 'profitWallet', reason: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    let targetUpdated: User | null = null;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newBal = target === 'balance' ? u.balance + amount : u.balance;
          const newProf = target === 'profitWallet' ? u.profitWallet + amount : u.profitWallet;
          targetUpdated = {
            ...u,
            balance: newBal,
            profitWallet: newProf,
            totalBonuses: (u.totalBonuses || 0) + amount,
          };
          return targetUpdated;
        }
        return u;
      })
    );

    const bonusTx: Transaction = {
      id: `BON-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: targetUser.id,
      userName: targetUser.name,
      type: 'daily_profit',
      amount,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      method: 'USDT_TRC20',
      note: `مكافأة إدارية خاصة: ${reason}`,
    };

    setTransactions((prev) => [bonusTx, ...prev]);

    if (targetUpdated) syncUserToFirestore(targetUpdated);
    syncTransactionToFirestore(bonusTx);
  };

  const moveToTrash = (userId: string) => {
    let targetUpdated: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUpdated = {
            ...u,
            isDeleted: true,
            deletedAt: new Date().toISOString().split('T')[0],
          };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) syncUserToFirestore(targetUpdated);
  };

  const restoreFromTrash = (userId: string) => {
    let targetUpdated: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          targetUpdated = {
            ...u,
            isDeleted: false,
            deletedAt: undefined,
          };
          return targetUpdated;
        }
        return u;
      })
    );
    if (targetUpdated) syncUserToFirestore(targetUpdated);
  };

  const permanentDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteUserFromFirestore(userId);
  };

  const getGeneralStatistics = (): GeneralStatistics => {
    const nonDeletedUsers = users.filter((u) => u.role === 'user' && !u.isDeleted);
    const activeDepositors = nonDeletedUsers.filter((u) => u.balance > 0);
    const nonDepositors = nonDeletedUsers.filter((u) => u.balance === 0);
    const suspended = nonDeletedUsers.filter((u) => u.status === 'suspended');
    const restricted = nonDeletedUsers.filter((u) => u.status === 'restricted');
    const trash = users.filter((u) => u.role === 'user' && u.isDeleted);

    const totalBalances = nonDeletedUsers.reduce((sum, u) => sum + u.balance, 0);
    const totalProfitWallets = nonDeletedUsers.reduce((sum, u) => sum + u.profitWallet, 0);
    const activeDepositorsSum = activeDepositors.reduce((sum, u) => sum + u.balance, 0);

    const realDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'approved');
    const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
    const completedWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'completed');
    const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
    const distributedProfits = transactions.filter((t) => t.type === 'daily_profit' && t.status === 'completed');

    return {
      totalBalances,
      totalProfitWallets,
      activeDepositorsCount: activeDepositors.length,
      activeDepositorsSum,
      nonDepositorsCount: nonDepositors.length,
      suspendedCount: suspended.length,
      restrictedCount: restricted.length,
      trashCount: trash.length,
      realDepositsTotal: realDeposits.reduce((sum, t) => sum + t.amount, 0),
      realDepositsCount: realDeposits.length,
      pendingDepositsTotal: pendingDeposits.reduce((sum, t) => sum + t.amount, 0),
      pendingDepositsCount: pendingDeposits.length,
      completedWithdrawalsTotal: completedWithdrawals.reduce((sum, t) => sum + t.amount, 0),
      completedWithdrawalsCount: completedWithdrawals.length,
      pendingWithdrawalsTotal: pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0),
      pendingWithdrawalsCount: pendingWithdrawals.length,
      totalDistributedProfits: distributedProfits.reduce((sum, t) => sum + t.amount, 0),
      totalUsersCount: nonDeletedUsers.length,
    };
  };

  const calculatePoolStats = () => {
    const stats = getGeneralStatistics();
    return {
      totalCapital: stats.totalBalances,
      totalProfitDistributed: stats.totalDistributedProfits,
      activeInvestorsCount: stats.activeDepositorsCount,
      pendingDepositsCount: stats.pendingDepositsCount,
      pendingWithdrawalsCount: stats.pendingWithdrawalsCount,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        transactions,
        dailyLog,
        packageTiers: PACKAGE_TIERS,
        activeTab,
        companyWallet: COMPANY_TRC20_WALLET,
        isMarketOpen,
        marketDayText,
        marketScheduleMode,
        manualMarketOpen,
        holidayNotice,
        refreshSecondsLeft,
        lastRefreshedAt,
        isCloudConnected,
        setActiveTab,
        login,
        register,
        logout,
        switchUserRole,
        createDepositRequest,
        createWithdrawalRequest,
        updateUserWalletAddress,
        revealDailyResult,
        approveDeposit,
        rejectDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        publishDailyPnL,
        adminUpdateUserBalance,
        banUser,
        unbanUser,
        restrictUser,
        sendBonus,
        moveToTrash,
        restoreFromTrash,
        permanentDeleteUser,
        setMarketSchedule,
        refreshDataNow,
        getGeneralStatistics,
        calculatePoolStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
