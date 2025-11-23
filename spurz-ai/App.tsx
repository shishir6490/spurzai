import React from 'react';
// Gesture handler must be imported at the top level for React Navigation
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useCormorant, CormorantGaramond_300Light, CormorantGaramond_400Regular, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { useFonts as useInter, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '@context/AuthContext';
import RootNavigator from '@navigation/RootNavigator';

export default function App() {
  const [cormorantLoaded] = useCormorant({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold
  });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold
  });

  if (!cormorantLoaded || !interLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </>
  );
}