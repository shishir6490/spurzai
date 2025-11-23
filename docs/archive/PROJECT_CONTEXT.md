# SPURZ.AI - Complete Project Context Document

**Last Updated:** November 22, 2025  
**Project Version:** 0.1.0  
**Owner:** shishir6490

---

## 🎯 Project Overview

**SPURZ.AI** is a premium financial intelligence mobile application built with React Native and Expo. It provides AI-powered insights into earning, spending patterns, and credit card optimization. The app features a sophisticated dark theme with gold accents, delivering a luxury banking experience.

### Key Value Propositions
- **AI-Powered Financial Insights**: Intelligent spending analysis and earning optimization
- **Credit Card Management**: Multi-card tracking with rewards optimization
- **Premium Deals**: Curated, personalized deals based on spending patterns
- **Seamless Onboarding**: Multi-path authentication (phone, face recognition)
- **Financial Clarity**: Clear visualization of income, expenses, and savings

---

## 🏗️ Technical Architecture

### Core Technology Stack
- **Framework**: React Native 0.81.5
- **Platform**: Expo (latest)
- **Language**: TypeScript 5.2.2
- **UI Library**: React 19.1.0
- **Navigation**: React Navigation 6.x (Stack + Bottom Tabs)
- **State Management**: React Context API (AuthContext)
- **Animations**: React Native Animated API
- **Icons**: Expo Vector Icons (Ionicons, MaterialIcons, MaterialCommunityIcons)

### Key Dependencies
```json
{
  "expo-blur": "~15.0.7",          // Blur effects for premium UI
  "expo-haptics": "~15.0.7",       // Tactile feedback
  "expo-linear-gradient": "^15.0.7", // Gradient backgrounds
  "react-native-gesture-handler": "~2.28.0",
  "react-native-safe-area-context": "^5.6.2",
  "lottie-react-native": "latest"  // Animations
}
```

### Custom Fonts
- **Serif**: Cormorant Garamond (300, 400, 600) - For elegant headers
- **Sans-Serif**: Inter (400, 600, 700) - For body text and UI elements

---

## 📁 Project Structure

```
spurz-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Card3D.tsx              # 3D card with floating animation
│   │   ├── CustomTabBar.tsx        # Bottom navigation bar
│   │   ├── AnimatedNumber.tsx      # Counting animation for numbers
│   │   ├── AnimatedProgressBar.tsx # Progress indicators
│   │   ├── AnimatedSpurzLogo.tsx   # Animated brand logo
│   │   ├── ArrowFill.tsx           # Directional indicators
│   │   ├── SpurzLogo.tsx           # Static logo component
│   │   └── PermissionModal.tsx     # Permission request modals
│   │
│   ├── screens/             # App screens
│   │   ├── SplashScreen.tsx        # Initial loading screen
│   │   ├── LandingScreen.tsx       # Welcome/intro screen
│   │   ├── LoginScreen.tsx         # Login with phone/face (modal)
│   │   ├── SignupScreen.tsx        # New user registration
│   │   ├── OTPVerificationScreen.tsx
│   │   ├── EmailPermissionScreen.tsx
│   │   ├── SetuVerificationScreen.tsx
│   │   ├── ManualDataCollectionScreen.tsx
│   │   ├── OnboardingCompleteScreen.tsx
│   │   ├── FaceRecognitionScreen.tsx  # Standalone face setup
│   │   ├── HomeScreen.tsx          # Main dashboard
│   │   ├── DealsScreen.tsx         # Netflix-style deals catalog
│   │   ├── CardsScreen.tsx         # Credit card carousel
│   │   ├── GoalsScreen.tsx         # Financial goals (SPURZ Coins)
│   │   ├── SpurzAIScreen.tsx       # AI assistant interface
│   │   └── ProfileScreen.tsx       # User profile & settings
│   │
│   ├── navigation/          # Navigation configuration
│   │   └── RootNavigator.tsx       # Main navigator with auth flow
│   │
│   ├── context/             # Global state management
│   │   └── AuthContext.tsx         # User auth & financial data
│   │
│   ├── constants/           # App-wide constants
│   │   └── theme.ts                # Colors, fonts, spacing, gradients
│   │
│   ├── utils/               # Utility functions
│   │   ├── haptics.ts              # Haptic feedback helpers
│   │   ├── adaptive.ts             # Platform-specific adaptations
│   │   ├── mockData.ts             # Test/demo data
│   │   └── scenarioDetector.ts     # User scenario classification
│   │
│   └── types/               # TypeScript type definitions
│
├── assets/                  # Images, icons, splash screens
├── App.tsx                  # Root application component
├── app.json                 # Expo configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── babel.config.js          # Babel configuration with path aliases
```

---

## 🎨 Design System

### Color Palette
```typescript
COLORS = {
  // Backgrounds
  primaryBackground: '#0B0C10',     // Deep black
  secondaryBackground: '#14161F',   // Charcoal
  tertiaryBackground: '#1A1D29',    // Dark slate
  
  // Brand Colors
  primaryGold: '#D4AF37',           // Premium gold
  secondaryGold: '#EADFB4',         // Light gold
  
  // Text Hierarchy
  textPrimary: '#F8F8F8',           // Off-white
  textSecondary: '#A8A8A8',         // Gray
  textTertiary: '#696969',          // Deep gray
  textAccent: '#D4AF37',            // Gold highlights
  textAccentMuted: '#C9A961',       // Muted gold
  
  // Semantic
  success: '#4ADE80',               // Green
  error: '#FF6B6B',                 // Red
  warning: '#FFB800',               // Orange
  
  // Categories
  food: '#FF6B6B',
  shopping: '#4ECDC4',
  transport: '#95E1D3',
  travel: '#6366F1',
  entertainment: '#EC4899'
}
```

### Typography Scale
- **Hero**: 44px
- **Section Header**: 26px
- **Sub Header**: 19px
- **Body**: 14px
- **Small**: 12px

### Spacing System
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, xxl: 32px

### Border Radius
- sm: 8px, md: 12px, lg: 16px, xl: 24px, full: 9999px

### Gradients
- **Background**: Dark vertical gradient
- **Gold Button**: Gold to light gold
- **Premium Gold**: Shimmer effect
- **Card Accent**: Subtle gold tint

---

## 🔐 Authentication & User Flow

### Authentication States
1. **Scenario A**: Not logged in (Landing → Login/Signup)
2. **Scenario B**: Logged in, minimal data
3. **Scenario C**: Logged in, partial financial data
4. **Scenario D**: Logged in, complete financial profile

### Onboarding Flow
```
Landing → Login (Phone/Face) → OTP Verification → 
Email Permission (optional) → SETU Verification (optional) → 
Manual Data Entry → Onboarding Complete → Main App
```

### Face Recognition Implementation
- **Login Modal**: BlurView overlay on LoginScreen with close button
- **Setup Screen**: Standalone FaceRecognitionScreen for profile settings
- **Animation**: Scanning line with corner markers, pulse effects
- **Duration**: 3-second scan + 2-second success message

---

## 📱 Main App Screens

### 1. HomeScreen
**Purpose**: Financial dashboard with overview and insights

**Key Features**:
- Starfield animated background (50 twinkling stars)
- Total balance with animated counter
- Monthly income/expenses cards
- Spending breakdown by category
- Top credit cards preview
- Quick action buttons
- Horizontal swipe navigation to adjacent screens

**Layout**:
- Sticky header with blur effect (appears on scroll)
- ScrollView with vertical sections
- Card3D components for premium depth
- Animated progress bars and numbers

### 2. DealsScreen
**Purpose**: Netflix-inspired deals catalog with personalization

**Key Features**:
- Starfield background matching HomeScreen
- Welcome hero section (shows before scroll)
- Auto-scrolling hero carousel (5-second interval)
  - 3 featured deals with images, gradients, timers
  - Carousel indicators (dots)
- Quick category chips (Travel, Dining, Shopping, etc.)
- Category sections:
  - **Trending**: Flame icon, 4 deals
  - **Travel**: Airplane icon, 3 deals
  - **Dining**: Restaurant icon, 3 deals
  - **Shopping**: Cart icon, 3 deals
- Compact deal cards with Card3D wrapper
- Discount badges, pricing comparison, expiry timers

**Data Structure**:
```typescript
HERO_DEALS = [{
  id, title, subtitle, price, originalPrice, 
  discount, image, gradient, tag, expiresIn
}]

CATEGORY_DEALS = {
  trending: [...],
  travel: [...],
  dining: [...],
  shopping: [...]
}
```

### 3. CardsScreen
**Purpose**: Credit card management with 3D carousel

**Key Features**:
- Starfield background
- Horizontal FlatList carousel with:
  - 3D transforms (scale, rotateY, opacity)
  - Snap-to-interval behavior
  - Circular infinite loop (tripled array)
- Realistic card designs:
  - HDFC Infinia: Dark navy/black gradient, VISA logo
  - Amex Platinum: Metallic silver, AMEX logo
  - ICICI Sapphiro: Deep blue, Mastercard logo
  - Axis Reserve: Dark red, RuPay logo
- Network logos positioned bottom-right
- Pagination dots (static, based on actual index)
- Active card details section:
  - Available credit with progress bar
  - Outstanding amount
  - Quick actions (Pay Bill, Transactions, Rewards)
  - Tap to expand full details modal

**Technical Implementation**:
```typescript
const circularData = [...MOCK_CARDS, ...MOCK_CARDS, ...MOCK_CARDS];
const scale = scrollX.interpolate({
  inputRange: [(index-1)*width, index*width, (index+1)*width],
  outputRange: [0.85, 1, 0.85]
});
const rotateY = scrollX.interpolate({
  inputRange: [(index-1)*width, index*width, (index+1)*width],
  outputRange: ['45deg', '0deg', '-45deg']
});
```

### 4. ProfileScreen
**Purpose**: User profile with editable financial management

**Key Features**:
- Starfield background
- User info with avatar and membership badge
- Financial overview cards:
  - Monthly Income (green)
  - Monthly Expenses (red)
  - Monthly Savings (purple with percentage badge)
- MoM trends section:
  - Horizontal scrollable cards (6 months)
  - Expenses (red arrow down) and Savings (green arrow up)
  - Selectable with active state highlighting
- Editable category management:
  - List with tap-to-edit functionality
  - Add new category button
  - Icon, name, amount, card type restriction
  - Delete capability (except Monthly Income)
- Edit modal with TextInput for name/amount
- Real-time calculations (totalExpenses, monthlySavings)
- Settings menu items
- Swipe gesture for navigation

**State Management**:
```typescript
const [categories, setCategories] = useState<FinancialCategory[]>([...]);
const totalExpenses = categories
  .filter(c => c.id !== '1')
  .reduce((sum, c) => sum + c.amount, 0);
const monthlySavings = monthlyIncome - totalExpenses;
```

### 5. SpurzAIScreen (Goals/Coins)
**Purpose**: AI assistant and SPURZ Coins interface

**Key Features**:
- Starfield background (already implemented)
- AnimatedSpurzLogo with breathing effect
- Coin balance display
- AI chat interface or goals tracking
- Premium interactions

---

## 🎭 Key Components

### Card3D
**Purpose**: Premium 3D effect cards with depth and interactivity

**Features**:
- Floating animation (continuous Y-axis oscillation)
- Press interactions (scale down on press)
- LinearGradient background
- Adaptive shadow based on platform
- Customizable border radius and colors

**Usage**:
```tsx
<Card3D colors={['#D4AF3720', '#D4AF3705']} borderRadius={16}>
  {children}
</Card3D>
```

### CustomTabBar
**Purpose**: Bottom navigation with icons and labels

**Features**:
- 5 tabs: Home, Deals, SPURZ, Cards, Profile
- Active state with gold accent
- Icon + label layout
- Haptic feedback on press
- Transparent background with blur

### AnimatedNumber
**Purpose**: Counting animation for financial figures

**Features**:
- Smooth number transitions
- Currency formatting
- Prefix/suffix support (₹, %, etc.)

### Starfield Background
**Implementation**: Used across HomeScreen, CardsScreen, DealsScreen, ProfileScreen, SpurzAIScreen

**Technical Details**:
```typescript
interface Star {
  id, x, y, size, duration, delay, opacity
}
const generateStars = (count: number): Star[] => [
  // Random positions, sizes, durations
];
// Animated loop: opacity oscillates between 30% and 100%
```

---

## 🔄 Navigation Structure

### Tab Navigator (MainTabs)
```
┌─────────────────────────────────────────┐
│  Home  │  Deals  │  SPURZ  │  Cards  │  Profile  │
└─────────────────────────────────────────┘
```

### Auth Stack
```
Landing → Login/Signup → OTP → Email → SETU → Manual → Complete
```

### Navigation Flow
- **Logged Out**: Splash (3s) → AuthStack
- **Logged In**: Splash (3s) → MainTabs
- **Swipe Gestures**: Disabled in DealsScreen to prevent conflicts with carousels

---

## 🎯 User Scenarios

### Scenario Detection Logic
Located in `src/utils/scenarioDetector.ts`

**Scenario A**: New user, not logged in  
**Scenario B**: Logged in, no financial data  
**Scenario C**: Logged in, partial data (salary or cards)  
**Scenario D**: Logged in, complete data (salary + cards + expenses)

### Mock Data
Located in `src/utils/mockData.ts`
- Mock users for each scenario
- Mock financial data
- Mock extracted email data
- Mock credit cards with rewards

---

## 🎨 Animation Patterns

### Common Animation Types
1. **Fade In**: Opacity 0 → 1 (800ms)
2. **Slide Up**: TranslateY 50 → 0 (800ms)
3. **Scale Press**: Scale 1 → 0.95 (150ms)
4. **Pulse**: Scale 1 → 1.1 → 1 (loop)
5. **Float**: TranslateY -2 → -6 → -2 (2s loop)
6. **Shimmer**: Opacity animation for loading states
7. **Scan Line**: TranslateY -180 → 180 (2s loop)

### Easing Functions
- **Cubic Out**: Smooth deceleration
- **Ease In-Out**: Balanced acceleration/deceleration

---

## 🔨 Development Setup

### Prerequisites
```bash
node >= 16.x
npm >= 8.x
expo-cli (installed globally or via npx)
```

### Installation
```bash
cd /Users/shishirsharma/Downloads/spurz-ai
npm install
```

### Running the App
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
```

### TypeScript Path Aliases
Configured in `tsconfig.json` and `babel.config.js`:
```
@screens/*    → src/screens/*
@components/* → src/components/*
@constants/*  → src/constants/*
@utils/*      → src/utils/*
@context/*    → src/context/*
@navigation/* → src/navigation/*
@types/*      → src/types/*
```

---

## 🐛 Known Issues & Solutions

### Issue: "ship" icon error
**Fix**: Changed to "boat" (valid ionicons name)

### Issue: useEffect not imported in ProfileScreen
**Fix**: Added `useEffect` to React imports

### Issue: Swipe gestures conflict with carousels
**Fix**: Removed panResponder from DealsScreen

### Issue: Face login navigation error
**Fix**: Changed 'Goals' to 'SPURZ' in navigation

### Issue: Card swipe not working
**Fix**: Replaced with FlatList horizontal carousel

### Issue: Circular carousel not looping
**Fix**: Tripled array, added edge detection

### Issue: Card3D import error
**Fix**: Changed from default import to named import `{ Card3D }`

---

## 📊 Recent Major Changes

### Session Summary (Nov 22, 2025)

1. **CardsScreen Redesign**:
   - Horizontal FlatList carousel with 3D effects
   - Circular infinite loop
   - Realistic card designs with network logos
   - Inline active card details

2. **ProfileScreen Redesign**:
   - Editable financial categories
   - MoM trends (6 months historical data)
   - Category CRUD (add/edit/delete)
   - Real-time financial calculations

3. **DealsScreen Redesign**:
   - Netflix-inspired layout
   - Auto-scrolling hero carousel
   - Category sections with horizontal scrolls
   - Welcome hero section to fill top space
   - Starfield background

4. **Unified Backgrounds**:
   - Added starfield to DealsScreen, ProfileScreen, SpurzAIScreen
   - All main screens now have consistent premium aesthetic

5. **Face Login Enhancement**:
   - Converted to modal overlay with BlurView
   - Background blurs during face scan
   - Close button added
   - Fixed text alignment issues

---

## 🚀 Future Enhancement Ideas

### Suggested Features
1. **Deal Detail Views**: Full-screen modal with T&Cs, redemption steps
2. **Search & Filters**: Search bar, category filters, sort options
3. **Favorites**: Save deals, cards, goals
4. **Notifications**: Push notifications for deal expiry, card payment due
5. **Analytics**: Spending insights, category trends, MoM comparisons
6. **Social**: Share deals, refer friends
7. **Biometric Settings**: Face/fingerprint toggle in Profile
8. **Dark/Light Mode**: User preference toggle
9. **Multi-language**: Localization support
10. **Offline Mode**: Cache data for offline access

### Performance Optimizations
- Image caching for hero deals
- Virtualize long lists
- Memoize expensive renders
- Lazy load screens
- Optimize animations with native driver

---

## 📝 Code Style Guidelines

### Naming Conventions
- **Components**: PascalCase (e.g., `Card3D`, `CustomTabBar`)
- **Files**: PascalCase for components, camelCase for utils
- **Variables**: camelCase (e.g., `scrollAnim`, `isScanning`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MOCK_CARDS`, `HERO_DEALS`)
- **Types**: PascalCase with interface/type prefix (e.g., `Star`, `Card3DProps`)

### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Types/Interfaces
interface ComponentProps { ... }

// 3. Constants (outside component)
const MOCK_DATA = [...];

// 4. Component
export default function Component({ ...props }: ComponentProps) {
  // 4a. Hooks
  const [state, setState] = useState();
  
  // 4b. Effects
  useEffect(() => { ... }, []);
  
  // 4c. Handlers
  const handlePress = () => { ... };
  
  // 4d. Render
  return <View>...</View>;
}

// 5. Styles
const styles = StyleSheet.create({ ... });
```

### Best Practices
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Prefer `const` over `let`
- Use template literals for strings
- Comment complex logic
- Use haptic feedback for interactions
- Handle loading/error states gracefully

---

## 🔗 Important File Locations

### Core Configuration
- App entry: `/App.tsx`
- Expo config: `/app.json`
- TypeScript config: `/tsconfig.json`
- Babel config: `/babel.config.js`
- Dependencies: `/package.json`

### Key Source Files
- Theme constants: `/src/constants/theme.ts`
- Auth context: `/src/context/AuthContext.tsx`
- Root navigator: `/src/navigation/RootNavigator.tsx`
- Card3D component: `/src/components/Card3D.tsx`
- Haptics utils: `/src/utils/haptics.ts`

### Current Screen Files (Active)
- Home: `/src/screens/HomeScreen.tsx`
- Deals: `/src/screens/DealsScreen.tsx`
- Cards: `/src/screens/CardsScreen.tsx`
- Profile: `/src/screens/ProfileScreen.tsx`
- SPURZ: `/src/screens/SpurzAIScreen.tsx`
- Login: `/src/screens/LoginScreen.tsx`
- Face Recognition: `/src/screens/FaceRecognitionScreen.tsx`

### Old/Backup Files
- `*_old.tsx` files contain previous versions (safe to delete after verification)

---

## 📞 Contact & Support

**Project Owner**: shishir6490  
**EAS Project ID**: 0bee0d9c-9c3b-462c-bacc-c77bd62e6d9e  
**Package**: com.shishir6490.spurzai

---

## 🎉 Success Metrics

### User Experience Goals
- Smooth 60fps animations
- < 3s app startup time
- < 1s screen transitions
- Haptic feedback on all interactions
- Consistent premium aesthetic
- Intuitive navigation flow

### Technical Goals
- Zero TypeScript errors
- < 100KB bundle size increase per feature
- Reusable component library
- Comprehensive error handling
- Offline-first architecture (future)

---

**End of Project Context Document**

*This document is a living reference and should be updated as the project evolves.*
