import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import User from '../models/User';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    phoneNumber: string;
    email?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    // Verify Firebase ID token
    const auth = getAuth();
    if (!auth) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Authentication service not configured',
      });
      return;
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, phone_number, email, name } = decodedToken;
    
    logger.info(`Token verified for user: ${uid}`);
    logger.info(`Phone: ${phone_number || 'none'}, Email: ${email || 'none'}, Name: ${name || 'none'}`);
    
    // For development: If phone_number is not in claims, try to get it from displayName
    // This happens when using email/password auth in development
    let userPhone = phone_number;
    if (!userPhone && name && name.startsWith('+')) {
      userPhone = name; // displayName contains phone number in dev mode
      logger.info(`Using phone from displayName: ${userPhone}`);
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firebaseUid: uid,
        phoneNumber: userPhone || '',
        email: email || undefined,
        isActive: true,
        lastLoginAt: new Date(),
      });
      logger.info(`New user created: ${uid}`);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      phoneNumber: user.phoneNumber,
      email: user.email,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error.message || error);
    logger.error('Error code:', error.code);
    logger.error('Error details:', JSON.stringify(error, null, 2));

    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
      return;
    }

    if (error.code === 'auth/argument-error') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

export default authenticate;
