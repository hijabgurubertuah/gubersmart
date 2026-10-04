import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
/* CRITICAL: The app will break without this line */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or database initializing.');
    }
    return false;
  }
}

/**
 * Filter and sanitize data to ensure only lightweight text, numbers, booleans,
 * and external HTTP/HTTPS text links are stored in Firestore.
 * Massive base64 binary strings are stripped to strictly protect quota.
 */
export function sanitizeForQuota(data: unknown): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Block base64 data URIs from eating Firestore quota
    if (data.startsWith('data:image/') || data.startsWith('data:application/')) {
      return '';
    }
    // Truncate excessively huge strings if any
    if (data.length > 50000) {
      return data.slice(0, 50000);
    }
    return data;
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForQuota(item));
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      result[key] = sanitizeForQuota(value);
    }
    return result;
  }
  return String(data);
}
