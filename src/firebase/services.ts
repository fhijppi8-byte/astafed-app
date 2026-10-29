import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { User, Transaction, DailyLog } from '../types';

export const USERS_COLLECTION = 'users';
export const TRANSACTIONS_COLLECTION = 'transactions';
export const DAILY_LOGS_COLLECTION = 'dailyLogs';
export const SETTINGS_COLLECTION = 'systemSettings';

// Real-time listener for users
export function subscribeToUsers(callback: (users: User[]) => void) {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as User);
      });
      callback(usersList);
    },
    (error) => {
      console.error('Error in users listener:', error);
    }
  );
}

// Real-time listener for transactions
export function subscribeToTransactions(callback: (txs: Transaction[]) => void) {
  return onSnapshot(
    collection(db, TRANSACTIONS_COLLECTION),
    (snapshot) => {
      const txList: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        txList.push(docSnap.data() as Transaction);
      });
      // Sort newest first
      txList.sort((a, b) => (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time));
      callback(txList);
    },
    (error) => {
      console.error('Error in transactions listener:', error);
    }
  );
}

// Real-time listener for current daily log
export function subscribeToDailyLog(callback: (log: DailyLog) => void) {
  return onSnapshot(
    doc(db, DAILY_LOGS_COLLECTION, 'current'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as DailyLog);
      }
    },
    (error) => {
      console.error('Error in dailyLog listener:', error);
    }
  );
}

// Real-time listener for system settings
export function subscribeToSystemSettings(
  callback: (settings: { marketScheduleMode?: 'auto' | 'manual'; manualMarketOpen?: boolean; holidayNotice?: string }) => void
) {
  return onSnapshot(
    doc(db, SETTINGS_COLLECTION, 'general'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    },
    (error) => {
      console.error('Error in systemSettings listener:', error);
    }
  );
}

// Save or update user in Firestore
export async function syncUserToFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
  } catch (err) {
    console.error('Failed to sync user to Firestore:', err);
  }
}

// Save or update transaction in Firestore
export async function syncTransactionToFirestore(transaction: Transaction) {
  try {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, transaction.id), transaction, { merge: true });
  } catch (err) {
    console.error('Failed to sync transaction to Firestore:', err);
  }
}

// Save daily log in Firestore
export async function syncDailyLogToFirestore(dailyLog: DailyLog) {
  try {
    await setDoc(doc(db, DAILY_LOGS_COLLECTION, 'current'), dailyLog, { merge: true });
  } catch (err) {
    console.error('Failed to sync daily log to Firestore:', err);
  }
}

// Save system settings in Firestore
export async function syncSystemSettingsToFirestore(settings: {
  marketScheduleMode: 'auto' | 'manual';
  manualMarketOpen: boolean;
  holidayNotice: string;
}) {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), settings, { merge: true });
  } catch (err) {
    console.error('Failed to sync settings to Firestore:', err);
  }
}

// Delete user from Firestore
export async function deleteUserFromFirestore(userId: string) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (err) {
    console.error('Failed to delete user from Firestore:', err);
  }
}
