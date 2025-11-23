import admin from 'firebase-admin';
import config from './env';
import logger from '../utils/logger';

let firebaseInitialized = false;

export const initializeFirebase = (): void => {
  if (firebaseInitialized) {
    logger.info('Firebase already initialized');
    return;
  }

  try {
    // Check if credentials are provided
    if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) {
      logger.warn('⚠️  Firebase credentials not configured - authentication will be disabled');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });

    firebaseInitialized = true;
    logger.info('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('❌ Firebase initialization error:', error);
    logger.warn('⚠️  Server will run without Firebase authentication');
  }
};

export const getAuth = (): admin.auth.Auth | null => {
  if (!firebaseInitialized) {
    return null;
  }
  return admin.auth();
};

export default { initializeFirebase, getAuth };
