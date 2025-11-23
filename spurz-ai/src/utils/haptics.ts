import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  // Light tap feedback
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics not available on all devices
    }
  },

  // Medium impact feedback
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics not available on all devices
    }
  },

  // Heavy/Strong feedback
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Haptics not available on all devices
    }
  },

  // Selection feedback (subtle)
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Haptics not available on all devices
    }
  },

  // Success feedback (positive)
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics not available on all devices
    }
  },

  // Warning feedback
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      // Haptics not available on all devices
    }
  },

  // Error feedback
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Haptics not available on all devices
    }
  }
};
