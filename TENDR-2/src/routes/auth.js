const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Consumer } = require('../models');
const config = require('../config');
const { sendOTP, verifyOTP, setPhoneVerified, setConsumerPhoneVerified, checkPhoneVerified, checkConsumerPhoneVerified } = require('../services/otp');
const { validateRequest } = require('../middleware/validator');
const { SUPPORTED_CITIES } = require('../constants');
const { redisClient, setAsync, getAsync, delAsync } = require('../config/redis');
const vendorService = require('../services/vendor');
const CorporateConsumer = require('../models/CorporateConsumer'); // Added import for CorporateConsumer
const bcrypt = require('bcryptjs'); // Added import for bcrypt

// Validation middleware
const validateSignup = [
 body('phoneNumber')
  .matches(/^[0-9]{10}$/)
  .withMessage('Phone number must be exactly 10 digits'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  // body('role').isIn(['customer', 'vendor', 'admin']).withMessage('Invalid role'),
  /**/body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
//   body('address.street').notEmpty().withMessage('Street is required'),
// body('address.city').isIn(SUPPORTED_CITIES).withMessage('Invalid city'),
// body('address.state').notEmpty().withMessage('State is required'),
];

const validateLogin = [
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid mobile number')
];

// Send OTP for user signup
router.post("/signup/otp", async (req, res) => {
  try {
    const { phoneNumber, name, email, password } = req.body;

    if (!phoneNumber || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

   const sendResult = await sendOTP(phoneNumber);
   const { verificationId } = sendResult;

    if (!verificationId) {
      
      return res.status(500).json({ message: "Failed to get verification ID" });
    }

    const otpPayload = {
      verificationId,
      phoneNumber,  
      name,
      password,
      email
    };

    await redisClient.setEx(
      `otp:${phoneNumber}`,
      300,
      JSON.stringify(otpPayload)
    );

    res.status(200).json({
      message: "OTP sent and verificationId stored",
      verificationId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Verify OTP and complete user signup
router.post('/signup/verify', validateSignup, validateRequest, async (req, res) => {
  try {
    const { phoneNumber, otp, name, password,email } = req.body;
   
    
    await verifyOTP(phoneNumber, otp);

   
    const consumer = await Consumer.create({
      name,
      email,
      password,
      phoneNumber,
      phoneVerified: true
    });

    // Issue JWT
    const token = jwt.sign(
      { consumerId: consumer._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    res.status(201).json({
      consumer: {
        _id: consumer._id,
        name: consumer.name,
        email: consumer.email,
        phoneVerified: consumer.phoneVerified
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Verify OTP and complete user login
router.post('/login', validateLogin, validateRequest, async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

   
    const consumer = await Consumer.findOne({ phoneNumber });
    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

   
    const isMatch = await consumer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }


    const token = jwt.sign(
      { consumerId: consumer._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      consumer: {
        _id: consumer._id,
        name: consumer.name,
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Vendor signup - send OTP
router.post('/vsignup/otp', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const existingVendor = await vendorService.getVendorByPhoneNumber(phoneNumber);
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor already exists with this phone number' });
    }
    await sendOTP(phoneNumber);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendor signup - verify OTP
router.post('/vsignup/verify', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    await verifyOTP(phoneNumber, otp);
    await setPhoneVerified(phoneNumber);
    res.json({ message: 'Phone number verified. You can now complete signup.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Vendor signup - complete registration
router.post('/vsignup', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('gstNumber').trim().notEmpty().withMessage('GST number is required'),
  body('teamSize').isInt({ min: 1 }).withMessage('Team size is required'),
  body('locations').isArray({ min: 1 }).withMessage('At least one location is required')
    .custom((arr) => arr.every(city => SUPPORTED_CITIES.includes(city))).withMessage('All locations must be supported cities'),
  body('serviceType').isIn(['DJ', 'Decorator', 'Photographer', 'Caterer']).withMessage('Invalid service type'),
  body('address.street').trim().notEmpty().withMessage('Street is required'),
  body('address.city').isIn(SUPPORTED_CITIES).withMessage('City must be one of the supported cities'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('yearsOfExperience').isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer'),
  body('panNumber').notEmpty().withMessage('PAN number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    // Check phoneVerified flag in Redis
    const isVerified = await checkPhoneVerified(phoneNumber);
    if (!isVerified) {
      return res.status(400).json({ error: 'Phone number not verified. Please verify before signing up.' });
    }
    const existingVendor = await vendorService.getVendorByPhoneNumber(phoneNumber);
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor already exists with this phone number' });
    }
    const vendor = await vendorService.createVendor({ ...req.body, phoneVerified: true });
    // Remove phoneVerified flag from Redis
    const { delAsync } = require('../config/redis');
    await delAsync(`phoneVerified:vendor:${phoneNumber}`);
    // Generate JWT token
    const token = jwt.sign(
      { vendorId: vendor._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    res.status(201).json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        phoneNumber: vendor.phoneNumber,
        address: vendor.address,
        phoneVerified: vendor.phoneVerified
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendor login
router.post('/vlogin', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const vendor = await vendorService.getVendorByPhoneNumber(phoneNumber);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate JWT token
    const token = jwt.sign(
      { vendorId: vendor._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    res.json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        phoneNumber: vendor.phoneNumber,
        address: vendor.address
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send OTP for phone number update (consumer)
router.post('/update-phone/otp', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const existingConsumer = await Consumer.findOne({ phoneNumber });
    if (existingConsumer) {
      return res.status(400).json({ error: 'Consumer already exists with this phone number' });
    }
    await sendOTP(phoneNumber);
    res.json({ message: 'OTP sent successfully for phone number update' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP for phone number update (consumer)
router.post('/update-phone/verify', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    await verifyOTP(phoneNumber, otp);
    await setConsumerPhoneVerified(phoneNumber);
    res.json({ message: 'Phone number verified. You can now update your profile.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send OTP for phone number update (vendor)
router.post('/vendor/update-phone/otp', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const existingVendor = await vendorService.getVendorByPhoneNumber(phoneNumber);
    if (existingVendor) {
      return res.status(400).json({ error: 'Vendor already exists with this phone number' });
    }
    await sendOTP(phoneNumber);
    res.json({ message: 'OTP sent successfully for phone number update' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP for phone number update (vendor)
router.post('/vendor/update-phone/verify', [
  body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits')
], validateRequest, async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    await verifyOTP(phoneNumber, otp);
    await setPhoneVerified(phoneNumber);
    res.json({ message: 'Phone number verified. You can now update your profile.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Corporate Consumer Authentication Routes
router.post('/corporate/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactPerson.name').notEmpty().withMessage('Contact person name is required'),
  body('contactPerson.phone').notEmpty().withMessage('Contact person phone is required'),
  validateRequest
], async (req, res) => {
  try {
    const { email, password, companyName, contactPerson, gstNumber, panNumber, companySize } = req.body;

    // Check if corporate consumer already exists
    const existingConsumer = await CorporateConsumer.findOne({ email });
    if (existingConsumer) {
      return res.status(400).json({ error: 'Corporate account already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create corporate consumer
    const corporateConsumer = new CorporateConsumer({
      email,
      passwordHash,
      companyName,
      contactPerson,
      gstNumber,
      panNumber,
      companySize
    });

    await corporateConsumer.save();

    // Generate JWT token
    const token = jwt.sign(
      { consumerId: corporateConsumer._id, type: 'CORPORATE' },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Corporate account created successfully',
      token,
      consumer: {
        id: corporateConsumer._id,
        email: corporateConsumer.email,
        companyName: corporateConsumer.companyName,
        contactPerson: corporateConsumer.contactPerson,
        verificationStatus: corporateConsumer.verificationStatus
      }
    });
  } catch (error) {
    console.error('Corporate registration error:', error);
    res.status(500).json({ error: 'Failed to create corporate account' });
  }
});

router.post('/corporate/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find corporate consumer
    const corporateConsumer = await CorporateConsumer.findOne({ email });
    if (!corporateConsumer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!corporateConsumer.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, corporateConsumer.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    corporateConsumer.lastLoginAt = new Date();
    await corporateConsumer.save();

    // Generate JWT token
    const token = jwt.sign(
      { consumerId: corporateConsumer._id, type: 'CORPORATE' },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Corporate login successful',
      token,
      consumer: {
        id: corporateConsumer._id,
        email: corporateConsumer.email,
        companyName: corporateConsumer.companyName,
        contactPerson: corporateConsumer.contactPerson,
        verificationStatus: corporateConsumer.verificationStatus,
        isVerified: corporateConsumer.isVerified,
        activeSubscription: corporateConsumer.activeSubscription
      }
    });
  } catch (error) {
    console.error('Corporate login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router; 