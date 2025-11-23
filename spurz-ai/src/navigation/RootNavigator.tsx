import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Screens
import SplashScreen from '@screens/SplashScreen';
import LandingScreen from '@screens/LandingScreen';
import LoginScreen from '@screens/LoginScreen';
import SignupScreen from '@screens/SignupScreen';
import OTPVerificationScreen from '@screens/OTPVerificationScreen';
import EmailPermissionScreen from '@screens/EmailPermissionScreen';
import SetuVerificationScreen from '@screens/SetuVerificationScreen';
import ManualDataCollectionScreen from '@screens/ManualDataCollectionScreen';
import OnboardingCompleteScreen from '@screens/OnboardingCompleteScreen';
import FaceRecognitionScreen from '@screens/FaceRecognitionScreen';
import HomeScreen from '@screens/HomeScreen';
import DealsScreen from '@screens/DealsScreen';
import CardsScreen from '@screens/CardsScreen';
import GoalsScreen from '@screens/GoalsScreen';
import ProfileScreen from '@screens/ProfileScreen';
import SpurzAIScreen from '@screens/SpurzAIScreen';
import CategoryDetailScreen from '@screens/CategoryDetailScreen';

// Components
import { CustomTabBar } from '@components/CustomTabBar';

// Context
import { useAuth } from '@context/AuthContext';

// Theme
import { COLORS } from '@constants/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createStackNavigator();

function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    </MainStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 90
        },
        swipeEnabled: false
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          gestureEnabled: false
        }}
        listeners={{
          swipeEnabled: false
        }}
      />
      <Tab.Screen 
        name="Deals" 
        component={DealsScreen}
        options={{
          tabBarLabel: 'Deals',
          gestureEnabled: false
        }}
        listeners={{
          swipeEnabled: false
        }}
      />
      <Tab.Screen 
        name="SPURZ" 
        component={SpurzAIScreen}
        options={{
          tabBarLabel: 'SPURZ.AI',
          gestureEnabled: false
        }}
        listeners={{
          swipeEnabled: false
        }}
      />
      <Tab.Screen 
        name="Cards" 
        component={CardsScreen}
        options={{
          tabBarLabel: 'Cards',
          gestureEnabled: false
        }}
        listeners={{
          swipeEnabled: false
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          gestureEnabled: false
        }}
        listeners={{
          swipeEnabled: false
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false,
      gestureEnabled: false
    }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="FaceRecognition" component={FaceRecognitionScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="EmailPermission" component={EmailPermissionScreen} />
      <Stack.Screen name="SetuVerification" component={SetuVerificationScreen} />
      <Stack.Screen name="ManualDataCollection" component={ManualDataCollectionScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const [isSplashFinished, setSplashFinished] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Track if we've shown auth screens to prevent navigation flicker
  const [hasShownAuth, setHasShownAuth] = useState(false);

  // Simulate loading resources (fonts) before showing main app
  useEffect(() => {
    const timeout = setTimeout(() => setSplashFinished(true), 3000);
    return () => clearTimeout(timeout);
  }, []);
  
  // Track auth state to prevent flicker during verification
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setHasShownAuth(true);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: COLORS.primaryBackground,
          primary: COLORS.primaryGold,
          text: COLORS.textPrimary,
          card: COLORS.secondaryBackground,
          border: 'transparent'
        }
      }}
    >
      <Stack.Navigator screenOptions={{ 
        headerShown: false,
        gestureEnabled: false
      }}>
        {!isSplashFinished ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : isAuthenticated && user ? (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}