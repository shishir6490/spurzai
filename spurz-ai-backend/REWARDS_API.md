# Rewards System API Documentation

## Overview

The Spurz.ai rewards system allows users to earn coins through various activities like card cashback, completing tasks, and referrals. Coins can be converted to rupees (10 coins = ₹1).

## Base URL
```
http://localhost:4000 (development)
https://api.spurz.ai (production)
```

## Authentication
All endpoints require Firebase ID token:
```
Authorization: Bearer <firebase-id-token>
```

---

## Endpoints

### 1. Get User Wallet

Get user's wallet balance and recent rewards.

**Endpoint:** `GET /rewards/wallet/:userId`

**Parameters:**
- `userId` (path) - Firebase user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "userId": "firebase-uid-123",
      "totalCoins": 1250,
      "totalRupees": 125.0,
      "lifetimeCoinsEarned": 2500,
      "cardCashbackTotal": 800,
      "taskRewardsTotal": 1200,
      "referralRewardsTotal": 500
    },
    "recentRewards": [
      {
        "_id": "reward-id-1",
        "type": "CARD_CASHBACK",
        "coins": 50,
        "rupees": 5.0,
        "description": "Cashback from HDFC Regalia",
        "status": "COMPLETED",
        "createdAt": "2025-11-23T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get Rewards History

Get paginated history of all rewards.

**Endpoint:** `GET /rewards/history/:userId`

**Parameters:**
- `userId` (path) - Firebase user ID
- `page` (query, optional) - Page number (default: 1)
- `limit` (query, optional) - Results per page (default: 20)
- `status` (query, optional) - Filter by status: PENDING, COMPLETED, CLAIMED, EXPIRED
- `type` (query, optional) - Filter by type: TASK_COMPLETION, CARD_CASHBACK, REFERRAL, etc.

**Example:**
```
GET /rewards/history/firebase-uid-123?page=1&limit=20&status=COMPLETED
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "_id": "reward-id-1",
        "userId": "firebase-uid-123",
        "type": "CARD_CASHBACK",
        "coins": 50,
        "rupees": 5.0,
        "description": "Cashback from HDFC Regalia",
        "status": "COMPLETED",
        "creditCardId": "card-id-123",
        "createdAt": "2025-11-23T10:30:00.000Z",
        "claimedAt": "2025-11-23T10:35:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRewards": 98,
      "hasMore": true
    }
  }
}
```

---

### 3. Get Earning Statistics

Get detailed statistics about user's earnings.

**Endpoint:** `GET /rewards/stats/:userId`

**Parameters:**
- `userId` (path) - Firebase user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCoins": 2500,
    "totalRupees": 250.0,
    "lifetimeCoinsEarned": 5000,
    "breakdown": {
      "cardCashback": 1500,
      "taskRewards": 2000,
      "referralRewards": 1000,
      "dailyLogin": 300,
      "other": 200
    },
    "thisMonth": {
      "coins": 450,
      "rupees": 45.0,
      "rewards": 12
    },
    "monthlyBreakdown": [
      {
        "month": "2025-11",
        "coins": 450,
        "rupees": 45.0,
        "rewards": 12
      },
      {
        "month": "2025-10",
        "coins": 680,
        "rupees": 68.0,
        "rewards": 18
      }
    ]
  }
}
```

---

### 4. Add Reward (Admin/System)

Create a new reward for a user.

**Endpoint:** `POST /rewards/add`

**Request Body:**
```json
{
  "userId": "firebase-uid-123",
  "type": "TASK_COMPLETION",
  "coins": 50,
  "description": "Completed profile setup",
  "taskId": "task-id-123",
  "metadata": {
    "taskName": "Profile Setup",
    "category": "onboarding"
  }
}
```

**Fields:**
- `userId` (required) - Firebase user ID
- `type` (required) - Reward type: TASK_COMPLETION, CARD_CASHBACK, REFERRAL, DAILY_LOGIN, PROFILE_COMPLETION, CARD_LINK, DEAL_REDEEM, MONTHLY_BONUS
- `coins` (required) - Number of coins to award
- `description` (required) - Description of the reward
- `taskId` (optional) - Associated task ID
- `creditCardId` (optional) - Associated credit card ID
- `expiresAt` (optional) - Expiration date for the reward
- `metadata` (optional) - Additional data

**Response:**
```json
{
  "success": true,
  "data": {
    "reward": {
      "_id": "reward-id-123",
      "userId": "firebase-uid-123",
      "type": "TASK_COMPLETION",
      "coins": 50,
      "rupees": 5.0,
      "description": "Completed profile setup",
      "status": "COMPLETED",
      "createdAt": "2025-11-23T10:30:00.000Z"
    },
    "wallet": {
      "totalCoins": 1300,
      "totalRupees": 130.0
    }
  }
}
```

---

### 5. Claim Pending Reward

Claim a reward that is in PENDING status.

**Endpoint:** `POST /rewards/claim/:rewardId`

**Parameters:**
- `rewardId` (path) - Reward ID to claim

**Response:**
```json
{
  "success": true,
  "data": {
    "reward": {
      "_id": "reward-id-123",
      "status": "CLAIMED",
      "claimedAt": "2025-11-23T10:35:00.000Z",
      "coins": 50,
      "rupees": 5.0
    },
    "wallet": {
      "totalCoins": 1350,
      "totalRupees": 135.0
    }
  },
  "message": "Reward claimed successfully! 50 coins added to your wallet."
}
```

---

## Reward Types

| Type | Description | Typical Coins |
|------|-------------|---------------|
| `TASK_COMPLETION` | User completed a task | 10-100 |
| `CARD_CASHBACK` | Credit card cashback | 50-500 |
| `REFERRAL` | Referred a friend | 500 |
| `DAILY_LOGIN` | Daily login streak | 5-20 |
| `PROFILE_COMPLETION` | Completed profile | 50 |
| `CARD_LINK` | Linked a credit card | 100 |
| `DEAL_REDEEM` | Redeemed a deal | 25-100 |
| `MONTHLY_BONUS` | Monthly active bonus | 200 |

---

## Reward Status

| Status | Description |
|--------|-------------|
| `PENDING` | Reward created but not claimed |
| `COMPLETED` | Reward automatically added to wallet |
| `CLAIMED` | User manually claimed the reward |
| `EXPIRED` | Reward expired before claiming |

---

## Coin to Rupee Conversion

- **10 Spurz Coins = ₹1**
- Each coin is worth ₹0.10
- Conversion is automatic when rewards are added

---

## Error Responses

### 404 - User Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

### 404 - Reward Not Found
```json
{
  "success": false,
  "error": "Reward not found"
}
```

### 400 - Already Claimed
```json
{
  "success": false,
  "error": "This reward has already been claimed"
}
```

### 400 - Reward Expired
```json
{
  "success": false,
  "error": "This reward has expired"
}
```

---

## Example Usage

### JavaScript/TypeScript (Frontend)

```typescript
// Get wallet balance
const response = await fetch(`${API_BASE_URL}/rewards/wallet/${userId}`, {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log('Wallet:', data.data.wallet);

// Get earning stats
const statsResponse = await fetch(`${API_BASE_URL}/rewards/stats/${userId}`, {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const stats = await statsResponse.json();
console.log('This month earnings:', stats.data.thisMonth);
```

### cURL

```bash
# Get wallet
curl -X GET "http://localhost:4000/rewards/wallet/firebase-uid-123" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Add reward (admin)
curl -X POST "http://localhost:4000/rewards/add" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "firebase-uid-123",
    "type": "TASK_COMPLETION",
    "coins": 50,
    "description": "Welcome bonus"
  }'

# Claim reward
curl -X POST "http://localhost:4000/rewards/claim/reward-id-123" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## Database Schema

### Reward Model
```typescript
{
  userId: String (required, indexed)
  type: RewardType (required)
  coins: Number (required)
  rupees: Number (auto-calculated)
  description: String (required)
  status: RewardStatus (default: COMPLETED)
  taskId: String (optional)
  creditCardId: String (optional)
  claimedAt: Date (optional)
  expiresAt: Date (optional)
  metadata: Object (optional)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### UserWallet Model
```typescript
{
  userId: String (required, unique)
  totalCoins: Number (default: 0)
  totalRupees: Number (default: 0)
  lifetimeCoinsEarned: Number (default: 0)
  cardCashbackTotal: Number (default: 0)
  taskRewardsTotal: Number (default: 0)
  referralRewardsTotal: Number (default: 0)
  lastRewardAt: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## Notes

- Wallets are automatically created when a user receives their first reward
- All coin amounts are converted to rupees using the 10:1 ratio
- Rewards are automatically indexed by userId and status for performance
- History queries support pagination to handle large datasets
- Expired rewards can still be viewed in history but cannot be claimed
