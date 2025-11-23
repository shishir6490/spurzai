# Spurz.ai Backend API

Backend API server for Spurz.ai - Earning Intelligence Platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB (local or Atlas)
- Firebase project with Phone Authentication enabled

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI
   - Add Firebase credentials (see SETUP_GUIDE.md)

3. **Start development server:**
```bash
npm run dev
```

4. **Verify installation:**
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.2,
  "environment": "development"
}
```

## 📁 Project Structure

```
src/
├── config/          # Configuration (database, firebase, env)
├── models/          # Mongoose models
├── middlewares/     # Express middlewares (auth, validation)
├── services/        # Business logic (HomeEngine, InsightEngine, etc.)
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utilities (logger, validators)
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## 🔐 Authentication

All protected endpoints require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## 📚 API Endpoints

### Public
- `GET /` - API information
- `GET /health` - Health check

### Authentication
- `POST /auth/exchange` - Exchange Firebase token
- `GET /auth/me` - Get current user

### User Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /profile/onboarding` - Complete onboarding

### Income Sources
- `GET /income` - List income sources
- `POST /income` - Add income source
- `PUT /income/:id` - Update income source
- `DELETE /income/:id` - Delete income source

### Credit Cards
- `GET /cards` - List credit cards
- `POST /cards` - Add credit card
- `PUT /cards/:id` - Update card
- `DELETE /cards/:id` - Delete card

### Home (Dashboard)
- `GET /home` - Get home dashboard data

### Rewards & Wallet
- `GET /rewards/wallet/:userId` - Get user wallet balance and recent rewards
- `GET /rewards/history/:userId` - Get paginated rewards history
- `GET /rewards/stats/:userId` - Get detailed earning statistics
- `POST /rewards/add` - Add new reward (admin/system)
- `POST /rewards/claim/:rewardId` - Claim pending reward

## 🗄️ Database Models

1. **User** - Firebase user mapping
2. **UserProfile** - User profile and preferences
3. **IncomeSource** - Income streams
4. **CreditCard** - Credit card details
5. **FinancialSnapshot** - Daily financial state
6. **Insight** - Generated insights
7. **NextBestAction** - Recommended actions
8. **Goal** - User financial goals
9. **Reward** - Individual reward transactions (cashback, tasks, referrals)
10. **UserWallet** - User's total coins and rupees balance

## 🔄 Development Workflow

1. Phase 1 (Current): Backend bootstrap ✅
2. Phase 2: Database models
3. Phase 3: Authentication
4. Phase 4: Core services
5. Phase 5: API endpoints
6. Phase 6: Frontend integration
7. Phase 7: Testing

## 📖 Additional Documentation

- See `SETUP_GUIDE.md` for detailed setup instructions
- See `BACKEND_IMPLEMENTATION_PLAN.md` for full implementation roadmap

## 🐛 Troubleshooting

### MongoDB connection fails
- Verify MongoDB is running: `brew services list` (Mac) or `sudo systemctl status mongod` (Linux)
- Check connection string in `.env`
- For Atlas: Ensure IP whitelist includes your IP

### Firebase initialization fails
- Verify all Firebase credentials in `.env`
- Ensure private key includes line breaks (`\n`)
- Check Firebase project has Phone Auth enabled

### Port already in use
```bash
# Find process using port 4000
lsof -i :4000
# Kill process
kill -9 <PID>
```

## 📝 Environment Variables

See `.env.example` for full list of required environment variables.

## 🤝 Contributing

This is a private project. For questions, contact the Spurz.ai team.

## 📄 License

MIT
