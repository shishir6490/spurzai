export default {
  expo: {
    name: "Spurz AI",
    slug: "spurz-ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0B0C10"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.shishir6490.spurzai",
      infoPlist: {
        NSFaceIDUsageDescription: "We use Face ID to securely log you into your Spurz AI account.",
        NSCameraUsageDescription: "We use your camera for Face ID authentication."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0B0C10"
      },
      package: "com.shishir6490.spurzai",
      permissions: [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "0bee0d9c-9c3b-462c-bacc-c77bd62e6d9e"
      }
    },
    owner: "shishir6490",
    plugins: [
      [
        "expo-local-authentication",
        {
          faceIDPermission: "We use Face ID to securely log you into your Spurz AI account."
        }
      ]
    ]
  }
};
