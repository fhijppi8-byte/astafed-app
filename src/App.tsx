/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { WelcomeBanner } from './components/WelcomeBanner';
import { BalanceCard } from './components/BalanceCard';
import { PackageTiers } from './components/PackageTiers';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { ReferralModal } from './components/ReferralModal';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { LiveTradesWidget } from './components/LiveTradesWidget';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab } = useApp();

  if (!currentUser) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-150">
            <WelcomeBanner />
            <BalanceCard />
            <PackageTiers />
            <LiveTradesWidget />
          </div>
        )}

        {activeTab === 'deposit' && (
          <div className="animate-in fade-in duration-150">
            <DepositModal />
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="animate-in fade-in duration-150">
            <WithdrawModal />
          </div>
        )}

        {activeTab === 'referral' && (
          <div className="animate-in fade-in duration-150">
            <ReferralModal />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-150">
            <ProfileView />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-150">
            <AdminPanel />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
