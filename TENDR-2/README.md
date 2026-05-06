# Tendr - Event Service Marketplace API

A comprehensive Node.js backend API for an event service marketplace platform, built with Express.js and MongoDB. Tendr connects customers with event service vendors through a complete booking lifecycle with advanced features like real-time communication, payment processing, vendor penalties, and analytics.

## 🚀 Features

### 🔐 **Authentication & Authorization**
- **Multi-User Types**: Individual Consumers, Corporate Consumers, Vendors, Admins
- **JWT-based Authentication**: Secure token-based authentication with refresh tokens
- **Phone Verification**: OTP verification for phone numbers using Redis
- **Role-based Access Control**: Granular permissions for different user types
- **Password Security**: Bcrypt hashing with salt rounds

### 🏢 **Vendor Management**
- **Complete Profile System**: Detailed vendor profiles with service types, experience, pricing
- **Advanced Search**: Location-based, service-type, rating, and experience filtering
- **Image Management**: Cloudinary integration for profile and portfolio images
- **Availability Management**: Time slot management and booking calendar
- **Performance Tracking**: Analytics and performance metrics
- **Penalty System**: Automatic penalties for frequent cancellations

### 👥 **Consumer Management**
- **Individual Consumers**: Personal event booking and management
- **Corporate Consumers**: Business clients with subscription plans
- **Profile Management**: Complete profile with address and preferences
- **Booking History**: Comprehensive booking tracking and management
- **Review System**: Multi-category rating and review system

### 📅 **Complete Booking Flow**
```
Request → Conversation → Offer → Payment → Booking → Cancellation/Refund → Penalty/Notification/Audit
```

- **Service Requests**: Customers create detailed service requests
- **Vendor Matching**: Intelligent vendor matching based on requirements
- **Conversation System**: Real-time messaging between customers and vendors
- **Offer Management**: Detailed pricing and service breakdowns
- **Booking Confirmation**: Secure booking with payment verification
- **Cancellation & Refunds**: Policy-based cancellation with automatic refunds
- **Vendor Penalties**: Progressive penalty system for frequent cancellations

### 💳 **Payment Processing**
- **Razorpay Integration**: Secure payment gateway with multiple payment methods
- **Order Management**: Complete order creation and verification
- **Refund Processing**: Automatic refund calculation and processing
- **Payment Tracking**: Comprehensive payment status tracking
- **Multiple Payment Types**: Booking payments, subscriptions, add-ons

### 📊 **Analytics & Reporting**
- **Platform Analytics**: Comprehensive platform-wide metrics
- **Vendor Analytics**: Performance tracking and insights
- **User Analytics**: Consumer behavior and engagement metrics
- **Revenue Tracking**: Detailed revenue and commission tracking
- **Export Capabilities**: Data export for reporting and analysis

### 🔔 **Notification System**
- **Multi-channel Notifications**: Email, SMS, and Push notifications
- **Event-driven**: Real-time notifications based on system events
- **Customizable Templates**: Dynamic notification templates
- **Delivery Tracking**: Notification delivery status tracking

### 💬 **Real-time Communication**
- **Socket.IO Integration**: Real-time messaging and updates
- **Conversation Management**: Organized conversation threads
- **Message History**: Complete message history and archiving
- **Read Receipts**: Message read status tracking

### 🛡️ **Security & Performance**
- **Rate Limiting**: Global rate limiting (100 requests per IP per 15 minutes)
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Robust error handling and logging
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet Security**: Security headers and protection
- **Redis Caching**: Performance optimization with Redis caching

### 🏢 **Corporate Features**
- **Subscription Management**: Corporate subscription plans
- **Event Management**: Large-scale event planning and management
- **Bulk Booking**: Multiple service bookings for corporate events
- **Priority Support**: Dedicated support for corporate clients
- **Custom Branding**: White-label solutions for corporate clients

## 🏗️ Architecture

### **Service-Oriented Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │   Middleware    │    │   Services      │
│                 │    │                 │    │                 │
│ • Authentication│    │ • Auth          │    │ • PolicyEngine  │
│ • Vendors       │    │ • Validation    │    │ • EventBus      │
│ • Consumers     │    │ • Rate Limiting │    │ • Payment       │
│ • Bookings      │    │ • Error Handling│    │ • Booking       │
│ • Payments      │    │ • Security      │    │ • Notification  │
│ • Reviews       │    │ • Logging       │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │                 │
                    │ • MongoDB       │
                    │ • Redis         │
                    │ • Cloudinary    │
                    └─────────────────┘
```

### **Event-Driven Architecture**
- **Centralized Event Bus**: All system events managed through EventBus
- **Loose Coupling**: Services communicate through events
- **Scalable Design**: Easy to add new event handlers
- **Error Recovery**: Robust error handling in event processing

### **Database Design**
- **MongoDB**: Primary database with Mongoose ODM
- **Redis**: Caching, sessions, and OTP storage
- **Cloudinary**: Image and media storage
- **Optimized Indexes**: Performance-optimized database indexes

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6 or higher)
- **Cloudinary Account** (for image storage)
- **Razorpay Account** (for payments)
- **Twilio Account** (for SMS notifications)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/tendr-backend.git
cd tendr-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tendr
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
FROM_EMAIL=noreply@tendr.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://tendr.com
```

### 4. Database Setup
```bash
# Start MongoDB (if not running)
mongod

# Start Redis (if not running)
redis-server
```

### 5. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 🏃‍♂️ Development

### Available Scripts
```bash
# Development with hot-reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Development Workflow
1. **Feature Development**: Create feature branches from `develop`
2. **Testing**: Write tests for new features
3. **Code Review**: Submit pull requests for review
4. **Integration**: Merge to `develop` after approval
5. **Deployment**: Deploy from `main` branch

## 🏭 Production

### Environment Setup
```bash
# Set production environment
NODE_ENV=production

# Use production database
MONGODB_URI=mongodb://production-db:27017/tendr

# Configure production Redis
REDIS_URL=redis://production-redis:6379

# Set production secrets
JWT_SECRET=production_jwt_secret
JWT_REFRESH_SECRET=production_refresh_secret
```

### Deployment
```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t tendr-backend .

# Run container
docker run -p 3000:3000 --env-file .env tendr-backend
```

## 📁 Project Structure

```
tendr-backend/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── index.js           # Main configuration
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── redis.js           # Redis configuration
│   │
│   ├── constants/             # Application constants
│   │   └── index.js           # All constants and enums
│   │
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   ├── validator.js       # Request validation
│   │   ├── errorHandler.js    # Error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   ├── security.js        # Security headers
│   │   └── logger.js          # Logging middleware
│   │
│   ├── models/                # Database models
│   │   ├── index.js           # Model exports
│   │   ├── IndividualConsumer.js
│   │   ├── CorporateConsumer.js
│   │   ├── Vendor.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── Request.js
│   │   ├── Offer.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Cancellation.js
│   │   ├── VendorPenalty.js
│   │   ├── CorporateSubscription.js
│   │   ├── CorporateEvent.js
│   │   └── VendorBankDetails.js
│   │
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── vendor.js          # Vendor routes
│   │   ├── consumer.js        # Consumer routes
│   │   ├── corporate.js       # Corporate routes
│   │   ├── booking.js         # Booking routes
│   │   ├── payment.js         # Payment routes
│   │   ├── review.js          # Review routes
│   │   ├── request.js         # Request routes
│   │   ├── offer.js           # Offer routes
│   │   ├── conversation.js    # Conversation routes
│   │   ├── message.js         # Message routes
│   │   ├── cancellation.js    # Cancellation routes
│   │   ├── analytics.js       # Analytics routes
│   │   └── admin.js           # Admin routes
│   │
│   ├── services/              # Business logic
│   │   ├── policyEngine.js    # Business rules engine
│   │   ├── eventBus.js        # Event management
│   │   ├── payment.js         # Payment processing
│   │   ├── booking.js         # Booking management
│   │   ├── notificationService.js # Notification system
│   │   ├── vendorPenaltyService.js # Penalty management
│   │   ├── reviewService.js   # Review management
│   │   ├── commissionService.js # Commission handling
│   │   ├── accountService.js  # Account management
│   │   ├── ratingService.js   # Rating management
│   │   ├── cancellationService.js # Cancellation handling
│   │   ├── corporateEvent.js  # Corporate event management
│   │   ├── corporateSubscription.js # Subscription management
│   │   ├── vendor.js          # Vendor management
│   │   ├── analytics.js       # Analytics processing
│   │   ├── otp.js             # OTP management
│   │   ├── vendorBankDetails.js # Bank details management
│   │   └── auditLogger.js     # Audit logging
│   │
│   ├── utils/                 # Utility functions
│   │   ├── index.js           # Utility exports
│   │   ├── email.js           # Email utilities
│   │   ├── sms.js             # SMS utilities
│   │   ├── push.js            # Push notification utilities
│   │   ├── response.js        # Response formatting
│   │   ├── pagination.js      # Pagination helpers
│   │   ├── date.js            # Date utilities
│   │   ├── location.js        # Location utilities
│   │   ├── cache.js           # Caching utilities
│   │   └── analyticsHelpers.js # Analytics helpers
│   │
│   ├── sockets/               # WebSocket handlers
│   │   └── chat.socket.js     # Real-time messaging
│   │
│   ├── db.js                  # Database connection
│   └── index.js               # Application entry point
│
├── test/                      # Test files
├── logs/                      # Application logs
├── archive/                   # Documentation archive
├── .env.example              # Environment variables example
├── .gitignore                # Git ignore file
├── package.json              # Dependencies and scripts
├── README.md                 # This file
└── API.md                    # API documentation
```

## 📚 Dependencies

### Core Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting
- **express-validator** - Request validation

### Storage & Media
- **redis** - Caching and session management
- **cloudinary** - Image storage and management
- **multer** - File upload handling

### Payment & Communication
- **razorpay** - Payment processing
- **socket.io** - Real-time communication
- **twilio** - SMS notifications (optional)

### Development Dependencies
- **nodemon** - Development server
- **jest** - Testing framework
- **supertest** - HTTP assertions
- **eslint** - Code linting
- **prettier** - Code formatting

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=payment.test.js

# Run tests in watch mode
npm test -- --watch
```

### Test Structure
```
test/
├── unit/                     # Unit tests
│   ├── services/            # Service tests
│   ├── models/              # Model tests
│   └── utils/               # Utility tests
├── integration/             # Integration tests
│   ├── routes/              # Route tests
│   └── api/                 # API tests
└── fixtures/                # Test data
```

## 🔒 Security

### Security Features
- **Rate Limiting**: 100 requests per IP per 15 minutes
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error handling without information leakage
- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Management**: Secure token management with refresh tokens
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Protection**: Input sanitization and validation

### Rate Limiting Details
All API endpoints are protected by a global rate limiter:
- **Configuration**: See `src/constants/index.js` (`RATE_LIMITS`)
- **HTTP Status Code**: 429 Too Many Requests
- **Error Response**:
  ```json
  {
    "status": "error",
    "message": "Too many requests, please try again later."
  }
  ```
- **Headers**: `Retry-After` indicates seconds until the limit resets

## 📊 Monitoring & Logging

### Logging
- **Request Logging**: All HTTP requests logged with Morgan
- **Error Logging**: Comprehensive error logging and tracking
- **Audit Logging**: System events and user actions logged
- **Performance Logging**: Response times and performance metrics

### Monitoring
- **Health Checks**: Application health monitoring
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Error rates and types
- **Database Monitoring**: Connection status and performance

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database connections (MongoDB, Redis)
- API keys (Cloudinary, Razorpay, Twilio)
- JWT secrets
- Rate limiting configuration
- CORS settings

### Performance Optimization
- **Database Indexing**: Optimized MongoDB indexes
- **Redis Caching**: Response caching and session storage
- **Connection Pooling**: Database connection optimization
- **Compression**: Response compression for better performance

### Scaling Considerations
- **Horizontal Scaling**: Stateless application design
- **Load Balancing**: Multiple server instances
- **Database Scaling**: MongoDB replica sets
- **Cache Scaling**: Redis clustering

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Set up environment variables
5. Run tests (`npm test`)
6. Make your changes
7. Add tests for new features
8. Ensure all tests pass
9. Commit your changes (`git commit -m 'Add amazing feature'`)
10. Push to the branch (`git push origin feature/amazing-feature`)
11. Open a Pull Request

### Code Standards
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Testing**: Write tests for new features
- **Documentation**: Update documentation for API changes
- **Commit Messages**: Use conventional commit messages

### Pull Request Process
1. **Description**: Clear description of changes
2. **Testing**: All tests must pass
3. **Documentation**: Update relevant documentation
4. **Code Review**: At least one approval required
5. **Merge**: Merge to develop branch

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: [API Documentation](API.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/tendr-backend/issues)
- **Email**: support@tendr.com
- **Discord**: [Tendr Community](https://discord.gg/tendr)

### Reporting Bugs
When reporting bugs, please include:
- **Environment**: Node.js version, OS, database versions
- **Steps**: Detailed steps to reproduce the issue
- **Expected vs Actual**: What you expected vs what happened
- **Logs**: Relevant error logs and stack traces
- **Screenshots**: If applicable

### Feature Requests
For feature requests:
- **Use Case**: Describe the use case and problem
- **Proposed Solution**: Suggest a solution approach
- **Priority**: Indicate priority level
- **Mockups**: If applicable, include mockups or examples

## 🎯 Roadmap

### Upcoming Features
- **AI-Powered Matching**: Intelligent vendor-customer matching
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native mobile applications
- **Multi-language Support**: Internationalization
- **Advanced Payment Options**: More payment gateways
- **Real-time Tracking**: Live service tracking
- **Advanced Notifications**: Push notifications and in-app messaging

### Performance Improvements
- **GraphQL API**: GraphQL implementation for flexible queries
- **Microservices**: Service decomposition for better scalability
- **Event Sourcing**: Event-driven architecture improvements
- **Caching Strategy**: Advanced caching strategies

---

**Built with ❤️ by the Tendr Team** 