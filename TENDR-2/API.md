# Tendr - Event Service Marketplace API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL & Headers](#base-url--headers)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Authentication](#authentication)
- [Individual Consumers](#individual-consumers)
- [Corporate Consumers](#corporate-consumers)
- [Vendors](#vendors)
- [Requests](#requests)
- [Conversations](#conversations)
- [Offers](#offers)
- [Bookings](#bookings)
- [Payments](#payments)
- [Cancellations](#cancellations)
- [Reviews](#reviews)
- [Messages](#messages)
- [Timelines](#timelines)
- [Checklists](#checklists)
- [Corporate Subscriptions](#corporate-subscriptions)
- [Corporate Events](#corporate-events)
- [Analytics](#analytics)
- [Admin](#admin)
- [Invoices](#invoices)

## Overview

Tendr is a comprehensive event service marketplace API that connects customers with event service vendors. The platform supports both individual consumers and corporate clients, with advanced booking, payment, and review systems.

### Key Features
- **Multi-User Types**: Individual Consumers, Corporate Consumers, Vendors, Admins
- **Complete Booking Flow**: Request → Conversation → Offer → Payment → Booking → Cancellation/Refund
- **Advanced Payment System**: Razorpay integration with refund processing
- **Vendor Penalty System**: Automatic penalties for frequent cancellations
- **Review & Rating System**: Comprehensive review management
- **Real-time Communication**: Socket.IO for live messaging
- **Timeline Management**: Create and manage event timelines with chronological tasks
- **Checklist Management**: Create and manage event checklists with task tracking
- **Analytics**: Platform-wide and user-specific analytics
- **Corporate Management**: Subscription and event management for corporate clients

## Base URL & Headers

### Base URL
```
Development: http://localhost:3000
Production: https://api.tendr.com
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

## Error Handling

All endpoints return consistent error responses with enhanced error details for gift hamper and cake functionality:

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Business Logic Error Response Format
```json
{
  "status": "error",
  "message": "Detailed error message",
  "errorCode": "SPECIFIC_ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Validation Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Invalid phone number format",
      "value": "invalid_phone",
      "kind": "format"
    },
    {
      "field": "pricing.basePrice",
      "message": "Base price must be a positive number",
      "value": -100,
      "kind": "min"
    }
  ],
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, business logic errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate entries)
- `413` - Payload Too Large (file size exceeded)
- `422` - Unprocessable Entity (image upload failures)
- `429` - Too Many Requests (rate limiting, product limits)
- `500` - Internal Server Error

### 🆕 Gift Hamper & Cake Specific Error Codes

#### Vendor Registration Errors
- `PHONE_NOT_VERIFIED` - Phone number must be verified before registration
- `DUPLICATE_PHONE_NUMBER` - Phone number already registered
- `DUPLICATE_GST_NUMBER` - GST number already registered
- `DUPLICATE_PAN_NUMBER` - PAN number already registered

#### Vendor Status Errors
- `VENDOR_NOT_APPROVED` - Vendor account pending approval
- `VENDOR_SUSPENDED` - Vendor account suspended
- `VENDOR_NOT_ACTIVE` - Vendor account not active

#### Product Management Errors
- `PRODUCT_NOT_FOUND` - Product not found or removed
- `PRODUCT_NOT_AVAILABLE` - Product not currently available
- `PRODUCT_LIMIT_EXCEEDED` - Maximum product limit reached
- `INVALID_VENDOR_PRODUCT_ASSOCIATION` - Vendor doesn't own the product
- `INVALID_PRODUCT_TYPE_FOR_VENDOR` - Product type doesn't match vendor type
- `INVALID_STATUS_TRANSITION` - Invalid product status change

#### Image Upload Errors
- `IMAGE_UPLOAD_FAILED` - Image upload failed
- `IMAGE_LIMIT_EXCEEDED` - Maximum image limit exceeded (10 per product)

#### Location Errors
- `INVALID_LOCATION` - Unsupported city or location

### Error Response Examples

#### Vendor Not Approved Error
```json
{
  "status": "error",
  "message": "Only approved vendors can create products. Please wait for account approval or contact support.",
  "errorCode": "VENDOR_NOT_APPROVED",
  "statusCode": 403,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Product Limit Exceeded Error
```json
{
  "status": "error",
  "message": "Product limit exceeded. Your current plan allows up to 50 active products. Consider upgrading your plan or removing inactive products.",
  "errorCode": "PRODUCT_LIMIT_EXCEEDED",
  "statusCode": 429,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Duplicate Registration Error
```json
{
  "status": "error",
  "message": "A vendor account already exists with phone number 9876543210. Please use a different phone number or contact support if this is your account.",
  "errorCode": "DUPLICATE_PHONE_NUMBER",
  "statusCode": 409,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Field Validation Error
```json
{
  "status": "error",
  "message": "Validation Error",
  "errors": [
    {
      "field": "deliveryAreas",
      "message": "Required when panIndiaDelivery is false",
      "value": null
    }
  ],
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### File Upload Error
```json
{
  "success": false,
  "message": "File size too large. Maximum size allowed is 10MB per file.",
  "errors": [
    {
      "field": "file",
      "message": "File size exceeds limit",
      "kind": "file_size_error"
    }
  ],
  "statusCode": 413,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Handling Best Practices

1. **Always check the `success` field** in API responses
2. **Use `errorCode` for programmatic error handling** instead of parsing error messages
3. **Display user-friendly messages** from the `message` field
4. **Handle validation errors** by showing field-specific error messages
5. **Implement retry logic** for 5xx errors and network failures
6. **Log error details** including `errorCode` and `timestamp` for debugging

## Rate Limiting

All endpoints are protected by rate limiting:
- **Limit**: 100 requests per IP per 15 minutes
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Status**: 429 Too Many Requests when exceeded

## Authentication

### JWT Token Structure
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### Authentication Endpoints

#### Register Individual Consumer
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+919876543210",
  "password": "securePassword123",
  "address": {
    "street": "123 Main St",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201301"
  }
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "role": "individual_consumer"
  },
  "token": "jwt_token"
}
```

#### Register Corporate Consumer
```http
POST /auth/corporate/register
```

**Request Body:**
```json
{
  "companyName": "Tech Corp",
  "email": "contact@techcorp.com",
  "phoneNumber": "+919876543210",
  "password": "securePassword123",
  "address": {
    "street": "456 Business Ave",
    "city": "Gurugram",
    "state": "Haryana",
    "pincode": "122001"
  },
  "contactPerson": "Jane Smith",
  "businessType": "Technology"
}
```

#### Register Vendor
```http
POST /auth/vendor/register
```

**Request Body:**
```json
{
  "name": "Event Pro Services",
  "email": "contact@eventpro.com",
  "phoneNumber": "+919876543210",
  "password": "securePassword123",
  "address": {
    "street": "789 Service Rd",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "serviceTypes": ["DJ", "Photographer"],
  "experience": 5,
  "description": "Professional event services"
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Headers:**
```http
Authorization: Bearer <refresh_token>
```

## Individual Consumers

### Get Profile
```http
GET /consumers/profile
```

### Update Profile
```http
PATCH /consumers/profile
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "address": {
    "street": "New Address",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201301"
  }
}
```

### Get Reviewable Bookings
```http
GET /consumers/reviewable-bookings
```

## Corporate Consumers

### Get Corporate Profile
```http
GET /corporate/profile
```

### Update Corporate Profile
```http
PATCH /corporate/profile
```

### Get Corporate Subscriptions
```http
GET /corporate/subscriptions
```

### Get Corporate Events
```http
GET /corporate/events
```

## Vendors

### Get All Vendors (Search)
```http
GET /vendors
```

**Query Parameters:**
- `location` (string) - City name
- `serviceTypes` (string) - Comma-separated service types
- `minExperience` (number) - Minimum years of experience
- `minRating` (number) - Minimum rating
- `sortBy` (string) - Sort field (rating, experience, price)
- `sortOrder` (string) - asc or desc
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10)

**Example:**
```http
GET /vendors?location=Noida&serviceTypes=DJ,Photographer&minRating=4&sortBy=rating&page=1&limit=10
```

### Get Vendor Details
```http
GET /vendors/:vendorId
```

### Create Vendor Profile
```http
POST /vendors
```

**Request Body:**
```json
{
  "name": "Event Pro Services",
  "email": "contact@eventpro.com",
  "phoneNumber": "+919876543210",
  "address": {
    "street": "789 Service Rd",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "serviceTypes": ["DJ", "Photographer"],
  "experience": 5,
  "description": "Professional event services",
  "pricing": {
    "DJ": 5000,
    "Photographer": 8000
  },
  "availability": {
    "monday": ["09:00-18:00"],
    "tuesday": ["09:00-18:00"],
    "wednesday": ["09:00-18:00"],
    "thursday": ["09:00-18:00"],
    "friday": ["09:00-18:00"],
    "saturday": ["09:00-18:00"],
    "sunday": ["09:00-18:00"]
  }
}
```

### 🆕 Register Gift Hamper Vendor
```http
POST /vendors/gift-hamper
```

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Sweet Delights Gift Hampers",
  "gstNumber": "27ABCDE1234F1Z5",
  "teamSize": 5,
  "locations": ["Delhi", "Noida", "Gurugram"],
  "phoneNumber": "9876543210",
  "address": {
    "street": "123 Business Park",
    "city": "Delhi",
    "state": "Delhi"
  },
  "yearsOfExperience": 3,
  "panNumber": "ABCDE1234F",
  "password": "securePassword123",
  "deliveryOptions": ["Delivery Only", "Both"],
  "panIndiaDelivery": false,
  "deliveryAreas": ["Delhi", "Noida", "Gurugram", "Faridabad"],
  "maxDeliveryCapacity": 50,
  "deliveryTimeRange": {
    "min": 1,
    "max": 3
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Gift hamper vendor registered successfully. Your account is pending approval.",
  "data": {
    "vendor": {
      "_id": "vendor_id",
      "name": "Sweet Delights Gift Hampers",
      "serviceType": "GiftHamper",
      "status": "pending_approval",
      "phoneNumber": "9876543210",
      "locations": ["Delhi", "Noida", "Gurugram"],
      "deliveryOptions": ["Delivery Only", "Both"],
      "panIndiaDelivery": false,
      "deliveryAreas": ["Delhi", "Noida", "Gurugram", "Faridabad"],
      "maxDeliveryCapacity": 50,
      "deliveryTimeRange": {
        "min": 1,
        "max": 3
      }
    },
    "nextSteps": [
      "Your account will be reviewed within 24-48 hours",
      "You will receive a notification once approved",
      "After approval, you can start adding products and managing your profile"
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
```json
// 400 - Phone not verified
{
  "status": "error",
  "message": "Phone number not verified. Please verify before registration.",
  "errorCode": "PHONE_NOT_VERIFIED",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// 409 - Duplicate registration
{
  "status": "error",
  "message": "A vendor account already exists with phone number 9876543210. Please use a different phone number or contact support if this is your account.",
  "errorCode": "DUPLICATE_PHONE_NUMBER",
  "statusCode": 409,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 🆕 Register Cake Vendor
```http
POST /vendors/cake
```

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Artisan Cake Studio",
  "gstNumber": "27FGHIJ5678K1L2",
  "teamSize": 3,
  "locations": ["Mumbai", "Pune"],
  "phoneNumber": "9876543211",
  "address": {
    "street": "456 Baker Street",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "yearsOfExperience": 5,
  "panNumber": "FGHIJ5678K",
  "password": "securePassword456",
  "availableSizes": ["0.5kg", "1kg", "1.5kg", "2kg"],
  "customFlavors": ["Chocolate", "Vanilla", "Red Velvet", "Black Forest"],
  "pricesNegotiable": true,
  "deliveryOptions": ["Both"],
  "pickupAddress": "456 Baker Street, Mumbai, Maharashtra"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Cake vendor registered successfully. Your account is pending approval.",
  "data": {
    "vendor": {
      "_id": "vendor_id",
      "name": "Artisan Cake Studio",
      "serviceType": "Cake",
      "status": "pending_approval",
      "phoneNumber": "9876543211",
      "locations": ["Mumbai", "Pune"],
      "availableSizes": ["0.5kg", "1kg", "1.5kg", "2kg"],
      "customFlavors": ["Chocolate", "Vanilla", "Red Velvet", "Black Forest"],
      "pricesNegotiable": true,
      "deliveryOptions": ["Both"],
      "pickupAddress": "456 Baker Street, Mumbai, Maharashtra"
    },
    "nextSteps": [
      "Your account will be reviewed within 24-48 hours",
      "You will receive a notification once approved",
      "After approval, you can start adding products and managing your profile",
      "Consider uploading portfolio photos to showcase your cake designs"
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Update Vendor Profile
```http
PATCH /vendors/:vendorId
```

### Upload Vendor Images
```http
POST /vendors/:vendorId/images
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `images` - Array of image files
- `type` - Image type (profile, portfolio, gallery)

### 🆕 Get Vendor's Products
```http
GET /vendors/:vendorId/products
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10)
- `status` (string) - Product status filter (active, inactive, pending_approval)
- `productType` (string) - GiftHamper or Cake
- `category` (string) - Product category
- `sortBy` (string) - Sort field (createdAt, price, name)
- `sortOrder` (string) - asc or desc

**Response:**
```json
{
  "products": [
    {
      "_id": "product_id",
      "name": "Premium Chocolate Hamper",
      "productType": "GiftHamper",
      "category": "Chocolates",
      "pricing": {
        "basePrice": 2500,
        "discountedPrice": 2200,
        "isNegotiable": false
      },
      "status": "active",
      "images": [
        {
          "url": "https://cloudinary.com/image1.jpg",
          "order": 1
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 45,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "success": true
}
```

### Get Vendor Analytics
```http
GET /vendors/:vendorId/analytics
```

**Query Parameters:**
- `timeframe` (string) - day, week, month, year

## 🆕 Products (Gift Hampers & Cakes)

### Create Product
```http
POST /products
```

**Headers:**
```http
Authorization: Bearer <vendor_jwt_token>
Content-Type: application/json
```

**Request Body (Gift Hamper):**
```json
{
  "name": "Premium Dry Fruits Hamper",
  "description": "A luxurious collection of premium dry fruits including almonds, cashews, dates, and pistachios, beautifully packaged in an elegant gift box.",
  "productType": "GiftHamper",
  "category": "Dry Fruits",
  "pricing": {
    "basePrice": 3500,
    "discountedPrice": 3200,
    "isNegotiable": false
  },
  "deliveryInfo": {
    "options": ["Delivery Only"],
    "timeRange": {
      "min": 1,
      "max": 2
    },
    "areas": ["Delhi", "Noida", "Gurugram"]
  },
  "hamperDetails": {
    "contents": ["Almonds (200g)", "Cashews (200g)", "Dates (150g)", "Pistachios (100g)"],
    "category": "Dry Fruits",
    "weight": 650,
    "packaging": "Box"
  }
}
```

**Request Body (Cake):**
```json
{
  "name": "Custom Birthday Cake",
  "description": "Delicious custom birthday cake with your choice of flavor, design, and personalized message. Perfect for making birthdays special.",
  "productType": "Cake",
  "category": "Birthday",
  "pricing": {
    "basePrice": 1500,
    "isNegotiable": true
  },
  "deliveryInfo": {
    "options": ["Both"],
    "timeRange": {
      "min": 2,
      "max": 5
    }
  },
  "cakeDetails": {
    "availableSizes": ["1kg", "1.5kg", "2kg"],
    "flavors": ["Chocolate", "Vanilla", "Red Velvet", "Butterscotch"],
    "customizationAvailable": true,
    "eggless": true,
    "sugarFree": false
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "product_id",
      "vendorId": {
        "_id": "vendor_id",
        "name": "Sweet Delights",
        "serviceType": "GiftHamper"
      },
      "name": "Premium Dry Fruits Hamper",
      "description": "A luxurious collection of premium dry fruits...",
      "productType": "GiftHamper",
      "category": "Dry Fruits",
      "pricing": {
        "basePrice": 3500,
        "discountedPrice": 3200,
        "isNegotiable": false
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tips": "Consider adding high-quality images showcasing different hamper categories and contents."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
```json
// 403 - Vendor not approved
{
  "status": "error",
  "message": "Only approved vendors can create products. Please wait for account approval or contact support.",
  "errorCode": "VENDOR_NOT_APPROVED",
  "statusCode": 403,
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// 429 - Product limit exceeded
{
  "status": "error",
  "message": "Product limit exceeded. Your current plan allows up to 50 active products. Consider upgrading your plan or removing inactive products.",
  "errorCode": "PRODUCT_LIMIT_EXCEEDED",
  "statusCode": 429,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Product Details
```http
GET /products/:productId
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "product_id",
      "vendorId": {
        "_id": "vendor_id",
        "name": "Sweet Delights",
        "address": {
          "street": "123 Business Park",
          "city": "Delhi",
          "state": "Delhi"
        },
        "phoneNumber": "9876543210",
        "avgReviewScore": 4.5,
        "serviceType": "GiftHamper"
      },
      "name": "Premium Dry Fruits Hamper",
      "description": "A luxurious collection...",
      "productType": "GiftHamper",
      "category": "Dry Fruits",
      "images": [
        {
          "url": "https://cloudinary.com/image1.jpg",
          "order": 1
        }
      ],
      "pricing": {
        "basePrice": 3500,
        "discountedPrice": 3200,
        "isNegotiable": false
      },
      "deliveryInfo": {
        "options": ["Delivery Only"],
        "timeRange": {
          "min": 1,
          "max": 2
        },
        "areas": ["Delhi", "Noida", "Gurugram"]
      },
      "hamperDetails": {
        "contents": ["Almonds (200g)", "Cashews (200g)", "Dates (150g)", "Pistachios (100g)"],
        "weight": 650,
        "packaging": "Box"
      },
      "status": "active",
      "viewCount": 125,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "isOwner": false,
    "relatedInfo": {
      "canEdit": false,
      "canDelete": false,
      "vendorContact": {
        "name": "Sweet Delights",
        "phoneNumber": "9876543210",
        "avgRating": 4.5
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Update Product
```http
PUT /products/:productId
```

**Headers:**
```http
Authorization: Bearer <vendor_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Premium Dry Fruits Hamper",
  "pricing": {
    "basePrice": 3800,
    "discountedPrice": 3500,
    "isNegotiable": false
  },
  "status": "active"
}
```

### Delete Product (Soft Delete)
```http
DELETE /products/:productId
```

**Headers:**
```http
Authorization: Bearer <vendor_jwt_token>
```

### Search Products by Location
```http
GET /products/locations/:city/products
```

**Path Parameters:**
- `city` (string) - Supported city name (Delhi, Mumbai, Bangalore, etc.)

**Query Parameters:**
- `productType` (string) - GiftHamper or Cake
- `category` (string) - Product category
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 20, max: 50)

**Example:**
```http
GET /products/locations/Delhi/products?productType=GiftHamper&category=Chocolates&page=1&limit=10
```

**Response:**
```json
{
  "city": "Delhi",
  "products": [
    {
      "_id": "product_id",
      "name": "Premium Chocolate Hamper",
      "productType": "GiftHamper",
      "category": "Chocolates",
      "pricing": {
        "basePrice": 2500,
        "discountedPrice": 2200
      },
      "images": [
        {
          "url": "https://cloudinary.com/image1.jpg",
          "order": 1
        }
      ],
      "vendorId": {
        "name": "Sweet Delights",
        "avgReviewScore": 4.5
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalProducts": 25,
    "limit": 10
  },
  "filters": {
    "productType": "GiftHamper",
    "category": "Chocolates"
  },
  "success": true
}
```

### Advanced Product Search
```http
GET /products/search
```

**Query Parameters:**
- `city` (string) - City name
- `productType` (string) - GiftHamper or Cake
- `category` (string) - Product category
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `sortBy` (string) - newest, price_low, price_high, rating
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 20, max: 50)

**Example:**
```http
GET /products/search?city=Mumbai&productType=Cake&minPrice=1000&maxPrice=5000&sortBy=price_low&page=1&limit=15
```

### Upload Product Images
```http
POST /products/:productId/images
```

**Headers:**
```http
Authorization: Bearer <vendor_jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images` - Array of image files (max 10 images per product)

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 3 images",
  "data": {
    "images": [
      {
        "url": "https://cloudinary.com/image1.jpg",
        "publicId": "products/image1_id",
        "order": 1
      },
      {
        "url": "https://cloudinary.com/image2.jpg",
        "publicId": "products/image2_id",
        "order": 2
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Supported Cities
```http
GET /products/cities
```

**Response:**
```json
{
  "cities": [
    "Delhi",
    "Mumbai",
    "Bangalore"
  ],
  "totalCities": 3,
  "success": true
}
```

## Requests

### Create Service Request
```http
POST /requests
```

**Request Body:**
```json
{
  "serviceType": "DJ",
  "preferredDateRange": {
    "start": "2024-02-15T00:00:00.000Z",
    "end": "2024-02-15T23:59:59.000Z"
  },
  "details": "Need a DJ for a wedding reception",
  "budget": 10000,
  "location": {
    "address": "Wedding Venue",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201301"
  }
}
```

### Get User Requests
```http
GET /requests
```

**Query Parameters:**
- `status` (string) - open, in_progress, completed, cancelled
- `page` (number) - Page number
- `limit` (number) - Results per page

## Conversations

### Open Conversation (Vendor accepts request)
```http
POST /conversations
```

**Request Body:**
```json
{
  "requestId": "request_id",
  "vendorId": "vendor_id"
}
```

### Get User Conversations
```http
GET /conversations
```

## Offers

### Create Offer (Vendor)
```http
POST /offers
```

**Request Body:**
```json
{
  "conversationId": "conversation_id",
  "vendorId": "vendor_id",
  "customerId": "customer_id",
  "totalPrice": 8000,
  "breakdown": {
    "DJ": 5000,
    "Equipment": 2000,
    "Travel": 1000
  },
  "expiry": "2024-01-15T23:59:59.000Z",
  "terms": "Standard terms and conditions apply"
}
```

### Accept Offer (Customer)
```http
POST /offers/:offerId/accept
```

### Reject Offer (Customer)
```http
POST /offers/:offerId/reject
```

## Bookings

### Create Booking
```http
POST /bookings
```

**Request Body:**
```json
{
  "offerId": "offer_id",
  "paymentId": "payment_id",
  "customerId": "customer_id",
  "vendorId": "vendor_id",
  "schedule": {
    "date": "2024-02-15T00:00:00.000Z",
    "timeSlot": "18:00-22:00"
  },
  "items": {
    "DJ": {
      "quantity": 1,
      "price": 5000
    },
    "Equipment": {
      "quantity": 1,
      "price": 2000
    }
  }
}
```

### Get User Bookings
```http
GET /bookings
```

**Query Parameters:**
- `status` (string) - confirmed, completed, cancelled
- `page` (number) - Page number
- `limit` (number) - Results per page

### Get Booking Details
```http
GET /bookings/:bookingId
```

### Update Booking Status
```http
PATCH /bookings/:bookingId/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

## Payments

### Create Payment Order
```http
POST /payments/create-order
```

**Request Body:**
```json
{
  "offerId": "offer_id",
  "customerId": "customer_id",
  "amount": 8000,
  "paymentType": "BOOKING"
}
```

**Response:**
```json
{
  "message": "Payment order created successfully",
  "order": {
    "id": "order_id",
    "amount": 8000,
    "currency": "INR",
    "receipt": "receipt_id"
  },
  "payment": {
    "_id": "payment_id",
    "status": "INITIATED",
    "razorpayOrderId": "order_id"
  }
}
```

### Verify Payment
```http
POST /payments/verify
```

**Request Body:**
```json
{
  "paymentId": "payment_id",
  "razorpayPaymentId": "pay_id",
  "razorpaySignature": "signature"
}
```

### Get Payment Status
```http
GET /payments/:paymentId/status
```

### Retry Failed Payment
```http
POST /payments/:paymentId/retry
```

### Process Refund
```http
POST /payments/:paymentId/refund
```

**Request Body:**
```json
{
  "refundAmount": 4000,
  "notes": "Partial refund due to cancellation"
}
```

### Get User Payments
```http
GET /payments
```

**Query Parameters:**
- `status` (string) - initiated, success, failed, refunded
- `paymentType` (string) - booking, subscription, add_on
- `page` (number) - Page number
- `limit` (number) - Results per page

## Cancellations

### Cancel Booking
```http
POST /cancellations
```

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "reason": "Change of plans"
}
```

**Response:**
```json
{
  "message": "Cancellation processed successfully",
  "cancellation": {
    "_id": "cancellation_id",
    "bookingId": "booking_id",
    "refundAmount": 6000,
    "refundStatus": "PROCESSED"
  },
  "refund": {
    "refundAmount": 6000,
    "refundStatus": "PROCESSED",
    "refundId": "refund_id"
  }
}
```

### Get Cancellation Status
```http
GET /cancellations/:cancellationId
```

## Reviews

### Create Review
```http
POST /reviews
```

**Request Body:**
```json
{
  "bookingId": "booking_id",
  "ratings": {
    "overall": 5,
    "quality": 5,
    "punctuality": 4,
    "professionalism": 5,
    "valueForMoney": 4,
    "communication": 5
  },
  "reviewText": "Excellent service! The DJ was professional and the music was perfect for our wedding reception.",
  "reviewPhotos": ["photo_url_1", "photo_url_2"]
}
```

### Get Vendor Reviews
```http
GET /reviews/vendor/:vendorId
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Results per page
- `minRating` (number) - Minimum rating filter
- `sortBy` (string) - createdAt, rating
- `sortOrder` (string) - asc, desc

### Get User Reviews
```http
GET /reviews/user
```

### Add Vendor Response
```http
POST /reviews/:reviewId/response
```

**Request Body:**
```json
{
  "responseText": "Thank you for your kind words! We're glad you enjoyed our service."
}
```

### Mark Review Helpful
```http
POST /reviews/:reviewId/helpful
```

### Flag Review
```http
POST /reviews/:reviewId/flag
```

**Request Body:**
```json
{
  "reason": "inappropriate"
}
```

## Messages

### Send Message
```http
POST /messages
```

**Request Body:**
```json
{
  "conversationId": "conversation_id",
  "sender": "user_id",
  "content": "Hello, I'm interested in your services",
  "type": "text"
}
```

### Get Conversation Messages
```http
GET /messages/conversation/:conversationId
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Results per page

### Mark Messages as Read
```http
PATCH /messages/read
```

**Request Body:**
```json
{
  "conversationId": "conversation_id",
  "messageIds": ["message_id_1", "message_id_2"]
}
```

## Timelines

The Timeline API allows users to create, manage, and track event timelines with chronological tasks and milestones.

### Get User Timelines
```http
GET /api/timelines
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "_id": "timeline_id",
    "userId": "user_id",
    "title": "Wedding Planning Timeline",
    "description": "Complete timeline for wedding planning",
    "eventType": "wedding",
    "items": [
      {
        "id": "1",
        "title": "Book venue",
        "description": "Reserve wedding venue",
        "cardTitle": "Venue Booking",
        "cardSubtitle": "6 months before",
        "cardDetailedText": "Research and book the perfect venue",
        "checked": false,
        "order": 1
      }
    ],
    "linkedBookingId": "booking_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Timeline
```http
POST /api/timelines
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Birthday Party Timeline",
  "description": "Timeline for organizing birthday party",
  "eventType": "birthday",
  "items": [
    {
      "id": "1",
      "title": "Send invitations",
      "description": "Send party invitations to guests",
      "cardTitle": "Invitations",
      "cardSubtitle": "2 weeks before",
      "cardDetailedText": "Create and send digital or physical invitations",
      "checked": false,
      "order": 1
    },
    {
      "id": "2",
      "title": "Order cake",
      "description": "Order birthday cake from bakery",
      "cardTitle": "Cake Order",
      "cardSubtitle": "1 week before",
      "cardDetailedText": "Choose flavor and design, place order",
      "checked": false,
      "order": 2
    }
  ],
  "linkedBookingId": "booking_id"
}
```

**Response:**
```json
{
  "_id": "timeline_id",
  "userId": "user_id",
  "title": "Birthday Party Timeline",
  "description": "Timeline for organizing birthday party",
  "eventType": "birthday",
  "items": [
    {
      "id": "1",
      "title": "Send invitations",
      "description": "Send party invitations to guests",
      "cardTitle": "Invitations",
      "cardSubtitle": "2 weeks before",
      "cardDetailedText": "Create and send digital or physical invitations",
      "checked": false,
      "order": 1
    }
  ],
  "linkedBookingId": "booking_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Timeline by ID
```http
GET /api/timelines/:id
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "_id": "timeline_id",
  "userId": "user_id",
  "title": "Wedding Planning Timeline",
  "description": "Complete timeline for wedding planning",
  "eventType": "wedding",
  "items": [
    {
      "id": "1",
      "title": "Book venue",
      "description": "Reserve wedding venue",
      "cardTitle": "Venue Booking",
      "cardSubtitle": "6 months before",
      "cardDetailedText": "Research and book the perfect venue",
      "checked": true,
      "completedAt": "2024-01-15T10:30:00.000Z",
      "order": 1
    }
  ],
  "linkedBookingId": {
    "_id": "booking_id",
    "schedule": {
      "date": "2024-06-15T00:00:00.000Z",
      "timeSlot": "18:00-22:00"
    },
    "totalAmount": 50000,
    "status": "confirmed"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Update Timeline
```http
PUT /api/timelines/:id
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Wedding Timeline",
  "description": "Updated timeline with new tasks",
  "eventType": "wedding",
  "items": [
    {
      "id": "1",
      "title": "Book venue",
      "description": "Reserve wedding venue",
      "cardTitle": "Venue Booking",
      "cardSubtitle": "6 months before",
      "cardDetailedText": "Research and book the perfect venue",
      "checked": true,
      "completedAt": "2024-01-15T10:30:00.000Z",
      "order": 1
    },
    {
      "id": "2",
      "title": "Book catering",
      "description": "Arrange catering services",
      "cardTitle": "Catering",
      "cardSubtitle": "4 months before",
      "cardDetailedText": "Select menu and finalize catering",
      "checked": false,
      "order": 2
    }
  ]
}
```

### Delete Timeline
```http
DELETE /api/timelines/:id
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Timeline deleted successfully"
}
```

## Checklists

The Checklist API allows users to create, manage, and track event checklists with prioritized tasks.

### Get User Checklists
```http
GET /api/checklists
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "_id": "checklist_id",
    "userId": "user_id",
    "title": "Wedding Checklist",
    "description": "Complete checklist for wedding planning",
    "eventType": "wedding",
    "items": [
      {
        "id": "1",
        "title": "Book photographer",
        "description": "Hire professional wedding photographer",
        "checked": false,
        "priority": "high",
        "order": 1
      }
    ],
    "linkedBookingId": "booking_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Checklist
```http
POST /api/checklists
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Corporate Event Checklist",
  "description": "Checklist for corporate event planning",
  "eventType": "corporate",
  "items": [
    {
      "id": "1",
      "title": "Book conference room",
      "description": "Reserve conference room for the event",
      "checked": false,
      "priority": "high",
      "order": 1
    },
    {
      "id": "2",
      "title": "Arrange catering",
      "description": "Order lunch and refreshments",
      "checked": false,
      "priority": "medium",
      "order": 2
    },
    {
      "id": "3",
      "title": "Setup AV equipment",
      "description": "Test projector and sound system",
      "checked": false,
      "priority": "high",
      "order": 3
    }
  ],
  "linkedBookingId": "booking_id"
}
```

**Response:**
```json
{
  "_id": "checklist_id",
  "userId": "user_id",
  "title": "Corporate Event Checklist",
  "description": "Checklist for corporate event planning",
  "eventType": "corporate",
  "items": [
    {
      "id": "1",
      "title": "Book conference room",
      "description": "Reserve conference room for the event",
      "checked": false,
      "priority": "high",
      "order": 1
    }
  ],
  "linkedBookingId": "booking_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Checklist by ID
```http
GET /api/checklists/:id
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "_id": "checklist_id",
  "userId": "user_id",
  "title": "Wedding Checklist",
  "description": "Complete checklist for wedding planning",
  "eventType": "wedding",
  "items": [
    {
      "id": "1",
      "title": "Book photographer",
      "description": "Hire professional wedding photographer",
      "checked": true,
      "completedAt": "2024-01-10T14:20:00.000Z",
      "priority": "high",
      "order": 1
    },
    {
      "id": "2",
      "title": "Order flowers",
      "description": "Select and order wedding flowers",
      "checked": false,
      "priority": "medium",
      "order": 2
    }
  ],
  "linkedBookingId": {
    "_id": "booking_id",
    "schedule": {
      "date": "2024-06-15T00:00:00.000Z",
      "timeSlot": "18:00-22:00"
    },
    "totalAmount": 50000,
    "status": "confirmed"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-10T14:20:00.000Z"
}
```

### Update Checklist
```http
PUT /api/checklists/:id
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Wedding Checklist",
  "description": "Updated checklist with completed tasks",
  "eventType": "wedding",
  "items": [
    {
      "id": "1",
      "title": "Book photographer",
      "description": "Hire professional wedding photographer",
      "checked": true,
      "completedAt": "2024-01-10T14:20:00.000Z",
      "priority": "high",
      "order": 1
    },
    {
      "id": "2",
      "title": "Order flowers",
      "description": "Select and order wedding flowers",
      "checked": false,
      "priority": "medium",
      "order": 2
    },
    {
      "id": "3",
      "title": "Book DJ",
      "description": "Hire DJ for wedding reception",
      "checked": false,
      "priority": "high",
      "order": 3
    }
  ]
}
```

### Delete Checklist
```http
DELETE /api/checklists/:id
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Checklist deleted successfully"
}
```

### Timeline and Checklist Data Models

#### Event Types
Both timelines and checklists support the following event types:
- `wedding` - Wedding events
- `birthday` - Birthday parties
- `corporate` - Corporate events
- `getTogether` - Social gatherings
- `officeParty` - Office parties
- `concert` - Concerts and shows
- `custom` - Custom events (default)

#### Timeline Item Structure
```json
{
  "id": "string",              // Unique identifier
  "title": "string",           // Item title (required, max 200 chars)
  "description": "string",     // Item description (max 500 chars)
  "cardTitle": "string",       // Display title (max 200 chars)
  "cardSubtitle": "string",    // Display subtitle (max 200 chars)
  "cardDetailedText": "string", // Detailed description (max 1000 chars)
  "checked": "boolean",        // Completion status
  "completedAt": "date",       // Completion timestamp
  "order": "number"            // Display order (required)
}
```

#### Checklist Item Structure
```json
{
  "id": "string",              // Unique identifier
  "title": "string",           // Item title (required, max 200 chars)
  "description": "string",     // Item description (max 500 chars)
  "checked": "boolean",        // Completion status
  "completedAt": "date",       // Completion timestamp
  "priority": "string",        // Priority: low, medium, high
  "order": "number"            // Display order (required)
}
```

#### Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "error": "Validation failed: Title is required and must be 1-200 characters",
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**403 Forbidden:**
```json
{
  "error": "Unauthorized access to timeline",
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found:**
```json
{
  "error": "Timeline not found",
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Corporate Subscriptions

### Create Subscription
```http
POST /corporate/subscriptions
```

**Request Body:**
```json
{
  "planType": "PRO",
  "billingCycle": "MONTHLY",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "maxEvents": 50,
  "features": ["priority_support", "analytics", "custom_branding"]
}
```

### Get Subscription Details
```http
GET /corporate/subscriptions/:subscriptionId
```

### Update Subscription
```http
PATCH /corporate/subscriptions/:subscriptionId
```

### Cancel Subscription
```http
DELETE /corporate/subscriptions/:subscriptionId
```

## Corporate Events

### Create Corporate Event
```http
POST /corporate/events
```

**Request Body:**
```json
{
  "title": "Annual Tech Conference",
  "description": "Annual technology conference for our company",
  "eventType": "conference",
  "date": "2024-03-15T00:00:00.000Z",
  "duration": 8,
  "attendees": 200,
  "location": {
    "venue": "Tech Conference Center",
    "address": "123 Tech Street",
    "city": "Gurugram",
    "state": "Haryana",
    "pincode": "122001"
  },
  "services": [
    {
      "serviceType": "DJ",
      "vendorId": "vendor_id",
      "price": 15000
    },
    {
      "serviceType": "Photographer",
      "vendorId": "vendor_id_2",
      "price": 25000
    }
  ],
  "budget": 100000
}
```

### Get Corporate Events
```http
GET /corporate/events
```

**Query Parameters:**
- `status` (string) - upcoming, ongoing, completed, cancelled
- `page` (number) - Page number
- `limit` (number) - Results per page

### Update Event
```http
PATCH /corporate/events/:eventId
```

### Cancel Event
```http
DELETE /corporate/events/:eventId
```

## Analytics

### Platform Analytics (Admin Only)
```http
GET /analytics/platform
```

**Query Parameters:**
- `timeframe` (string) - day, week, month, year

**Response:**
```json
{
  "totalUsers": 1500,
  "totalVendors": 200,
  "totalBookings": 500,
  "totalRevenue": 2500000,
  "averageRating": 4.5,
  "topServices": ["DJ", "Photographer", "Catering"],
  "topCities": ["Noida", "Gurugram", "Delhi"],
  "growthMetrics": {
    "userGrowth": 15.5,
    "revenueGrowth": 25.3,
    "bookingGrowth": 20.1
  }
}
```

### Vendor Analytics
```http
GET /analytics/vendor/:vendorId
```

**Query Parameters:**
- `timeframe` (string) - day, week, month, year

### User Analytics
```http
GET /analytics/consumer/:consumerId
```

**Query Parameters:**
- `timeframe` (string) - day, week, month, year

### Export Analytics Data (Admin Only)
```http
GET /analytics/export/:type
```

**Query Parameters:**
- `timeframe` (string) - day, week, month, year
- `type` (string) - platform, vendors, consumers

## Admin

### Vendor Approval Management

#### Get Pending Vendors
```http
GET /admin/vendors/pending
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10)
- `serviceType` (string) - Filter by service type (GiftHamper, Cake, DJ, etc.)
- `sortBy` (string) - Sort field (createdAt, name, serviceType)
- `sortOrder` (string) - Sort order (asc, desc)

**Response:**
```json
{
  "vendors": [
    {
      "_id": "vendor_id",
      "name": "Vendor Name",
      "serviceType": "GiftHamper",
      "phoneNumber": "+91XXXXXXXXXX",
      "gstNumber": "GST123456789",
      "address": {
        "street": "123 Main St",
        "city": "Delhi",
        "state": "Delhi"
      },
      "status": "pending_approval",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "success": true
}
```

#### Get Vendor Details
```http
GET /admin/vendors/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "vendor_id",
    "name": "Vendor Name",
    "serviceType": "GiftHamper",
    "phoneNumber": "+91XXXXXXXXXX",
    "gstNumber": "GST123456789",
    "panNumber": "PAN123456789",
    "address": {
      "street": "123 Main St",
      "city": "Delhi",
      "state": "Delhi"
    },
    "portfolioPhotos": ["url1", "url2"],
    "deliveryOptions": ["Delivery Only"],
    "panIndiaDelivery": false,
    "deliveryAreas": ["Delhi", "Noida"],
    "status": "pending_approval",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Approve Vendor
```http
PUT /admin/vendors/:id/approve
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "approvedBy": "Admin Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor approved successfully",
  "data": {
    "vendorId": "vendor_id",
    "name": "Vendor Name",
    "serviceType": "GiftHamper",
    "status": "approved",
    "approvedAt": "2024-01-01T12:00:00.000Z",
    "approvedBy": "Admin Name"
  }
}
```

#### Reject Vendor
```http
PUT /admin/vendors/:id/reject
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "rejectionReason": "Incomplete documentation",
  "rejectedBy": "Admin Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor rejected successfully",
  "data": {
    "vendorId": "vendor_id",
    "name": "Vendor Name",
    "serviceType": "GiftHamper",
    "status": "rejected",
    "rejectionReason": "Incomplete documentation"
  }
}
```

#### Suspend Vendor
```http
PUT /admin/vendors/:id/suspend
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "suspensionReason": "Policy violation",
  "suspendedBy": "Admin Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor suspended successfully",
  "data": {
    "vendorId": "vendor_id",
    "name": "Vendor Name",
    "serviceType": "GiftHamper",
    "status": "suspended",
    "suspensionReason": "Policy violation"
  }
}
```

#### Reactivate Vendor
```http
PUT /admin/vendors/:id/reactivate
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "reactivatedBy": "Admin Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor reactivated successfully",
  "data": {
    "vendorId": "vendor_id",
    "name": "Vendor Name",
    "serviceType": "GiftHamper",
    "status": "approved"
  }
}
```

### General Admin Operations

### Get All Users
```http
GET /admin/users
```

**Query Parameters:**
- `role` (string) - individual_consumer, corporate_consumer, vendor
- `status` (string) - active, suspended, pending
- `page` (number) - Page number
- `limit` (number) - Results per page

### Suspend User
```http
PATCH /admin/users/:userId/suspend
```

**Request Body:**
```json
{
  "reason": "Violation of terms",
  "duration": 7
}
```

### Unsuspend User
```http
PATCH /admin/users/:userId/unsuspend
```

### Get Platform Statistics
```http
GET /admin/statistics
```

### Get Penalty Reports
```http
GET /admin/penalties
```

**Query Parameters:**
- `type` (string) - warning, rating_reduction, commission_increase, suspension
- `page` (number) - Page number
- `limit` (number) - Results per page

## Invoices

The Invoice API allows generation, retrieval, and management of PDF invoices with the Tendr template format.

### Create Invoice
```http
POST /api/invoices
```

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer": {
    "name": "Navyug Infosolutions",
    "gstNumber": "09AAACN3473H1ZE",
    "address": {
      "line1": "1st Floor, G-203, G Block, Sector 63",
      "line2": "Noida, Chotpur",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "pincode": "201309"
    }
  },
  "invoiceNumber": "001",
  "invoiceDate": "2025-10-17",
  "lineItems": [
    {
      "description": "Corporate Event planning",
      "quantity": 1,
      "total": 42000
    },
    {
      "description": "Venue Decoration",
      "quantity": 1,
      "total": 15000
    }
  ],
  "taxRate": 18,
  "discount": 4560,
  "companyInfo": {
    "name": "Tendr",
    "address": "R-11/70 Raj Nagar, Ghaziabad, U.P, India",
    "gstNumber": "09AAYFT2273N1Z5",
    "email": "contacttendr@gmail.com",
    "bankDetails": {
      "bankName": "HDFC BANK",
      "accountName": "Tendr",
      "accountNumber": "50200114536264",
      "ifscCode": "HDFC0000153"
    }
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoiceId": "65f8a9b2c3d4e5f6g7h8i9j0",
    "invoiceNumber": "001",
    "pdfUrl": "https://res.cloudinary.com/dfhc3nuio/raw/upload/v1234567890/invoices/INV-001-1234567890.pdf",
    "customer": {
      "name": "Navyug Infosolutions",
      "gstNumber": "09AAACN3473H1ZE"
    },
    "subtotal": 57000,
    "taxAmount": 10260,
    "discount": 4560,
    "total": 62700,
    "createdAt": "2025-10-17T10:30:00.000Z"
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid invoice data",
    "details": [
      {
        "field": "customer.name",
        "message": "Customer name is required"
      },
      {
        "field": "lineItems",
        "message": "At least one line item is required"
      }
    ]
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}

// 500 - PDF Generation Error
{
  "success": false,
  "error": {
    "code": "PDF_GENERATION_ERROR",
    "message": "Failed to generate PDF invoice"
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}

// 500 - Storage Error
{
  "success": false,
  "error": {
    "code": "STORAGE_ERROR",
    "message": "Failed to upload invoice PDF to storage"
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}
```

### Get Invoice by ID
```http
GET /api/invoices/:id
```

**Path Parameters:**
- `id` (string) - Invoice ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "65f8a9b2c3d4e5f6g7h8i9j0",
    "invoiceNumber": "001",
    "invoiceDate": "2025-10-17T00:00:00.000Z",
    "customer": {
      "name": "Navyug Infosolutions",
      "gstNumber": "09AAACN3473H1ZE",
      "address": {
        "line1": "1st Floor, G-203, G Block, Sector 63",
        "line2": "Noida, Chotpur",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "pincode": "201309"
      }
    },
    "lineItems": [
      {
        "description": "Corporate Event planning",
        "quantity": 1,
        "total": 42000
      },
      {
        "description": "Venue Decoration",
        "quantity": 1,
        "total": 15000
      }
    ],
    "subtotal": 57000,
    "taxRate": 18,
    "taxAmount": 10260,
    "discount": 4560,
    "total": 62700,
    "pdfUrl": "https://res.cloudinary.com/dfhc3nuio/raw/upload/v1234567890/invoices/INV-001-1234567890.pdf",
    "companyInfo": {
      "name": "Tendr",
      "address": "R-11/70 Raj Nagar, Ghaziabad, U.P, India",
      "gstNumber": "09AAYFT2273N1Z5",
      "email": "contacttendr@gmail.com",
      "bankDetails": {
        "bankName": "HDFC BANK",
        "accountName": "Tendr",
        "accountNumber": "50200114536264",
        "ifscCode": "HDFC0000153"
      }
    },
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice not found"
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}
```

### Download Invoice PDF
```http
GET /api/invoices/:id/download
```

**Path Parameters:**
- `id` (string) - Invoice ID

**Success Response (302):**
- Redirects to Cloudinary PDF URL for direct download

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice not found"
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}
```

### List Invoices
```http
GET /api/invoices
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10, max: 50)
- `startDate` (string) - Filter by start date (ISO 8601 format)
- `endDate` (string) - Filter by end date (ISO 8601 format)
- `customerName` (string) - Filter by customer name (partial match)
- `sortBy` (string) - Sort field (createdAt, invoiceNumber, total) (default: createdAt)
- `sortOrder` (string) - Sort order (asc, desc) (default: desc)

**Example:**
```http
GET /api/invoices?page=1&limit=10&startDate=2025-01-01&endDate=2025-12-31&customerName=Navyug&sortBy=createdAt&sortOrder=desc
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "invoiceId": "65f8a9b2c3d4e5f6g7h8i9j0",
        "invoiceNumber": "001",
        "invoiceDate": "2025-10-17T00:00:00.000Z",
        "customer": {
          "name": "Navyug Infosolutions",
          "gstNumber": "09AAACN3473H1ZE"
        },
        "subtotal": 57000,
        "taxAmount": 10260,
        "discount": 4560,
        "total": 62700,
        "pdfUrl": "https://res.cloudinary.com/dfhc3nuio/raw/upload/v1234567890/invoices/INV-001-1234567890.pdf",
        "createdAt": "2025-10-17T10:30:00.000Z"
      },
      {
        "invoiceId": "65f8a9b2c3d4e5f6g7h8i9j1",
        "invoiceNumber": "002",
        "invoiceDate": "2025-10-18T00:00:00.000Z",
        "customer": {
          "name": "Tech Solutions Ltd",
          "gstNumber": "27ABCDE1234F1Z5"
        },
        "subtotal": 35000,
        "taxAmount": 6300,
        "discount": 2000,
        "total": 39300,
        "pdfUrl": "https://res.cloudinary.com/dfhc3nuio/raw/upload/v1234567891/invoices/INV-002-1234567891.pdf",
        "createdAt": "2025-10-18T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z",
      "customerName": "Navyug"
    }
  },
  "timestamp": "2025-10-17T10:30:00.000Z"
}
```

### Invoice Data Model

#### Invoice Structure
```json
{
  "_id": "ObjectId",
  "invoiceNumber": "string (unique, required)",
  "invoiceDate": "Date (required)",
  "customer": {
    "name": "string (required)",
    "gstNumber": "string (optional)",
    "address": {
      "line1": "string (optional)",
      "line2": "string (optional)",
      "city": "string (optional)",
      "state": "string (optional)",
      "pincode": "string (optional)"
    }
  },
  "lineItems": [
    {
      "description": "string (required)",
      "quantity": "number (required, min: 1)",
      "total": "number (required, min: 0)"
    }
  ],
  "subtotal": "number (required, min: 0)",
  "taxRate": "number (required, min: 0, max: 100)",
  "taxAmount": "number (required, min: 0)",
  "discount": "number (default: 0, min: 0)",
  "total": "number (required, min: 0)",
  "companyInfo": {
    "name": "string (optional)",
    "address": "string (optional)",
    "gstNumber": "string (optional)",
    "email": "string (optional)",
    "bankDetails": {
      "bankName": "string (optional)",
      "accountName": "string (optional)",
      "accountNumber": "string (optional)",
      "ifscCode": "string (optional)"
    }
  },
  "pdfUrl": "string (required)",
  "pdfPublicId": "string (required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Validation Rules
- **invoiceNumber**: Must be unique, alphanumeric with hyphens allowed
- **customer.name**: Required, 1-200 characters
- **customer.gstNumber**: Optional, must match GST format if provided
- **lineItems**: At least one item required
- **lineItems[].description**: Required, 1-500 characters
- **lineItems[].quantity**: Required, positive integer
- **lineItems[].total**: Required, non-negative number
- **taxRate**: Required, 0-100 (percentage)
- **discount**: Optional, non-negative number
- **invoiceDate**: Valid date, not in future

#### Calculation Logic
```
subtotal = sum of all lineItems[].total
taxAmount = subtotal × (taxRate / 100)
total = subtotal + taxAmount - discount
```

### Invoice PDF Template

The generated PDF follows the Tendr invoice template with:

1. **Header Section**
   - Tendr logo (left)
   - "Invoice" title (right)
   - Invoice number and date

2. **Customer Information**
   - "Billed to:" label
   - Customer name (bold)
   - GST number
   - Multi-line address

3. **Line Items Table**
   - Columns: Item (60%), Quantity (20%), Total (20%)
   - Header row with bottom border
   - Data rows with proper spacing

4. **Totals Section**
   - Right-aligned labels and amounts
   - Subtotal
   - Tax (with percentage)
   - Discount
   - Total (in black box with white text)

5. **Thank You Message**
   - Handwritten-style "Thank You!" text
   - Centered, cursive font

6. **Footer Section**
   - Left: Payment Information (bank details)
   - Right: Company information (address, GST, email)

### Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `INVOICE_NOT_FOUND` - Invoice ID doesn't exist
- `PDF_GENERATION_ERROR` - Failed to generate PDF
- `STORAGE_ERROR` - Failed to upload/retrieve PDF from storage
- `DATABASE_ERROR` - Database operation failed
- `DUPLICATE_INVOICE_NUMBER` - Invoice number already exists

### Best Practices

1. **Invoice Numbers**: Use a consistent numbering scheme (e.g., INV-001, INV-002)
2. **Date Format**: Provide dates in ISO 8601 format (YYYY-MM-DD)
3. **Currency**: All amounts should be in INR (Indian Rupees)
4. **Decimal Precision**: Use 2 decimal places for all monetary values
5. **GST Numbers**: Validate GST number format before submission
6. **Line Items**: Provide clear, descriptive item names
7. **Storage**: PDF URLs are permanent and can be shared with customers
8. **Pagination**: Use reasonable page sizes (10-50) for list endpoints

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  query: {
    userId: 'user_id',
    role: 'individual_consumer'
  }
});
```

### Events

#### Join Conversation
```javascript
socket.emit('join_conversation', { conversationId: 'conversation_id' });
```

#### Send Message
```javascript
socket.emit('send_message', {
  conversationId: 'conversation_id',
  sender: 'user_id',
  content: 'Hello!'
});
```

#### Receive Message
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

## Data Models

### User Types
- **Individual Consumer**: Regular users booking services
- **Corporate Consumer**: Business clients with subscription plans
- **Vendor**: Service providers
- **Admin**: Platform administrators

### Booking Statuses
- `CONFIRMED` - Booking confirmed and paid
- `IN_PROGRESS` - Service being provided
- `COMPLETED` - Service completed
- `CANCELLED` - Booking cancelled

### Payment Statuses
- `INITIATED` - Payment order created
- `SUCCESS` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded
- `CANCELLED` - Payment cancelled

### Penalty Types
- `WARNING` - First cancellation warning
- `RATING_REDUCTION` - Rating reduction penalty
- `COMMISSION_INCREASE` - Commission increase penalty
- `SUSPENSION` - Account suspension

## Support

For API support and questions:
- Email: api-support@tendr.com
- Documentation: https://docs.tendr.com
- Status Page: https://status.tendr.com 