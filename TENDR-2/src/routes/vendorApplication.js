const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const VendorApplication = require('../models/VendorApplication');

const validate = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phoneNumber')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit phone number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

// POST /vendor-applications — save a new vendor interest application
router.post('/', validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phoneNumber, address } = req.body;

    // Prevent duplicate applications from same phone or email
    const existing = await VendorApplication.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existing) {
      return res.status(409).json({
        message: 'An application with this email or phone number already exists.',
      });
    }

    const application = await VendorApplication.create({
      name,
      email,
      phoneNumber,
      address,
    });

    return res.status(201).json({
      message: 'Application submitted successfully. Our team will contact you shortly.',
      applicationId: application._id,
    });
  } catch (err) {
    console.error('VendorApplication error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// GET /vendor-applications — list all applications (admin use)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const applications = await VendorApplication.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await VendorApplication.countDocuments(query);
    return res.json({ applications, total, page: Number(page) });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

module.exports = router;
