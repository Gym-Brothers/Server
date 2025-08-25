# GYM Management System - API Endpoints Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Public Endpoints**: Marked with 🌐 (no authentication required)
- **Protected Endpoints**: Require valid JWT token

---

## 🔐 Authentication Endpoints

### 1. User Login 🌐
**POST** `/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "secret"
}
```

**Response (Success - 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gym.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 2. User Registration 🌐
**POST** `/auth/register`

**Request:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "phoneNumber": "+1234567890",
  "activityLevel": "moderately_active"
}
```

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "gender": "female",
    "phoneNumber": "+1234567890",
    "activityLevel": "moderately_active",
    "createdAt": "2025-08-25T10:30:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "message": "Username or email already exists",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 👤 User Management Endpoints

### 3. Get User Profile
**GET** `/user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gym.com",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1985-03-20T00:00:00.000Z",
    "gender": "male",
    "phoneNumber": "+1234567890",
    "profilePicture": null,
    "activityLevel": "very_active",
    "addresses": [],
    "emergencyContacts": [],
    "createdAt": "2025-08-25T09:00:00.000Z",
    "updatedAt": "2025-08-25T09:00:00.000Z"
  }
}
```

### 4. Update User Profile
**PUT** `/user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phoneNumber": "+0987654321",
  "activityLevel": "extremely_active",
  "profilePicture": "https://example.com/profile.jpg"
}
```

**Response (Success - 200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gym.com",
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "phoneNumber": "+0987654321",
    "activityLevel": "extremely_active",
    "profilePicture": "https://example.com/profile.jpg",
    "updatedAt": "2025-08-25T10:45:00.000Z"
  }
}
```

### 5. Get User Dashboard
**GET** `/user/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Welcome to your dashboard, admin!",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://example.com/profile.jpg"
    },
    "stats": {
      "activeSubscriptions": 2,
      "totalWorkouts": 45,
      "currentGoals": 3,
      "memberSince": "2025-08-25T09:00:00.000Z"
    },
    "latestMetrics": {
      "weight": 75.5,
      "height": 180,
      "bmi": 23.3,
      "bodyFatPercentage": 15.2,
      "recordedAt": "2025-08-24T08:00:00.000Z"
    },
    "activeCoaches": [
      {
        "id": 1,
        "name": "Mike Johnson",
        "specializations": ["strength_training", "weight_loss"],
        "subscriptionType": "premium"
      }
    ],
    "recentActivity": {
      "lastLogin": "2025-08-25T10:30:00.000Z",
      "weeklyGoalProgress": "75%"
    }
  }
}
```

### 6. Delete User Account
**DELETE** `/user/account`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Account successfully deleted",
  "userId": 1
}
```

**Response (Error - 400):**
```json
{
  "message": "Cannot delete account with active subscriptions. Please cancel all subscriptions first.",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🏋️ Coach Endpoints

### 7. Search Coaches 🌐
**GET** `/coach/search?specialization=strength_training&rating=4.0`

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `rating` (optional): Minimum rating filter

**Response (Success - 200):**
```json
{
  "message": "Coaches retrieved successfully",
  "data": [
    {
      "id": 1,
      "firstName": "Mike",
      "lastName": "Johnson",
      "bio": "Certified personal trainer with 10 years of experience",
      "specializations": ["strength_training", "weight_loss"],
      "averageRating": 4.8,
      "totalReviews": 125,
      "hourlyRate": 75.00,
      "currency": "USD",
      "isAvailable": true,
      "yearsOfExperience": 10,
      "profilePicture": "https://example.com/coach1.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1
  }
}
```

### 8. Get Coach Profile 🌐
**GET** `/coach/1`

**Response (Success - 200):**
```json
{
  "message": "Coach profile retrieved successfully",
  "data": {
    "id": 1,
    "firstName": "Mike",
    "lastName": "Johnson",
    "email": "mike@gym.com",
    "bio": "Certified personal trainer with 10 years of experience",
    "yearsOfExperience": 10,
    "specializations": [
      {
        "id": 1,
        "name": "strength_training",
        "description": "Building muscle and strength"
      }
    ],
    "certifications": [
      {
        "id": 1,
        "name": "NASM-CPT",
        "issuingOrganization": "NASM",
        "issueDate": "2015-06-01T00:00:00.000Z",
        "expiryDate": "2025-06-01T00:00:00.000Z",
        "isVerified": true
      }
    ],
    "averageRating": 4.8,
    "totalReviews": 125,
    "hourlyRate": 75.00,
    "currency": "USD",
    "maxClients": 20,
    "currentClientCount": 15,
    "isAvailable": true,
    "isVerified": true,
    "profilePicture": "https://example.com/coach1.jpg"
  }
}
```

### 9. Register as Coach
**POST** `/coach/register`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "bio": "Experienced fitness trainer specializing in strength training",
  "yearsOfExperience": 8,
  "hourlyRate": 65.00,
  "maxClients": 25,
  "specializations": ["strength_training", "muscle_building"],
  "certifications": [
    {
      "name": "ACSM-CPT",
      "issuingOrganization": "ACSM",
      "issueDate": "2017-03-15",
      "expiryDate": "2027-03-15"
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "message": "Coach registration submitted successfully",
  "data": {
    "userId": 2,
    "coachId": 2,
    "status": "pending_verification",
    "submittedAt": "2025-08-25T11:00:00.000Z"
  }
}
```

### 10. Get My Coach Profile
**GET** `/coach/profile/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Coach profile retrieved successfully",
  "data": {
    "id": 2,
    "firstName": "Sarah",
    "lastName": "Wilson",
    "bio": "Experienced fitness trainer specializing in strength training",
    "yearsOfExperience": 8,
    "hourlyRate": 65.00,
    "maxClients": 25,
    "currentClientCount": 12,
    "isAvailable": true,
    "isVerified": false,
    "specializations": ["strength_training", "muscle_building"],
    "certifications": [],
    "averageRating": 0,
    "totalReviews": 0
  }
}
```

### 11. Update Coach Profile
**PUT** `/coach/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "bio": "Updated bio with new specializations",
  "hourlyRate": 70.00,
  "isAvailable": false,
  "maxClients": 30
}
```

**Response (Success - 200):**
```json
{
  "message": "Coach profile updated successfully",
  "data": {
    "id": 2,
    "bio": "Updated bio with new specializations",
    "hourlyRate": 70.00,
    "isAvailable": false,
    "maxClients": 30,
    "updatedAt": "2025-08-25T11:15:00.000Z"
  }
}
```

---

## 💳 Subscription Endpoints

### 12. Get Subscription Pricing 🌐
**GET** `/subscription/pricing`

**Response (Success - 200):**
```json
{
  "message": "Subscription pricing retrieved successfully",
  "data": [
    {
      "type": "basic",
      "monthlyPrice": 49.99,
      "currency": "USD",
      "features": {
        "personalTrainingSessions": 2,
        "groupSessions": 8,
        "nutritionPlanning": false,
        "progressTracking": true,
        "customWorkouts": false
      },
      "description": "Perfect for beginners starting their fitness journey"
    },
    {
      "type": "premium",
      "monthlyPrice": 99.99,
      "currency": "USD",
      "features": {
        "personalTrainingSessions": 4,
        "groupSessions": 12,
        "nutritionPlanning": true,
        "progressTracking": true,
        "customWorkouts": true
      },
      "description": "Comprehensive fitness package for serious athletes"
    },
    {
      "type": "vip",
      "monthlyPrice": 199.99,
      "currency": "USD",
      "features": {
        "personalTrainingSessions": 8,
        "groupSessions": 20,
        "nutritionPlanning": true,
        "progressTracking": true,
        "customWorkouts": true
      },
      "description": "Premium experience with maximum personal attention"
    },
    {
      "type": "personal_training",
      "monthlyPrice": 149.99,
      "currency": "USD",
      "features": {
        "personalTrainingSessions": 6,
        "groupSessions": 0,
        "nutritionPlanning": true,
        "progressTracking": true,
        "customWorkouts": true
      },
      "description": "One-on-one personal training focused experience"
    }
  ]
}
```

### 13. Create Subscription
**POST** `/subscription`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "coachId": 1,
  "type": "premium",
  "startDate": "2025-09-01",
  "endDate": "2025-12-01",
  "personalTrainingSessions": 4,
  "groupSessions": 12,
  "nutritionPlanning": true,
  "progressTracking": true,
  "customWorkouts": true,
  "paymentMethod": "credit_card"
}
```

**Response (Success - 201):**
```json
{
  "message": "Subscription created successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "coachId": 1,
    "type": "premium",
    "status": "pending",
    "startDate": "2025-09-01T00:00:00.000Z",
    "endDate": "2025-12-01T00:00:00.000Z",
    "monthlyPrice": 99.99,
    "totalPrice": 299.97,
    "personalTrainingSessions": 4,
    "groupSessions": 12,
    "nutritionPlanning": true,
    "progressTracking": true,
    "customWorkouts": true,
    "paymentMethod": "credit_card",
    "nextPaymentDate": "2025-10-01T00:00:00.000Z",
    "createdAt": "2025-08-25T11:30:00.000Z"
  }
}
```

### 14. Get My Subscriptions
**GET** `/subscription`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Subscriptions retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 2,
      "coachId": 1,
      "coachName": "Mike Johnson",
      "type": "premium",
      "status": "active",
      "startDate": "2025-09-01T00:00:00.000Z",
      "endDate": "2025-12-01T00:00:00.000Z",
      "monthlyPrice": 99.99,
      "totalPrice": 299.97,
      "currency": "USD",
      "personalTrainingSessions": 4,
      "groupSessions": 12,
      "nutritionPlanning": true,
      "progressTracking": true,
      "customWorkouts": true,
      "nextPaymentDate": "2025-10-01T00:00:00.000Z",
      "sessionsUsed": {
        "personal": 2,
        "group": 5
      },
      "sessionsRemaining": {
        "personal": 2,
        "group": 7
      }
    }
  ]
}
```

### 15. Get Subscription Details
**GET** `/subscription/1`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Subscription details retrieved successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "coach": {
      "id": 1,
      "firstName": "Mike",
      "lastName": "Johnson",
      "bio": "Certified personal trainer with 10 years of experience",
      "specializations": ["strength_training", "weight_loss"],
      "averageRating": 4.8
    },
    "type": "premium",
    "status": "active",
    "startDate": "2025-09-01T00:00:00.000Z",
    "endDate": "2025-12-01T00:00:00.000Z",
    "monthlyPrice": 99.99,
    "totalPrice": 299.97,
    "currency": "USD",
    "personalTrainingSessions": 4,
    "groupSessions": 12,
    "nutritionPlanning": true,
    "progressTracking": true,
    "customWorkouts": true,
    "paymentMethod": "credit_card",
    "nextPaymentDate": "2025-10-01T00:00:00.000Z"
  }
}
```

### 16. Update Subscription
**PUT** `/subscription/1`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "type": "vip",
  "personalTrainingSessions": 8,
  "groupSessions": 20
}
```

**Response (Success - 200):**
```json
{
  "message": "Subscription updated successfully",
  "data": {
    "id": 1,
    "type": "vip",
    "personalTrainingSessions": 8,
    "groupSessions": 20,
    "monthlyPrice": 199.99,
    "updatedAt": "2025-08-25T12:00:00.000Z"
  }
}
```

### 17. Cancel Subscription
**POST** `/subscription/1/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reason": "Moving to different city",
  "cancellationDate": "2025-09-15"
}
```

**Response (Success - 200):**
```json
{
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": 1,
    "status": "cancelled",
    "cancellationDate": "2025-09-15T00:00:00.000Z",
    "reason": "Moving to different city",
    "refundAmount": 149.99
  }
}
```

---

## 🏥 Health Management Endpoints

### 18. Create Health Metrics
**POST** `/health/metrics`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "weight": 75.5,
  "height": 180,
  "bodyFatPercentage": 15.2,
  "muscleMass": 65.3,
  "restingHeartRate": 62,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "notes": "Feeling great after workout routine"
}
```

**Response (Success - 201):**
```json
{
  "message": "Health metrics recorded successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "weight": 75.5,
    "height": 180,
    "bmi": 23.3,
    "bodyFatPercentage": 15.2,
    "muscleMass": 65.3,
    "restingHeartRate": 62,
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "notes": "Feeling great after workout routine",
    "recordedAt": "2025-08-25T12:15:00.000Z",
    "createdAt": "2025-08-25T12:15:00.000Z"
  }
}
```

### 19. Get Health Metrics
**GET** `/health/metrics`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Health metrics retrieved successfully",
  "data": {
    "userId": 2,
    "metrics": [
      {
        "id": 1,
        "weight": 75.5,
        "height": 180,
        "bmi": 23.3,
        "bodyFatPercentage": 15.2,
        "muscleMass": 65.3,
        "restingHeartRate": 62,
        "bloodPressureSystolic": 120,
        "bloodPressureDiastolic": 80,
        "notes": "Feeling great after workout routine",
        "recordedAt": "2025-08-25T12:15:00.000Z"
      }
    ],
    "totalRecords": 1
  }
}
```

### 20. Update Health Metrics
**PUT** `/health/metrics/1`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "weight": 74.8,
  "bodyFatPercentage": 14.9,
  "notes": "Weight loss progress continuing"
}
```

**Response (Success - 200):**
```json
{
  "message": "Health metrics updated successfully",
  "data": {
    "id": 1,
    "weight": 74.8,
    "height": 180,
    "bmi": 23.1,
    "bodyFatPercentage": 14.9,
    "notes": "Weight loss progress continuing",
    "updatedAt": "2025-08-25T12:30:00.000Z"
  }
}
```

### 21. Create Medical History
**POST** `/health/medical-history`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "bloodType": "O+",
  "allergies": ["peanuts", "shellfish"],
  "medications": ["multivitamin"],
  "medicalConditions": [],
  "injuries": ["knee injury - 2020"],
  "surgeries": [],
  "familyHistory": ["diabetes - father", "hypertension - mother"],
  "smokingStatus": "never",
  "alcoholConsumption": "occasional",
  "exerciseHistory": "Regular gym-goer for 3 years",
  "notes": "Overall good health, careful with knee during workouts"
}
```

**Response (Success - 201):**
```json
{
  "message": "Medical history recorded successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "bloodType": "O+",
    "allergies": ["peanuts", "shellfish"],
    "medications": ["multivitamin"],
    "medicalConditions": [],
    "injuries": ["knee injury - 2020"],
    "surgeries": [],
    "familyHistory": ["diabetes - father", "hypertension - mother"],
    "smokingStatus": "never",
    "alcoholConsumption": "occasional",
    "exerciseHistory": "Regular gym-goer for 3 years",
    "notes": "Overall good health, careful with knee during workouts",
    "createdAt": "2025-08-25T12:45:00.000Z"
  }
}
```

### 22. Get Medical History
**GET** `/health/medical-history`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Medical history retrieved successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "bloodType": "O+",
    "allergies": ["peanuts", "shellfish"],
    "medications": ["multivitamin"],
    "medicalConditions": [],
    "injuries": ["knee injury - 2020"],
    "surgeries": [],
    "familyHistory": ["diabetes - father", "hypertension - mother"],
    "smokingStatus": "never",
    "alcoholConsumption": "occasional",
    "exerciseHistory": "Regular gym-goer for 3 years",
    "notes": "Overall good health, careful with knee during workouts",
    "createdAt": "2025-08-25T12:45:00.000Z",
    "updatedAt": "2025-08-25T12:45:00.000Z"
  }
}
```

### 23. Update Medical History
**PUT** `/health/medical-history`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "medications": ["multivitamin", "protein powder"],
  "notes": "Added protein supplement to routine"
}
```

**Response (Success - 200):**
```json
{
  "message": "Medical history updated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "medications": ["multivitamin", "protein powder"],
    "notes": "Added protein supplement to routine",
    "updatedAt": "2025-08-25T13:00:00.000Z"
  }
}
```

---

## 📋 Common Response Formats

### Success Response Structure
```json
{
  "message": "Operation completed successfully",
  "data": { /* Response data */ }
}
```

### Error Response Structure
```json
{
  "message": "Error description",
  "error": "Error Type",
  "statusCode": 400
}
```

### Pagination Structure (when applicable)
```json
{
  "message": "Data retrieved successfully",
  "data": [ /* Array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10
  }
}
```

---

## 🔧 HTTP Status Codes

- **200** - OK (Success)
- **201** - Created (Resource created successfully)
- **400** - Bad Request (Invalid request data)
- **401** - Unauthorized (Authentication required)
- **403** - Forbidden (Insufficient permissions)
- **404** - Not Found (Resource not found)
- **409** - Conflict (Resource already exists)
- **500** - Internal Server Error (Server error)

---

## 📝 Data Types & Enums

### Gender Enum
```
"male" | "female" | "other"
```

### Activity Level Enum
```
"sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
```

### Subscription Type Enum
```
"basic" | "premium" | "vip" | "personal_training"
```

### Subscription Status Enum
```
"active" | "inactive" | "pending" | "expired" | "cancelled"
```

### Goal Type Enum
```
"weight_loss" | "weight_gain" | "muscle_building" | "strength_training" | "endurance" | "general_fitness" | "rehabilitation" | "sports_performance"
```

### Blood Type Enum
```
"A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
```

---

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   cd /Users/abushiyyab/Desktop/GYM/Server
   yarn start:dev
   ```

2. **Test with cURL:**
   ```bash
   # Register a new user
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","dateOfBirth":"1990-01-01","gender":"male","phoneNumber":"+1234567890","activityLevel":"moderately_active"}'

   # Login
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'

   # Get user profile (replace TOKEN with actual token)
   curl -X GET http://localhost:3000/user/profile \
     -H "Authorization: Bearer TOKEN"
   ```

3. **Use with Postman:**
   - Import the endpoints into Postman
   - Set up environment variables for base URL and token
   - Use the Bearer Token authentication type for protected endpoints
