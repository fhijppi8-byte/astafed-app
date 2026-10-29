import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId for custom provisioned Firestore instances
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, falling back to cached persistence.');
    }
  }
}

// Call connection test
testFirestoreConnection();
