const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const connectDB = require('./db');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { RATE_LIMITS } = require('./constants');

// Import routes
const adminRoutes = require('./routes/admin');
const vendorRoutes = require('./routes/vendor');
const consumerRoutes = require('./routes/consumer');
const corporateRoutes = require('./routes/corporate');
const analyticsRoutes = require('./routes/analytics');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');
const consumerAuthRoutes = require('./routes/auth');
const requestRoutes = require('./routes/request');
const offerRoutes = require('./routes/offer');
const conversationRoutes = require('./routes/conversation');
const cancellationRoutes = require('./routes/cancellation');
const messageRoutes = require('./routes/message');
const timelineRoutes = require('./routes/timeline');
const checklistRoutes = require('./routes/checklist');
const productRoutes = require('./routes/product');
const invoiceRoutes = require('./routes/invoice');
const vendorApplicationRoutes = require('./routes/vendorApplication');
const eventPlanRoutes = require('./routes/eventPlan');

const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(helmet());
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];
  
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMITS.API.windowMs,
  max: RATE_LIMITS.API.max
});
app.use(limiter);

// Routes
app.use('/admin', adminRoutes);
app.use('/vendors', vendorRoutes);
app.use('/consumers', consumerRoutes);
app.use('/corporate', corporateRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/auth', consumerAuthRoutes);
app.use('/requests', requestRoutes);
app.use('/offers', offerRoutes);
app.use('/conversations', conversationRoutes);
app.use('/cancellations', cancellationRoutes);
app.use('/messages', messageRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/vendor-applications', vendorApplicationRoutes);
app.use('/event-plans', eventPlanRoutes);

// Health check — used by Render to confirm the service is up
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 