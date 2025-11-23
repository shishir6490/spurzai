import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import User from '../models/User';
import UserProfile from '../models/UserProfile';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /auth/dev/login
 * Development-only endpoint for phone authentication
 * Bypasses Firebase token verification
 */
router.post('/dev/login', async (req, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Development endpoint not available in production',
      });
      return;
    }

    const { phoneNumber, firebaseUid, email } = req.body;

    if (!phoneNumber || !firebaseUid) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'phoneNumber and firebaseUid are required',
      });
      return;
    }

    logger.info(`[DEV] Login attempt for phone: ${phoneNumber}, uid: ${firebaseUid}`);

    // Find user by firebaseUid or phoneNumber
    let user = await User.findOne({ 
      $or: [{ firebaseUid }, { phoneNumber }] 
    });

    if (!user) {
      // Create new user
      user = await User.create({
        firebaseUid,
        phoneNumber,
        email: email || undefined,
        isActive: true,
        lastLoginAt: new Date(),
      });
      logger.info(`[DEV] New user created: ${firebaseUid}`);
    } else {
      // Update user data if needed
      if (user.firebaseUid !== firebaseUid) {
        user.firebaseUid = firebaseUid;
        logger.info(`[DEV] Updated firebaseUid for user`);
      }
      
      if (user.phoneNumber !== phoneNumber) {
        user.phoneNumber = phoneNumber;
      }
      
      if (email && user.email !== email) {
        user.email = email;
      }
      
      user.lastLoginAt = new Date();
      await user.save();
      
      logger.info(`[DEV] Existing user logged in: ${firebaseUid}`);
    }

    // Find or create profile
    let profile = await UserProfile.findOne({ userId: user._id });
    
    if (!profile) {
      profile = await UserProfile.create({
        userId: user._id,
        onboardingCompleted: false,
        onboardingStep: 0,
        preferences: {
          notifications: true,
          darkMode: false,
          currency: 'INR',
        },
      });
      logger.info(`[DEV] Profile created for user: ${firebaseUid}`);
    }

    res.status(200).json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isActive: user.isActive,
      },
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
        preferences: profile.preferences,
      },
    });
  } catch (error) {
    logger.error('[DEV] Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login',
    });
  }
});

/**
 * POST /auth/exchange
 * Exchange Firebase ID token for user data
 * Creates user if doesn't exist
 */
router.post('/exchange', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Check if profile exists
    let profile = await UserProfile.findOne({ userId: user._id });
    
    // Create profile if doesn't exist
    if (!profile) {
      profile = await UserProfile.create({
        userId: user._id,
        onboardingCompleted: false,
        onboardingStep: 0,
        preferences: {
          notifications: true,
          darkMode: false,
          currency: 'INR',
        },
      });
      logger.info(`Profile created for user: ${user.firebaseUid}`);
    }

    res.status(200).json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isActive: user.isActive,
      },
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
        preferences: profile.preferences,
      },
    });
  } catch (error) {
    logger.error('Exchange token error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to exchange token',
    });
  }
});

/**
 * GET /auth/me
 * Get current authenticated user info
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    const profile = await UserProfile.findOne({ userId: user._id });

    res.status(200).json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      profile: profile ? {
        id: profile._id,
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        occupation: profile.occupation,
        city: profile.city,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
        preferences: profile.preferences,
      } : null,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user info',
    });
  }
});

export default router;
