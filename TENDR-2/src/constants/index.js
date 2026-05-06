// General
const CURRENCIES = { INR: 'INR' };
const SUPPORTED_CITIES = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];

// Consumer Types
const CONSUMER_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  CORPORATE: 'CORPORATE'
};

// Corporate Plans
const CORPORATE_PLANS = {
  BASIC: 'BASIC',
  PRO: 'PRO',
  ELITE: 'ELITE'
};

// Corporate Event Types
const CORPORATE_EVENT_TYPES = [
  'DIWALI_PARTY',
  'TEAM_CELEBRATION', 
  'BIRTHDAY_EVENTS',
  'TEAM_OUTING',
  'ACHIEVEMENT_RECOGNITION',
  'CUSTOM'
];

// Company Sizes
const COMPANY_SIZES = {
  SMALL_10_50: 'SMALL_10_50',
  MEDIUM_51_200: 'MEDIUM_51_200',
  LARGE_200_PLUS: 'LARGE_200_PLUS'
};

// Booking
const Booking = {
  STATUS: ['CONFIRMED', 'COMPLETED', 'CANCELLED'],
  DEFAULT_STATUS: 'CONFIRMED'
};

// Offer
const Offer = {
  STATUS: ['PENDING', 'REJECTED', 'ACCEPTED', 'EXPIRED'],
  DEFAULT_STATUS: 'PENDING'
};

// Request
const Request = {
  STATUS: ['PENDING', 'CANCELLED', 'EXPIRED'],
  DEFAULT_STATUS: 'PENDING'
};

// Cancellation
const Cancellation = {
  STATUS: ['PENDING', 'PROCESSED', 'REJECTED'],
  DEFAULT_STATUS: 'PENDING'
};

// Message
const Message = {
  SENDER: ['user', 'admin', 'customer-care']
};

// Conversation
const Conversation = {
  STATUS: ['OPEN', 'CLOSED'],
  DEFAULT_STATUS: 'OPEN'
};

// Payment
const Payment = {
  STATUS: ['INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
  DEFAULT_STATUS: 'INITIATED',
  METHODS: ['CARD', 'UPI', 'NETBANKING', 'WALLET', 'EMI']
};

// VendorPenalty
const VendorPenalty = {
  TYPE: ['WARNING', 'RATING_REDUCTION', 'COMMISSION_INCREASE', 'SUSPENSION']
};

// Vendor Status
const VENDOR_STATUS = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected'
};

// Vendor/Service Types
const SERVICE_TYPES = ["DJ", "Decorator", "Photographer", "Caterer", "GiftHamper", "Cake"];
const DJ_SETUP_OPTIONS = ["Basic Setup", "Full Production"];
const DECORATOR_VENUE_COVERAGE = ["Interior", "Exterior", "Full", "Backdrop Stage Setup", "Extreme Focus"];
const DECORATOR_THEMES = [
  "Floral Focused", "Balloon Dominant", "Lighting Emphasis", "Fabric Draping",
  "Mixed Media", "Prop Centered", "Minimalist Touch"
];
const CATERER_MENU_TYPE = ["Veg", "Non Veg", "Jain"];
const DJ_EVENT_TYPES = ["House Party", "Corporate", "Venue"];
const CATERER_CUISINE = [
  "North Indian", "South Indian", "Snacks", "Chinese Starters", "Punjabi", "Desserts", "Italian", "Other"
];
const CATERER_SERVICE_STYLE = [
  "Buffet", "Food Stations", "Live Counters", "Family Style"
];

// Gift Hamper and Cake Constants
const CAKE_SIZES = ["0.5kg", "1kg", "1.5kg", "2kg", "2.5kg", "Other"];
const DELIVERY_OPTIONS = ["Pickup Only", "Delivery Only", "Both"];
const PRODUCT_CATEGORIES = {
  GIFT_HAMPER: ["Sweets", "Dry Fruits", "Chocolates", "Mixed", "Corporate Gifts"],
  CAKE: ["Birthday", "Anniversary", "Wedding", "Corporate", "Custom Design"]
};

// View
const VIEW_SOURCES = {
  SEARCH: 'search',
  RECOMMENDATION: 'recommendation',
  SIMILAR: 'similar',
  TRENDING: 'trending',
  DIRECT: 'direct'
};

// Defaults and Misc
const CACHE_TTL = 3600; // 1 hour
const DEFAULTS = {
  LOCATION_RADIUS: 10000, // 10km
  PAGE_SIZE: 10,
  TRENDING_TIMEFRAME: '7d',
  INSIGHTS_TIMEFRAME: '30d'
};
const RATE_LIMITS = {
  OTP: { windowMs: 15 * 60 * 1000, max: 3 },
  API: { windowMs: 60 * 1000, max: 100 },
  AUTH: { windowMs: 60 * 60 * 1000, max: 5 }
};

// Remove RECOMMENDATION from event types
const EVENT_TYPES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  CANCELLATION: 'cancellation',
  REVIEW: 'review',
  MESSAGE: 'message',
  NOTIFICATION: 'notification'
};

module.exports = {
  CURRENCIES,
  SUPPORTED_CITIES,
  CONSUMER_TYPES,
  CORPORATE_PLANS,
  CORPORATE_EVENT_TYPES,
  COMPANY_SIZES,
  Booking,
  Offer,
  Request,
  Cancellation,
  Message,
  Conversation,
  Payment,
  VendorPenalty,
  VENDOR_STATUS,
  SERVICE_TYPES,
  DJ_SETUP_OPTIONS,
  DECORATOR_VENUE_COVERAGE,
  DECORATOR_THEMES,
  CATERER_MENU_TYPE,
  DJ_EVENT_TYPES,
  CATERER_CUISINE,
  CATERER_SERVICE_STYLE,
  CAKE_SIZES,
  DELIVERY_OPTIONS,
  PRODUCT_CATEGORIES,
  VIEW_SOURCES,
  CACHE_TTL,
  DEFAULTS,
  RATE_LIMITS,
  EVENT_TYPES
}; 