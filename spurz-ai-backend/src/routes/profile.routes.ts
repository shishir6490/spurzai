import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import UserProfile from '../models/UserProfile';
import HomeEngineService from '../services/HomeEngineService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /profile
 * Get user profile
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await UserProfile.findOne({ userId: req.user.id });

    if (!profile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Profile not found',
      });
      return;
    }

    res.json({
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        occupation: profile.occupation,
        city: profile.city,
        profilePictureUrl: profile.profilePictureUrl,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
        preferences: profile.preferences,
      },
    });
  } catch (error) {
    logger.error('Error getting profile:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get profile',
    });
  }
});

/**
 * PATCH /profile
 * Update user profile
 */
router.patch('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      fullName,
      dateOfBirth,
      occupation,
      city,
      profilePictureUrl,
      preferences,
    } = req.body;

    const profile = await UserProfile.findOne({ userId: req.user.id });

    if (!profile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Profile not found',
      });
      return;
    }

    // Update fields
    if (fullName !== undefined) profile.fullName = fullName;
    if (dateOfBirth !== undefined) profile.dateOfBirth = new Date(dateOfBirth);
    if (occupation !== undefined) profile.occupation = occupation;
    if (city !== undefined) profile.city = city;
    if (profilePictureUrl !== undefined) profile.profilePictureUrl = profilePictureUrl;
    if (preferences !== undefined) {
      profile.preferences = { ...profile.preferences, ...preferences };
    }

    await profile.save();

    // Regenerate snapshot after profile update
    try {
      await HomeEngineService.generateSnapshot(req.user.id as any);
    } catch (snapshotError) {
      logger.warn('Failed to regenerate snapshot after profile update:', snapshotError);
    }

    res.json({
      message: 'Profile updated successfully',
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        occupation: profile.occupation,
        city: profile.city,
        profilePictureUrl: profile.profilePictureUrl,
        preferences: profile.preferences,
      },
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile',
    });
  }
});

/**
 * POST /profile/onboarding
 * Complete onboarding and update profile
 */
router.post('/onboarding', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { step, onboardingStep, completed, onboardingStatus, status, data } = req.body;

    const profile = await UserProfile.findOne({ userId: req.user.id });

    if (!profile) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Profile not found',
      });
      return;
    }

    // Update onboarding step (support both field names)
    const stepValue = step !== undefined ? step : onboardingStep;
    if (stepValue !== undefined) {
      profile.onboardingStep = stepValue;
    }

    // Mark as completed (support multiple field names)
    if (completed || status === 'completed' || onboardingStatus === 'completed') {
      profile.onboardingCompleted = true;
    }

    // Update any additional data
    if (data) {
      if (data.fullName) profile.fullName = data.fullName;
      if (data.dateOfBirth) profile.dateOfBirth = new Date(data.dateOfBirth);
      if (data.occupation) profile.occupation = data.occupation;
      if (data.city) profile.city = data.city;
    }

    await profile.save();

    res.json({
      message: 'Onboarding updated successfully',
      profile: {
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
      },
    });
  } catch (error) {
    logger.error('Error updating onboarding:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update onboarding',
    });
  }
});

export default router;
