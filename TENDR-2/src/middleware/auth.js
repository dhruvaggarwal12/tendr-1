const jwt = require('jsonwebtoken');
const config = require('../config');
const { IndividualConsumer, CorporateConsumer, Vendor } = require('../models');

const authConsumer = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Try to find individual consumer first
    let consumer = await IndividualConsumer.findById(decoded.consumerId);
    let consumerType = 'INDIVIDUAL';
    
    // If not found, try corporate consumer
    if (!consumer) {
      consumer = await CorporateConsumer.findById(decoded.consumerId);
      consumerType = 'CORPORATE';
    }

    if (!consumer) {
      throw new Error('Consumer not found');
    }

    req.consumer = consumer;
    req.consumerType = consumerType;
    req.consumer.isAdmin = consumer.email === config.ADMIN_EMAIL;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Corporate-specific authentication middleware
const authCorporateConsumer = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Corporate authentication required' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const consumer = await CorporateConsumer.findById(decoded.consumerId);

    if (!consumer) {
      throw new Error('Corporate consumer not found');
    }

    req.corporateConsumer = consumer;
    req.consumerType = 'CORPORATE';
    req.corporateConsumer.isAdmin = consumer.email === config.ADMIN_EMAIL;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid corporate authentication token' });
  }
};

// Individual consumer authentication middleware
const authIndividualConsumer = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Individual authentication required' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const consumer = await IndividualConsumer.findById(decoded.consumerId);

    if (!consumer) {
      throw new Error('Individual consumer not found');
    }

    req.individualConsumer = consumer;
    req.consumerType = 'INDIVIDUAL';
    req.individualConsumer.isAdmin = consumer.email === config.ADMIN_EMAIL;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid individual authentication token' });
  }
};

const authVendor = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const vendor = await Vendor.findById(decoded.vendorId);
    if (!vendor) {
      throw new Error();
    }
    req.vendor = vendor;
   
req.vendor.isAdmin = vendor.email === config.ADMIN_EMAIL;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid vendor authentication token' });
  }
};

const authAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const consumer = await IndividualConsumer.findById(decoded.consumerId);
    if (consumer && consumer.email === config.ADMIN_EMAIL ) {
      req.admin = { email: consumer.email };
      return next();
    }
    return res.status(401).json({ error: 'Invalid admin token' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

module.exports = {
  authConsumer,
  authCorporateConsumer,
  authIndividualConsumer,
  authVendor,
  authAdmin
}; 