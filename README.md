# Spurz.AI - AI-Powered Financial Intelligence Platform

> **Smart financial tracking, credit card optimization, and AI-driven insights for better money management**

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Deployment](#deployment)

---

## 🎯 Overview

Spurz.AI is a comprehensive financial intelligence platform that helps users:
- Track income, expenses, investments, and loans
- Optimize credit card usage with AI recommendations
- Get personalized financial insights and savings opportunities
- Visualize spending patterns across categories
- Achieve financial goals through smart recommendations

### Tech Stack

**Frontend (Mobile App)**
- React Native + Expo SDK 51
- TypeScript
- React Navigation v6
- Firebase Authentication
- Expo Linear Gradient, Blur View
- Custom animation system

**Backend (API Server)**
- Node.js + Express
- TypeScript
- MongoDB (Mongoose ODM)
- Firebase Admin SDK
- JWT Authentication

---

## ✨ Features

### 🏠 Home Dashboard
- **Savings Overview Card**: Real-time current vs. potential savings visualization
- **Dynamic Calculations**: Persistent savings percentages based on income and spending
- **AI Recommendations**: Category-specific optimization suggestions
- **Top Spending Categories**: Visual breakdown of expenses with smart insights
- **Tracking Controls**: Enable/disable spending tracking from settings

### 💳 Cards Management
- Add and manage multiple credit cards
- Track credit utilization and limits
- Get card recommendations based on spending patterns
- View best cards for each spending category

### 📊 Goals & Insights
- Set and track financial goals
- AI-powered spending insights
- Monthly improvement tracking
- Savings rate analysis

### 👤 Profile & Settings
- Complete financial profile management
- Add income sources (salary, freelance, business, etc.)
- Track expenses across categories
- Manage loans and EMIs
- Enable/disable spending tracking

### 🔐 Authentication
- Phone number-based Firebase authentication
- Dev mode for testing (bypass OTP)
- Secure token exchange with backend
- Persistent session management

---

## 📁 Project Structure

```
spurz/
├── spurz-ai/                    # React Native mobile app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── AddCardFlow.tsx
│   │   │   ├── AnimatedNumber.tsx
│   │   │   ├── Card3D.tsx
│   │   │   ├── SpendingCategoryCard.tsx
│   │   │   └── ...
│   │   ├── config/              # Configuration files
│   │   │   ├── firebase.ts
│   │   │   └── devPhoneAuth.ts
│   │   ├── constants/           # App constants
│   │   │   └── theme.ts
│   │   ├── context/             # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── navigation/          # Navigation setup
│   │   │   └── RootNavigator.tsx
│   │   ├── screens/             # App screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CardsScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── CategoryDetailScreen.tsx
│   │   │   └── ...
│   │   ├── services/            # API services
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   └── utils/               # Utility functions
│   │       ├── adaptive.ts
│   │       ├── haptics.ts
│   │       └── mockData.ts
│   ├── assets/                  # Images, fonts, etc.
│   ├── app.json                 # Expo configuration
│   ├── package.json
│   └── tsconfig.json
│
├── spurz-ai-backend/            # Node.js API server
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── server.ts            # Server entry point
│   │   ├── config/              # Configuration
│   │   │   ├── database.ts
│   │   │   └── firebase.ts
│   │   ├── middlewares/         # Express middlewares
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/              # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── UserProfile.ts
│   │   │   ├── IncomeSource.ts
│   │   │   ├── CreditCard.ts
│   │   │   └── ...
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── home.routes.ts
│   │   │   ├── profile.routes.ts
│   │   │   └── ...
│   │   ├── services/            # Business logic
│   │   │   └── MetricsService.ts
│   │   └── utils/               # Utilities
│   ├── scripts/                 # Maintenance scripts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Documentation
│   ├── API.md                   # API documentation
│   ├── ARCHITECTURE.md          # Architecture overview
│   └── archive/                 # Archived documentation
│
└── .backups/                    # Automated backups
    └── backup_YYYYMMDD_HHMMSS/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Authentication enabled
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

#### 1. Clone the Repository

```bash
cd /path/to/spurz
```

#### 2. Setup Backend

```bash
cd spurz-ai-backend
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your MongoDB URI, Firebase credentials, etc.

# Start the server
npm run dev
```

Backend will run on `http://localhost:4000`

#### 3. Setup Frontend

```bash
cd ../spurz-ai
npm install

# Configure Firebase
# Update src/config/firebase.ts with your Firebase config

# Start Expo
npx expo start
```

#### 4. Run on Device/Simulator

- **iOS**: Press `i` in Expo CLI
- **Android**: Press `a` in Expo CLI  
- **Physical Device**: Scan QR code with Expo Go app

### Dev Mode (Testing without OTP)

The app includes a dev mode for testing authentication without SMS:

1. Use any phone number (e.g., +917503337817)
2. Use any 6-digit code (e.g., 123456)
3. Backend auto-creates/logs in test user

---

## 📡 API Documentation

Comprehensive API documentation is available in [`docs/API.md`](docs/API.md)

### Quick Reference

**Base URL**: `http://localhost:4000` (development)

#### Authentication

```http
POST /auth/dev/login
Content-Type: application/json

{
  "phoneNumber": "+917503337817",
  "firebaseUid": "abc123...",
  "email": "test@spurz.dev"
}
```

#### Home Dashboard

```http
GET /home
Authorization: Bearer <firebase-token>

Response: {
  "snapshot": {
    "metrics": {
      "monthlyIncome": 100000,
      "monthlyExpenses": 21000,
      "monthlyInvestments": 0,
      "monthlyLoans": 7299,
      "monthlySavings": 71701,
      "potentialSavingsPercent": 8,
      "savingsRate": 0.71701
    }
  },
  "keyStats": [...],
  "insights": [...],
  "nextBestActions": [...]
}
```

#### User Profile

```http
GET /profile
Authorization: Bearer <firebase-token>

Response: {
  "id": "...",
  "onboardingCompleted": true,
  "preferences": {
    "currency": "INR",
    "notifications": true
  },
  "settings": {
    "trackingEnabled": true
  }
}
```

See [`docs/API.md`](docs/API.md) for complete endpoint documentation.

---

## 🏗 Architecture

### Frontend Architecture

```
┌─────────────────────────────────────┐
│         App Entry Point             │
│         (App.tsx)                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Auth Context Provider          │
│   (Firebase + Backend Integration)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Root Navigator                │
│   (Auth Stack / Main Tabs)          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Auth Stack │  │  Main Tabs  │
│  - Landing  │  │  - Home     │
│  - Login    │  │  - Cards    │
│  - Signup   │  │  - Goals    │
│  - OTP      │  │  - Profile  │
└─────────────┘  └─────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│         Express Server              │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┬────────────┐
       ▼                ▼            ▼
┌──────────┐    ┌──────────┐  ┌──────────┐
│  Auth    │    │  Routes  │  │  Models  │
│  Middle  │───▶│  Layer   │──│  Layer   │
│  ware    │    │          │  │          │
└──────────┘    └──────────┘  └──────────┘
                       │              │
                       ▼              ▼
                ┌──────────┐    ┌──────────┐
                │ Services │    │ MongoDB  │
                │  Layer   │───▶│ Database │
                └──────────┘    └──────────┘
```

### Data Flow

1. **User Authentication**: Firebase Auth → Backend Token Exchange → JWT Session
2. **Dashboard Load**: Home API → MetricsService → Calculate Savings → Return Data
3. **Category Tracking**: User Input → API → MongoDB → Real-time Updates
4. **AI Recommendations**: Spending Analysis → Pattern Detection → Personalized Suggestions

---

## 💻 Development

### Running Tests

```bash
# Backend tests
cd spurz-ai-backend
npm test

# Frontend tests  
cd spurz-ai
npm test
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

### Database Scripts

```bash
# Remove duplicate entries
cd spurz-ai-backend
node scripts/remove-duplicate-salary.js

# Seed test data
node scripts/seed-test-data.js
```

### Debugging

**Frontend**: Use React Native Debugger or Expo DevTools
**Backend**: Use VS Code debugger or `console.log`

Environment variables:
- `DEBUG=spurz:*` - Enable debug logs
- `NODE_ENV=development` - Development mode

---

## 🚢 Deployment

### Backend Deployment (Heroku/Railway/Render)

```bash
cd spurz-ai-backend

# Build
npm run build

# Environment variables required:
# - MONGODB_URI
# - FIREBASE_PROJECT_ID
# - FIREBASE_CLIENT_EMAIL
# - FIREBASE_PRIVATE_KEY
# - JWT_SECRET
# - PORT

# Start production server
npm start
```

### Frontend Deployment (EAS Build)

```bash
cd spurz-ai

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📝 Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://...

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Server
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key

# Features
DEV_MODE=true
```

### Frontend

Update `src/config/firebase.ts` with your Firebase configuration.

---

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team

**Shishir Sharma** - Product Owner

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: support@spurz.ai

---

## 🗺 Roadmap

### Q1 2025
- [ ] Email transaction parsing
- [ ] Advanced AI recommendations
- [ ] Bill payment reminders
- [ ] Investment tracking

### Q2 2025
- [ ] Web dashboard
- [ ] Bank account linking (Plaid integration)
- [ ] Advanced analytics
- [ ] Multi-currency support

### Q3 2025
- [ ] Social features (compare with friends)
- [ ] Gamification
- [ ] Premium subscription tiers
- [ ] White-label solution

---

**Last Updated**: November 23, 2025
