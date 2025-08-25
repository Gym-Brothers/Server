# PostgreSQL Database Setup Guide

## Prerequisites
1. Install PostgreSQL on your system
2. Create a database for the application
3. Configure environment variables

## Database Setup Steps

### 1. Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Download and install from https://www.postgresql.org/download/windows/
```

### 2. Create Database and User
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE gym_fitness_db;

-- Create user (optional, you can use postgres user)
CREATE USER gym_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gym_fitness_db TO gym_user;

-- Exit psql
\q
```

### 3. Update Environment Variables
Update `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres  # or gym_user
DB_PASSWORD=your_password
DB_NAME=gym_fitness_db
DB_SYNCHRONIZE=true    # Set to false in production
DB_LOGGING=true        # Set to false in production
```

### 4. Run Database Migrations
```bash
# Build the application first
yarn build

# Run migrations to create all tables
yarn migration:run

# Or use schema sync for development (not recommended for production)
yarn schema:sync
```

## Database Schema Overview

### Core Tables Created:
1. **users** - Main user profiles with personal information
2. **addresses** - User addresses (multiple per user)
3. **emergency_contacts** - Emergency contact information
4. **health_metrics** - Weight, height, BMI, body measurements
5. **medical_history** - Medical information, allergies, medications
6. **fitness_goals** - User fitness objectives and targets
7. **coaches** - Coach profiles and professional information
8. **coach_certifications** - Coach certifications and credentials
9. **coach_specializations** - Coach areas of expertise
10. **subscriptions** - Coach-client subscription relationships

### Key Features:
- **Comprehensive Health Tracking**: Complete medical and fitness data
- **Coach-Client Relationships**: Subscription management system
- **Address Management**: Multiple addresses per user
- **Emergency Contacts**: Safety and emergency information
- **Professional Verification**: Coach certification tracking
- **Flexible Subscription Types**: Basic, Premium, VIP tiers

## Development Commands

```bash
# Database Migration Commands
yarn migration:generate  # Generate new migration from entity changes
yarn migration:create    # Create empty migration file
yarn migration:run       # Run pending migrations
yarn migration:revert    # Revert last migration

# Schema Commands (Development Only)
yarn schema:sync         # Sync database schema with entities
yarn schema:drop         # Drop entire database schema
```

## Production Considerations

1. **Set DB_SYNCHRONIZE=false** in production
2. **Use migrations** instead of schema sync
3. **Set DB_LOGGING=false** for performance
4. **Use connection pooling** for high traffic
5. **Implement database backups**
6. **Use environment-specific configurations**

## Health Check
To verify database connection:
```bash
# Start the application
yarn start:dev

# Check logs for successful database connection
# Should see: "Database connected successfully"
