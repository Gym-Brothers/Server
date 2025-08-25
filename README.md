# GYM Management System - Server

A comprehensive NestJS-based gym management system that connects coaches with users (subscribers) through a robust backend API with PostgreSQL database integration.

## 🚀 Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure login/logout system
- **Role-based Access Control**: Different permissions for coaches and users
- **Public Endpoints**: Registration, login, and basic information accessible without authentication
- **Protected Routes**: User profiles, subscriptions, and coach management require authentication

### User Management
- **Complete User Profiles**: Personal information, health metrics, and fitness goals
- **Health Tracking**: Comprehensive health data including medical history, physical metrics
- **Address Management**: Full address details for users
- **Emergency Contacts**: Safety information for gym members

### Coach Management
- **Coach Profiles**: Bio, experience, certifications, and specializations
- **Client Management**: Track current clients and maximum capacity
- **Rating System**: Average ratings and review counts
- **Availability Status**: Real-time availability tracking
- **Verification System**: Coach verification and certification tracking

### Subscription System
- **Multiple Subscription Types**: Basic, Premium, VIP, Personal Training
- **Status Management**: Active, Inactive, Pending, Expired, Cancelled
- **Coach-User Relationships**: Manage trainer-client relationships

## 🏗️ Architecture

### Tech Stack
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Security**: bcryptjs for password hashing

### Project Structure
```
src/
├── auth/                 # Authentication module
├── coach/               # Coach management
├── user/                # User management
├── subscription/        # Subscription handling
├── health/             # Health data management
├── entities/           # Database entities
├── dto/                # Data Transfer Objects
├── guards/             # Authentication guards
├── decorators/         # Custom decorators
├── migrations/         # Database migrations
└── models/             # Enums and interfaces
```

## 📊 Database Schema

### Core Entities
- **Users**: Complete user profiles with personal and health information
- **Coaches**: Coach profiles with certifications and specializations
- **Subscriptions**: Membership and trainer relationships
- **Health Metrics**: Physical measurements and health data
- **Medical History**: Health conditions and medical information
- **Fitness Goals**: User objectives and target achievements
- **Addresses**: Location information
- **Emergency Contacts**: Safety contact information

### Supported Enums
- **Gender**: Male, Female, Other
- **Activity Levels**: Sedentary to Extremely Active
- **Goal Types**: Weight Loss, Muscle Building, Strength Training, etc.
- **Subscription Types**: Basic, Premium, VIP, Personal Training
- **Blood Types**: All standard blood type classifications

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Yarn package manager

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd GYM/Server
```

2. **Install dependencies**
```bash
yarn install
```

3. **Environment Configuration**
Create a `.env` file with the following variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=gym_database
DB_SYNCHRONIZE=false
DB_LOGGING=true

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

4. **Database Setup**
```bash
# Run migrations
yarn migration:run

# Or sync schema (for development only)
yarn schema:sync
```

5. **Start the application**
```bash
# Development mode
yarn start:dev

# Production mode
yarn start:prod
```

## 🛠️ Available Scripts

- `yarn start:dev` - Start in development mode with hot reload
- `yarn start:prod` - Start in production mode
- `yarn build` - Build the application
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests
- `yarn migration:generate` - Generate new migration
- `yarn migration:run` - Run pending migrations
- `yarn migration:revert` - Revert last migration
- `yarn schema:sync` - Synchronize database schema (development only)

## 🔐 API Endpoints

### Public Endpoints (No Authentication Required)
```
POST /auth/login          # User login
POST /auth/register       # User registration
GET  /auth/profile        # Get current user profile
```

### Protected Endpoints (Authentication Required)

#### User Management
```
GET    /user/profile      # Get user profile
PUT    /user/profile      # Update user profile
DELETE /user/profile      # Delete user account
```

#### Coach Management
```
GET    /coach/profile     # Get coach profile
PUT    /coach/profile     # Update coach profile
GET    /coach/clients     # Get coach's clients
POST   /coach/verify      # Request coach verification
```

#### Subscription Management
```
GET    /subscription      # Get user subscriptions
POST   /subscription      # Create new subscription
PUT    /subscription/:id  # Update subscription
DELETE /subscription/:id  # Cancel subscription
```

#### Health Data
```
GET    /health/metrics    # Get health metrics
POST   /health/metrics    # Add health metrics
PUT    /health/metrics    # Update health metrics
GET    /health/goals      # Get fitness goals
POST   /health/goals      # Set fitness goals
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with configurable expiration
- **Role-based Guards**: Protect routes based on user roles
- **Input Validation**: Comprehensive request validation using class-validator
- **Public Decorator**: Mark endpoints as publicly accessible

## 📱 Mobile App Integration

This server is designed to support mobile applications for:
- **Coaches**: Manage clients, view subscriptions, update availability
- **Users/Subscribers**: Track health metrics, manage subscriptions, view coach information

### Key Integration Points
- Real-time coach availability
- Health data synchronization
- Subscription status updates
- Profile management
- Authentication token management

## 🗃️ Database Migrations

The application uses TypeORM migrations for database versioning:

```bash
# Generate a new migration
yarn migration:generate src/migrations/YourMigrationName

# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# End-to-end tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode
yarn test:watch
```

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexing
- **Pagination**: Implemented for large data sets
- **Lazy Loading**: Efficient entity relationships
- **Connection Pooling**: PostgreSQL connection management
- **Caching**: Ready for Redis integration

## 🚀 Deployment

### Production Checklist
- [ ] Set `DB_SYNCHRONIZE=false` in production
- [ ] Use strong JWT secrets
- [ ] Configure proper CORS settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure database connection pooling
- [ ] Set up monitoring and logging
- [ ] Run database migrations

### Environment Variables
Ensure all required environment variables are properly configured in your production environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using NestJS, TypeORM, and PostgreSQL**

