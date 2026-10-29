export type UserRole = 'user' | 'admin';

export interface PackageTier {
  id: number;
  name: string;
  levelText: string;
  minAmount: number;
  dailyCap: number; // Max daily profit in dollars
  description: string;
  recommended?: boolean;
}

export interface ReferredUser {
  id: string;
  name: string;
  username: string;
  joinedAt: string;
  capital: number;
  commissionEarned: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  balance: number; // رأس المال الحالي
  profitWallet: number; // صندوق الأرباح المتاحة للسحب
  packageId: number; // 1 to 6
  referralCode: string;
  referredBy?: string;
  telegramUsername?: string;
  withdrawalAddress: string; // TRC20 USDT
  isAddressLocked: boolean; // Once set by user, locked until admin changes
  joinedDate: string;
  hasRevealedToday?: boolean;
  referredUsers?: ReferredUser[];
  status?: 'active' | 'suspended' | 'restricted';
  isDeleted?: boolean; // For trash bin
  deletedAt?: string;
  notes?: string;
  totalBonuses?: number;
  restrictionReason?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'daily_profit' | 'daily_loss';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Transaction {
  id: string; // e.g. ORD-10293
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
  time: string;
  method: 'USDT_TRC20' | 'ZAIN_CASH' | 'JUST_MARKETS';
  proofImage?: string; // base64 or URL
  telegramUsername?: string;
  walletAddress?: string;
  note?: string;
  txHash?: string;
}

export interface TradeItem {
  pair: string; // e.g. "XAU/USD (ذهب)", "EUR/USD"
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  profitDollar: number;
  status: 'WIN' | 'LOSS';
}

export interface DailyLog {
  id: string;
  date: string;
  marketSummary: string; // "تداولات الذهب XAUUSD والفوركس"
  overallPoolResultDollar: number; // e.g. +$180 or -$50
  growthPercentage: number; // e.g. +3.6% or -1.2%
  status: 'published' | 'draft';
  timestamp: string;
  trades: TradeItem[];
  adminNote?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'profit' | 'deposit' | 'withdrawal' | 'system';
  read: boolean;
}
