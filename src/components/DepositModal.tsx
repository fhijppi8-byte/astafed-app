import React, { useState } from 'react';
import {
  ArrowDownToLine,
  Upload,
  Copy,
  Check,
  Send,
  AlertCircle,
  FileCheck,
  Sparkles,
  QrCode,
  CreditCard,
  Building2,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { PACKAGE_TIERS, COMPANY_TRC20_WALLET } from '../data/mockData';

export const DepositModal: React.FC = () => {
  const { currentUser, companyWallet, createDepositRequest, setActiveTab } = useApp();

  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [telegramUsername, setTelegramUsername] = useState<string>(currentUser?.telegramUsername || '');
  const [paymentMethod, setPaymentMethod] = useState<'USDT_TRC20' | 'ZAIN_CASH' | 'JUST_MARKETS'>('USDT_TRC20');
  const [proofImage, setProofImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار ملف أصغر من 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProofImage(result);
        setImagePreview(result);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset demo image for testing if user has no file handy
  const handleUseSampleReceipt = () => {
    const sample = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80';
    setProofImage(sample);
    setImagePreview(sample);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!depositAmount || depositAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ إيداع صحيح (10$ كحد أدنى)');
      return;
    }

    if (!telegramUsername.trim()) {
      setErrorMsg('يرجى إدخال يوزر التليجرام للتواصل ومطابقة الحوالة');
      return;
    }

    if (!proofImage) {
      setErrorMsg('يرجى تحميل صورة وصل الدفع لتأكيد العملية');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = createDepositRequest(
        Number(depositAmount),
        proofImage,
        telegramUsername,
        paymentMethod
      );
      setCompletedOrderId(orderId);
      setIsSubmitting(false);
    }, 1000);
  };

  if (completedOrderId) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 animate-in fade-in duration-200">
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <FileCheck className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            رقم الطلب: {completedOrderId}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
            تم استلام طلب الإيداع بنجاح!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            تم إرسال إشعار فوري إلى إدارة منصة استفيد لمراجعة وصل التحويل على شبكة TRC-20 بمبلغ <strong className="text-white">${depositAmount}</strong> وتفعيل الرصيد في حسابك فوراً.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-right text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">حساب المستثمر:</span>
              <span className="font-semibold text-white">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">يوزر التليجرام:</span>
              <span className="font-mono text-emerald-400">{telegramUsername}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">طريقة الدفع:</span>
              <span className="text-slate-200 font-medium">USDT (TRC-20)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-400">الحالة الحالية:</span>
              <span className="text-amber-400 font-bold">قيد تدقيق الأدمن</span>
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
              onClick={() => {
                setCompletedOrderId(null);
                setProofImage('');
                setImagePreview('');
              }}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm"
            >
              تقديم إيداع آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4">
      {/* Title */}
      <div className="text-right mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <ArrowDownToLine className="w-3.5 h-3.5" />
          شحن الرصيد والاشتراك بالباقات
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          خانة الإيداع - الحساب التجميعي الموحد
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          قم بتحويل المبلغ إلى عنوان محفظة USDT (TRC-20) الرسمي الموضح أدناه ثم ارفع صورة الوصل ويوزر التليجرام.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code & Wallet Address Display */}
        <div className="lg:col-span-5 space-y-4">
          <QRCodeDisplay
            address={COMPANY_TRC20_WALLET}
            label="امسح الباركود للتحويل عبر محفظتك (TRC-20)"
          />

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              تعليمات التحويل الهامة:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>الشبكة المعتمدة فقط: <strong>USDT TRC-20</strong></li>
              <li>الحد الأدنى لتفعيل المستوى الأول: <strong>100$</strong></li>
              <li>يتم التحقق من الحوالة وتأكيدها خلال دقائق من قبل الأدمن</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 text-right"
          >
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                اختر طريقة الدفع:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('USDT_TRC20')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'USDT_TRC20'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-[11px] block">USDT (TRC20)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ZAIN_CASH')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'ZAIN_CASH'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="text-[11px] block">زين كاش</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('JUST_MARKETS')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'JUST_MARKETS'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-[11px] block">JustMarkets</span>
                </button>
              </div>
            </div>

            {/* Deposit Amount Field (مستطيل كم يريد الإيداع) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                كم تريد الإيداع؟ (المبلغ بالدولار $):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={depositAmount || ''}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  placeholder="أدخل مبلغ الإيداع مثلاً: 500"
                  className="w-full py-3.5 px-4 pr-12 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold focus:border-emerald-500 focus:outline-none transition-colors text-right"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">
                  $
                </span>
              </div>

              {/* Quick amount buttons matching tiers */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[11px] text-slate-400">باقات سريعة:</span>
                {PACKAGE_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setDepositAmount(tier.minAmount)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                      depositAmount === tier.minAmount
                        ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-emerald-500/40'
                    }`}
                  >
                    ${tier.minAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Telegram Username field (يوزر التليجرام) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                يوزر التليجرام (Telegram Username):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="@your_username"
                  className="w-full py-3 px-4 pr-10 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors text-right dir-ltr"
                  required
                />
                <Send className="w-4 h-4 text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                سنقوم بالتواصل معك عبر التليجرام وإرسال إشعار فوري عند اعتماد الإيداع
              </p>
            </div>

            {/* Receipt Upload field (خانة تحميل الصور لوصل الدفع) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  تحميل صورة وصل الدفع (Screenshot / Receipt):
                </label>
                <button
                  type="button"
                  onClick={handleUseSampleReceipt}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  استخدام وصل تجريبي للاختبار
                </button>
              </div>

              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-4 text-center transition-colors bg-slate-950/40">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="وصل التحويل"
                      className="max-h-36 mx-auto rounded-xl object-contain border border-slate-700 shadow-md"
                    />
                    <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      تم اختيار صورة الوصل بنجاح (انقر لتغييرها)
                    </p>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-300">
                      اسحب وأفلت صورة الوصل هنا، أو انقر للاختيار من جهازك
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG أو JPEG (الحد الأقصى 8MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري إرسال طلب الإيداع للأدمن...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>تأكيد وإرسال طلب الإيداع (${depositAmount})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
