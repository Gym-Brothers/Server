# GYM Management System - Comprehensive API Endpoints Documentation

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

---

## 📹 Media Management Endpoints (S3 Integration)

### 1. Upload Media (Video/Image)
**POST** `/api/media/upload`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request (Form Data):**
```
files: [File, File?] // Video file and optional thumbnail
metadata: JSON string
```

**Metadata JSON:**
```json
{
  "title": "Proper Squat Form",
  "description": "Demonstration of correct squat technique",
  "type": "video",
  "category": "exercise_demo",
  "exerciseId": 123,
  "trainingProgramId": 456,
  "isPublic": true
}
```

**Response (Success - 201):**
```json
{
  "id": 1,
  "title": "Proper Squat Form",
  "type": "video",
  "category": "exercise_demo",
  "publicUrl": "https://gym-app-media.s3.amazonaws.com/coaches/1/exercise_demo/video.mp4",
  "thumbnailS3Key": "coaches/1/exercise_demo/thumbnails/thumb.jpg",
  "fileSize": 15728640,
  "durationSeconds": 120,
  "createdAt": "2025-08-25T10:30:00.000Z"
}
```

### 2. Get Coach Media
**GET** `/api/media/coach/{coachId}?category=exercise_demo`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Proper Squat Form",
    "type": "video",
    "category": "exercise_demo",
    "publicUrl": "https://gym-app-media.s3.amazonaws.com/...",
    "viewCount": 245,
    "createdAt": "2025-08-25T10:30:00.000Z"
  }
]
```

### 3. Get Exercise Media
**GET** `/api/media/exercise/{exerciseId}`

### 4. Get Public Media 🌐
**GET** `/api/media/public?category=exercise_demo`

### 5. Delete Media
**DELETE** `/api/media/{mediaId}`

### 6. Get Presigned Upload URL
**POST** `/api/media/upload-url`

**Request:**
```json
{
  "fileName": "squat-demo.mp4",
  "contentType": "video/mp4",
  "category": "exercise_demo"
}
```

---

## 🏋️ InBody Test & Body Composition Endpoints

### 1. Create InBody Test
**POST** `/api/inbody/test`

**Request:**
```json
{
  "weight": 75.5,
  "height": 175.0,
  "skeletalMuscleMass": 32.8,
  "bodyFatMass": 12.3,
  "bodyFatPercentage": 16.3,
  "totalBodyWater": 45.2,
  "proteinMass": 9.8,
  "mineralMass": 3.2,
  "visceralFatLevel": 8,
  "basalMetabolicRate": 1680,
  "leanBodyMass": 63.2,
  "armMuscleMass": {"left": 3.2, "right": 3.1},
  "legMuscleMass": {"left": 9.8, "right": 9.9},
  "trunkMuscleMass": 23.5,
  "bodyScore": 85,
  "bodyType": "athletic",
  "testDate": "2025-08-25T10:00:00.000Z",
  "testLocation": "Main Gym",
  "technicianName": "Dr. Smith"
}
```

**Response (Success - 201):**
```json
{
  "id": 1,
  "userId": 2,
  "weight": 75.5,
  "bodyFatPercentage": 16.3,
  "skeletalMuscleMass": 32.8,
  "basalMetabolicRate": 1680,
  "bodyScore": 85,
  "testDate": "2025-08-25T10:00:00.000Z",
  "createdAt": "2025-08-25T10:30:00.000Z"
}
```

### 2. Get User's InBody Tests
**GET** `/api/inbody/tests`

**Response:**
```json
[
  {
    "id": 1,
    "weight": 75.5,
    "bodyFatPercentage": 16.3,
    "skeletalMuscleMass": 32.8,
    "testDate": "2025-08-25T10:00:00.000Z"
  }
]
```

### 3. Get Latest InBody Test
**GET** `/api/inbody/latest`

### 4. Get InBody Analysis
**GET** `/api/inbody/analysis/{testId}`

**Response:**
```json
{
  "bmi": 24.7,
  "bodyFatCategory": "Fitness",
  "muscleMassCategory": "Excellent",
  "metabolicAge": 25,
  "hydrationStatus": "Well Hydrated",
  "recommendations": [
    "Focus on maintaining current muscle mass",
    "Consider slight caloric deficit for fat loss"
  ],
  "targetCalories": 2200,
  "targetProtein": 140,
  "targetCarbs": 220,
  "targetFat": 75
}
```

### 5. Get Progress Analysis
**GET** `/api/inbody/progress`

**Response:**
```json
{
  "weightChange": -2.3,
  "bodyFatChange": -1.8,
  "muscleMassChange": 0.8,
  "waterChange": 0.5,
  "bmrChange": 45,
  "testPeriod": {
    "from": "2025-07-25T10:00:00.000Z",
    "to": "2025-08-25T10:00:00.000Z",
    "days": 31
  }
}
```

---

## 🍎 Nutrition Planning Endpoints (AI-Powered)

### 1. Create Personalized Nutrition Plan
**POST** `/api/nutrition/plan`

**Request:**
```json
{
  "coachId": 1,
  "inbodyTestId": 1,
  "goal": "weight_loss",
  "dietType": "high_protein",
  "durationWeeks": 8,
  "preferences": {
    "allergies": ["nuts", "dairy"],
    "foodPreferences": ["chicken", "fish", "vegetables"],
    "foodsToAvoid": ["processed_foods"],
    "mealsPerDay": 6
  }
}
```

**Response (Success - 201):**
```json
{
  "id": 1,
  "name": "Weight Loss Plan - High Protein",
  "goal": "weight_loss",
  "dietType": "high_protein",
  "durationWeeks": 8,
  "dailyCalories": 1800,
  "proteinGrams": 140,
  "carbsGrams": 135,
  "fatGrams": 60,
  "waterLiters": 2.6,
  "mealsPerDay": 6,
  "mealTiming": [
    {"meal": "Breakfast", "time": "07:00", "calories": 450},
    {"meal": "Morning Snack", "time": "10:00", "calories": 180},
    {"meal": "Lunch", "time": "13:00", "calories": 540},
    {"meal": "Afternoon Snack", "time": "16:00", "calories": 180},
    {"meal": "Dinner", "time": "19:00", "calories": 360},
    {"meal": "Evening Snack", "time": "21:00", "calories": 90}
  ],
  "supplements": [
    {"name": "Whey Protein", "dosage": "25g", "timing": "Post-workout"},
    {"name": "Multivitamin", "dosage": "1 tablet", "timing": "With breakfast"}
  ]
}
```

### 2. Get User's Nutrition Plans
**GET** `/api/nutrition/plans`

### 3. Get Nutrition Plan Details
**GET** `/api/nutrition/plan/{planId}`

### 4. Get Daily Meal Plan
**GET** `/api/nutrition/plan/{planId}/day/{dayNumber}`

**Response:**
```json
{
  "day": {
    "id": 1,
    "dayNumber": 1,
    "weekNumber": 1,
    "name": "Day 1 - Week 1",
    "totalCalories": 1800,
    "totalProtein": 140,
    "totalCarbs": 135,
    "totalFat": 60,
    "dailyTips": "Stay hydrated throughout the day",
    "meals": [
      {
        "type": "breakfast",
        "name": "Power Breakfast",
        "suggestedTime": "07:00",
        "calories": 450,
        "protein": 35,
        "carbs": 40,
        "fat": 15,
        "preparationTimeMinutes": 15,
        "cookingInstructions": "Prepare ingredients the night before for quick assembly.",
        "foodItems": [
          {
            "name": "Oatmeal",
            "quantity": 1,
            "unit": "cup",
            "totalCalories": 150,
            "totalProtein": 5,
            "preparationNotes": "Cook with water or milk"
          },
          {
            "name": "Greek Yogurt",
            "quantity": 1,
            "unit": "cup",
            "totalCalories": 100,
            "totalProtein": 17,
            "preparationNotes": "Plain, low-fat"
          }
        ]
      }
    ]
  },
  "summary": {
    "totalCalories": 1800,
    "totalProtein": 140,
    "mealsCount": 6
  },
  "hydrationSchedule": [
    {"time": "07:00", "amount": 0.25, "type": "Water"},
    {"time": "09:00", "amount": 0.25, "type": "Water"}
  ]
}
```

### 5. Get Weekly Meal Plan
**GET** `/api/nutrition/plan/{planId}/week/{weekNumber}`

### 6. Get Shopping List
**GET** `/api/nutrition/shopping-list/{planId}?weeks=1,2`

**Response:**
```json
{
  "weeks": [1, 2],
  "items": [
    {
      "name": "Chicken Breast",
      "quantity": 2.5,
      "unit": "kg",
      "brand": null
    },
    {
      "name": "Brown Rice",
      "quantity": 1,
      "unit": "kg",
      "brand": null
    }
  ],
  "totalItems": 15
}
```

### 7. Get Meal Prep Guide
**GET** `/api/nutrition/meal-prep/{planId}?week=1`

**Response:**
```json
{
  "week": 1,
  "prepDay": "Sunday",
  "estimatedTime": "2-3 hours",
  "steps": [
    "Shop for all ingredients",
    "Prep vegetables and fruits",
    "Cook proteins in batches"
  ],
  "batchCooking": {
    "proteins": ["Chicken Breast", "Salmon"],
    "grains": ["Brown Rice", "Quinoa"]
  }
}
```

---

## 🏋️‍♂️ Training Program Endpoints

### 1. Create Training Program (Coach Only)
**POST** `/api/training/program`

**Request:**
```json
{
  "name": "Beginner Strength Building",
  "description": "8-week program focused on building foundational strength",
  "difficulty": "beginner",
  "type": "strength",
  "durationWeeks": 8,
  "daysPerWeek": 3,
  "estimatedDurationMinutes": 60,
  "equipmentNeeded": ["barbell", "dumbbells", "bench"],
  "targetMuscles": ["chest", "back", "legs", "shoulders"],
  "isPublic": true,
  "price": 99.99,
  "currency": "USD"
}
```

**Response (Success - 201):**
```json
{
  "id": 1,
  "name": "Beginner Strength Building",
  "difficulty": "beginner",
  "type": "strength",
  "durationWeeks": 8,
  "daysPerWeek": 3,
  "estimatedDurationMinutes": 60,
  "rating": 0,
  "price": 99.99,
  "isPublic": true,
  "createdAt": "2025-08-25T10:30:00.000Z"
}
```

### 2. Get User's Training Programs
**GET** `/api/training/programs`

### 3. Get Coach's Programs (Coach Only)
**GET** `/api/training/coach/programs`

### 4. Get Public Programs 🌐
**GET** `/api/training/programs/public?type=strength&difficulty=beginner`

### 5. Get Training Program Details
**GET** `/api/training/program/{programId}`

**Response:**
```json
{
  "id": 1,
  "name": "Beginner Strength Building",
  "description": "8-week program focused on building foundational strength",
  "difficulty": "beginner",
  "type": "strength",
  "coach": {
    "id": 1,
    "user": {
      "firstName": "John",
      "lastName": "Trainer"
    }
  },
  "trainingDays": [
    {
      "id": 1,
      "dayNumber": 1,
      "weekNumber": 1,
      "name": "Upper Body Strength",
      "restDay": false,
      "estimatedDurationMinutes": 60,
      "focusAreas": ["chest", "back", "shoulders"],
      "exercises": [
        {
          "id": 1,
          "name": "Push-ups",
          "type": "strength",
          "sets": 3,
          "reps": 12,
          "restSeconds": 60,
          "instructions": "Keep body straight, lower chest to floor",
          "targetMuscles": ["chest", "triceps"],
          "media": []
        }
      ]
    }
  ]
}
```

### 6. Assign Program to User (Coach Only)
**PUT** `/api/training/program/{programId}/assign/{userId}`

### 7. Get Daily Workout
**GET** `/api/training/program/{programId}/day/{dayNumber}`

**Response:**
```json
{
  "day": {
    "id": 1,
    "dayNumber": 1,
    "name": "Upper Body Strength",
    "restDay": false,
    "estimatedDurationMinutes": 60,
    "focusAreas": ["chest", "back", "shoulders"],
    "warmUpInstructions": "5-10 minutes of light cardio followed by dynamic stretching",
    "coolDownInstructions": "5-10 minutes of static stretching and light walking"
  },
  "summary": {
    "exerciseCount": 6,
    "estimatedDuration": 60,
    "isRestDay": false
  },
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": 12,
      "restSeconds": 60,
      "instructions": "Keep body straight, lower chest to floor",
      "media": [
        {
          "title": "Proper Push-up Form",
          "publicUrl": "https://gym-app-media.s3.amazonaws.com/...",
          "type": "video"
        }
      ]
    }
  ]
}
```

### 8. Get Weekly Workout
**GET** `/api/training/program/{programId}/week/{weekNumber}`

### 9. Get User Progress
**GET** `/api/training/program/{programId}/progress/{userId}`

---

## 🔍 Search Endpoints

### 1. Search Coaches 🌐
**GET** `/api/search/coaches?query=strength&specialization=weight_training&minRating=4.0&maxRate=100`

**Response:**
```json
[
  {
    "id": 1,
    "bio": "Certified strength and conditioning specialist",
    "yearsOfExperience": 8,
    "hourlyRate": 75.00,
    "averageRating": 4.8,
    "totalReviews": 156,
    "isVerified": true,
    "user": {
      "firstName": "John",
      "lastName": "Trainer",
      "profilePicture": "https://..."
    },
    "specializations": [
      {"name": "Strength Training"},
      {"name": "Weight Loss"}
    ]
  }
]
```

### 2. Search Training Programs 🌐
**GET** `/api/search/programs?query=strength&type=muscle_gain&difficulty=intermediate&maxPrice=150`

### 3. Search Media Content 🌐
**GET** `/api/search/media?query=squat&category=exercise_demo&type=video`

### 4. Global Search 🌐
**GET** `/api/search/all?query=strength training`

**Response:**
```json
{
  "coaches": [
    {
      "id": 1,
      "user": {
        "firstName": "John",
        "lastName": "Trainer"
      },
      "averageRating": 4.8
    }
  ],
  "programs": [
    {
      "id": 1,
      "name": "Beginner Strength Building",
      "rating": 4.6
    }
  ],
  "media": [
    {
      "id": 1,
      "title": "Proper Squat Form",
      "viewCount": 245
    }
  ],
  "total": 8
}
```

---

## 👤 User Management Endpoints

### 1. Get User Profile
**GET** `/user/profile`

### 2. Update User Profile
**PUT** `/user/profile`

### 3. Get User Health Metrics
**GET** `/user/health-metrics`

### 4. Add Health Metrics
**POST** `/user/health-metrics`

---

## 🎯 Coach Management Endpoints

### 1. Get Coach Profile
**GET** `/coach/profile`

### 2. Update Coach Profile
**PUT** `/coach/profile`

### 3. Get Coach Clients
**GET** `/coach/clients`

### 4. Get Coach Statistics
**GET** `/coach/stats`

---

## 📊 Health & Metrics Endpoints

### 1. Get Health Overview
**GET** `/health/overview`

### 2. Add Fitness Goals
**POST** `/health/fitness-goals`

### 3. Update Medical History
**PUT** `/health/medical-history`

---

## 💳 Subscription Endpoints

### 1. Get Available Plans 🌐
**GET** `/subscription/plans`

### 2. Subscribe to Plan
**POST** `/subscription/subscribe`

### 3. Get User Subscriptions
**GET** `/subscription/user-subscriptions`

### 4. Cancel Subscription
**DELETE** `/subscription/{subscriptionId}`

---

## 📈 Analytics & Reporting

### 1. Get User Analytics
**GET** `/analytics/user-dashboard`

### 2. Get Coach Analytics
**GET** `/analytics/coach-dashboard`

### 3. Get Progress Reports
**GET** `/analytics/progress-report?period=monthly`

---

## Error Responses

All endpoints may return these common error responses:

**401 Unauthorized:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found",
  "statusCode": 404
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Mobile App Integration Notes

### File Upload Guidelines
- **Video files**: Max 100MB, formats: .mp4, .mov, .avi
- **Image files**: Max 10MB, formats: .jpg, .jpeg, .png
- **Thumbnails**: Recommended 16:9 aspect ratio, 1280x720px

### Rate Limiting
- **Authentication endpoints**: 5 requests per minute
- **File uploads**: 10 requests per hour
- **Search endpoints**: 100 requests per minute
- **Other endpoints**: 1000 requests per hour

### WebSocket Events (Real-time Features)
- **workout_started**: When user begins a workout
- **progress_updated**: When metrics are updated
- **coach_message**: Real-time coaching messages
- **plan_updated**: When nutrition/training plans are modified

---

*Last Updated: August 25, 2025*
*API Version: 2.0.0*
