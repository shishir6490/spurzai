# Spurz.AI API Documentation

Complete API reference for the Spurz.AI backend services.

**Base URL**: `http://localhost:4000` (development)  
**Production URL**: `https://api.spurz.ai` (coming soon)

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Home Dashboard](#home-dashboard)
- [User Profile](#user-profile)
- [Income Sources](#income-sources)
- [Credit Cards](#credit-cards)
- [Categories](#categories-coming-soon)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All authenticated endpoints require a Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

### POST /auth/dev/login

Development-only endpoint for testing authentication.

**Request**:
```json
{
  "phoneNumber": "+917503337817",
  "firebaseUid": "Eix3OoSy0nfo3uHEuHKyN54me9g1",
  "email": "test7503337817@spurz.dev"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "6921ad963819a0ac01d5f1b8",
    "firebaseUid": "Eix3OoSy0nfo3uHEuHKyN54me9g1",
    "phoneNumber": "+917503337817",
    "email": "test7503337817@spurz.dev",
    "isActive": true
  },
  "profile": {
    "id": "6921ad963819a0ac01d5f1bb",
    "onboardingCompleted": false,
    "onboardingStep": 0,
    "preferences": {
      "currency": "INR",
      "notifications": true,
      "darkMode": false
    }
  }
}
```

---

## 🏠 Home Dashboard

### GET /home

Retrieve complete home dashboard data including metrics, insights, and recommendations.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
{
  "meta": {
    "userId": "6921ad963819a0ac01d5f1b8",
    "userName": "User",
    "scenarioCode": "unknown",
    "healthScore": 100,
    "healthBand": "fair",
    "lastUpdated": "2025-11-23T04:20:58.766Z"
  },
  "hero": {
    "title": "Welcome back!",
    "subtitle": "Track your financial health"
  },
  "snapshot": {
    "metrics": {
      "monthlyIncome": 100000,
      "monthlyExpenses": 21000,
      "monthlyInvestments": 0,
      "monthlyLoans": 7299,
      "monthlySavings": 71701,
      "savingsRate": 0.71701,
      "potentialSavingsPercent": 8,
      "creditUtilization": 0,
      "availableCredit": 0,
      "totalCreditLimit": 0,
      "totalCreditUsed": 0,
      "cardCount": 0,
      "debtToIncomeRatio": 0
    }
  },
  "keyStats": [
    {
      "label": "Monthly Income",
      "value": "₹1,00,000",
      "icon": "trending-up"
    },
    {
      "label": "Savings Rate",
      "value": "72%",
      "icon": "piggy-bank"
    },
    {
      "label": "Credit Used",
      "value": "0%",
      "icon": "credit-card"
    },
    {
      "label": "Available Credit",
      "value": "₹2,00,000",
      "icon": "wallet"
    }
  ],
  "insights": [
    {
      "title": "Excellent Savings Habit",
      "description": "You're saving 72% of your income. Keep up the great work!",
      "category": "saving",
      "value": 72,
      "trend": "up",
      "priority": "low",
      "actionable": false
    }
  ],
  "nextBestActions": [
    {
      "id": "69228bac03c17e40778c6d77",
      "type": "credit",
      "title": "Add Your Credit Cards",
      "description": "Track your cards and discover better rewards opportunities",
      "icon": "card",
      "priority": 9,
      "estimatedImpact": "high",
      "status": "pending",
      "metadata": {}
    }
  ],
  "nudges": {
    "showOnboarding": true,
    "message": "Complete 67% more to unlock personalized insights"
  },
  "dataCompleteness": {
    "completionPercentage": 33,
    "hasSalaryInfo": true,
    "hasCardInfo": false,
    "hasBasicInfo": false
  },
  "bestCardsForCategories": []
}
```

**Metrics Explanation**:
- `monthlyIncome`: Total monthly income from all sources
- `monthlyExpenses`: Sum of all expense categories
- `monthlyInvestments`: Total monthly investments
- `monthlyLoans`: Total EMI/loan payments
- `monthlySavings`: Income - (Expenses + Investments + Loans)
- `savingsRate`: monthlySavings / monthlyIncome
- `potentialSavingsPercent`: AI-calculated potential savings percentage (persistent until expenses/investments change)
- `creditUtilization`: totalCreditUsed / totalCreditLimit
- `debtToIncomeRatio`: monthlyLoans / monthlyIncome

---

## 👤 User Profile

### GET /profile

Retrieve user profile information.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
{
  "id": "6921ad963819a0ac01d5f1bb",
  "userId": "6921ad963819a0ac01d5f1b8",
  "onboardingCompleted": false,
  "onboardingStep": 0,
  "preferences": {
    "currency": "INR",
    "notifications": true,
    "darkMode": false
  },
  "settings": {
    "trackingEnabled": true
  },
  "createdAt": "2025-11-23T03:45:00.000Z",
  "updatedAt": "2025-11-23T04:20:00.000Z"
}
```

### PUT /profile

Update user profile settings.

**Headers**:
```http
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request**:
```json
{
  "onboardingCompleted": true,
  "preferences": {
    "currency": "INR",
    "notifications": true,
    "darkMode": true
  },
  "settings": {
    "trackingEnabled": false
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "profile": {
    // Updated profile object
  }
}
```

---

## 💰 Income Sources

### GET /income

Retrieve all income sources for the authenticated user.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
[
  {
    "id": "6921b7db9ca6366220882176",
    "userId": "6921ad963819a0ac01d5f1b8",
    "type": "salary",
    "name": "Salary",
    "source": "Salary",
    "amount": 100000,
    "frequency": "monthly",
    "isPrimary": true,
    "createdAt": "2025-11-23T03:50:00.000Z"
  },
  {
    "id": "69220d93e425ceeb76f384de",
    "userId": "6921ad963819a0ac01d5f1b8",
    "type": "expense",
    "name": "Expense: Education",
    "source": "Expense: Education",
    "amount": 10000,
    "frequency": "monthly",
    "isPrimary": false,
    "createdAt": "2025-11-23T04:05:00.000Z"
  }
]
```

**Income Types**:
- `salary`: Regular employment income
- `freelance`: Freelance/contract work
- `business`: Business income
- `investment`: Investment returns
- `rental`: Rental income
- `other`: Other income sources
- `expense`: Expense category (stored in same collection)
- `investment_out`: Outgoing investments
- `loan`: Loan/EMI payments

### POST /income

Add a new income source or expense category.

**Headers**:
```http
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request**:
```json
{
  "type": "salary",
  "name": "Monthly Salary",
  "source": "Company XYZ",
  "amount": 100000,
  "frequency": "monthly",
  "isPrimary": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "incomeSource": {
    "id": "...",
    "userId": "...",
    "type": "salary",
    "name": "Monthly Salary",
    "source": "Company XYZ",
    "amount": 100000,
    "frequency": "monthly",
    "isPrimary": true,
    "createdAt": "2025-11-23T04:30:00.000Z"
  }
}
```

### PUT /income/:id

Update an existing income source.

**Headers**:
```http
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request**:
```json
{
  "amount": 120000,
  "name": "Updated Salary"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "incomeSource": {
    // Updated income source object
  }
}
```

### DELETE /income/:id

Delete an income source.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Income source deleted successfully"
}
```

---

## 💳 Credit Cards

### GET /cards

Retrieve all credit cards for the authenticated user.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
[
  {
    "id": "...",
    "userId": "...",
    "cardName": "HDFC Regalia",
    "bank": "HDFC Bank",
    "lastFourDigits": "1234",
    "cardType": "credit",
    "creditLimit": 200000,
    "currentBalance": 0,
    "dueDate": 15,
    "rewards": {
      "type": "points",
      "rate": 4
    },
    "isActive": true,
    "createdAt": "2025-11-23T04:00:00.000Z"
  }
]
```

### POST /cards

Add a new credit card.

**Headers**:
```http
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request**:
```json
{
  "cardName": "HDFC Regalia",
  "bank": "HDFC Bank",
  "lastFourDigits": "1234",
  "cardType": "credit",
  "creditLimit": 200000,
  "currentBalance": 0,
  "dueDate": 15,
  "rewards": {
    "type": "points",
    "rate": 4
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "card": {
    // Created card object
  }
}
```

### PUT /cards/:id

Update a credit card.

**Headers**:
```http
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request**:
```json
{
  "currentBalance": 15000,
  "creditLimit": 250000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "card": {
    // Updated card object
  }
}
```

### DELETE /cards/:id

Delete a credit card.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

---

## 📊 Categories (Coming Soon)

### GET /categories

Retrieve spending categories with AI recommendations.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Response** (200 OK):
```json
[
  {
    "id": "transportation",
    "name": "Transportation",
    "icon": "car",
    "amount": 5000,
    "percentage": 35,
    "color": "#3B82F6",
    "aiRecommendation": "Save ₹800/month by using HDFC Regalia credit card for fuel expenses",
    "isLocked": false
  },
  {
    "id": "education",
    "name": "Education",
    "icon": "school",
    "amount": 10000,
    "percentage": 28,
    "color": "#8B5CF6",
    "aiRecommendation": null,
    "isLocked": true
  }
]
```

### GET /categories/:id/breakdown

Get granular breakdown for a specific category.

**Headers**:
```http
Authorization: Bearer <firebase-token>
```

**Query Parameters**:
- `timeRange`: `daily` | `weekly` | `monthly` (default: `monthly`)

**Response** (200 OK):
```json
{
  "categoryId": "transportation",
  "categoryName": "Transportation",
  "timeRange": "monthly",
  "total": 5000,
  "breakdown": [
    {
      "date": "2025-11-01",
      "amount": 150,
      "description": "Fuel",
      "merchant": "Shell"
    },
    {
      "date": "2025-11-05",
      "amount": 200,
      "description": "Uber rides"
    }
  ],
  "subcategories": [
    {
      "name": "Fuel",
      "amount": 3000,
      "percentage": 60
    },
    {
      "name": "Public Transport",
      "amount": 1500,
      "percentage": 30
    },
    {
      "name": "Ride Sharing",
      "amount": 500,
      "percentage": 10
    }
  ]
}
```

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional information
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User doesn't have permission to access resource |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `SERVER_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be a positive number",
    "details": {
      "field": "amount",
      "value": -100,
      "constraint": "positive"
    }
  }
}
```

---

## 🔒 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 10 requests/minute per IP
- **Read endpoints**: 100 requests/minute per user
- **Write endpoints**: 30 requests/minute per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

When rate limit is exceeded:

**Response** (429 Too Many Requests):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## 📌 Best Practices

### 1. Always Handle Errors

```javascript
try {
  const response = await fetch('/home', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
  }
  
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Network Error:', error);
}
```

### 2. Use Persistent Connections

For mobile apps, consider using connection pooling and keep-alive headers.

### 3. Cache Responses

Cache dashboard data locally and refresh periodically to reduce API calls.

### 4. Batch Requests

When possible, use batch endpoints instead of multiple individual requests.

### 5. Handle Offline Mode

Implement offline-first architecture with local storage and sync when online.

---

## 🔄 Webhooks (Coming Soon)

Webhooks will be available for real-time notifications:

- Card transaction alerts
- Goal achievement notifications
- Bill payment reminders
- Budget threshold alerts

---

## 📝 Changelog

### v0.1.0 (2025-11-23)
- Initial API release
- Authentication endpoints
- Home dashboard
- Profile management
- Income sources CRUD
- Credit cards CRUD

### Coming Soon
- Categories API with granular breakdowns
- AI recommendations endpoint
- Goal tracking API
- Transaction parsing
- Bank account linking

---

**Last Updated**: November 23, 2025
