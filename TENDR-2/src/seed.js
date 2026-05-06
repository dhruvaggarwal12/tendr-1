/**
 * Tendr Database Seed Script
 * Run: node src/seed.js
 *
 * Seeds:
 * - 1 admin consumer
 * - 4 sample vendors (one per service type)
 * - 2 sample individual consumers
 */

require('dotenv').config();
const mongoose = require('mongoose');

const DB_NAME = 'tendr';
function buildUri(raw) {
  if (!raw) return `mongodb://localhost:27017/${DB_NAME}`;
  if (raw.includes(`/${DB_NAME}`)) return raw;
  return raw.replace(/(\?|$)/, `/${DB_NAME}$1`);
}

const IndividualConsumer = require('./models/IndividualConsumer');
const Vendor = require('./models/Vendor');

const VENDORS = [
  {
    name: 'Shutter Story Photography',
    phoneNumber: '9000000001',
    password: 'Vendor@1234',
    serviceType: 'Photographer',
    gstNumber: 'GST001PHOTO',
    panNumber: 'PHOTO001PAN',
    teamSize: 3,
    yearsOfExperience: 6,
    locations: ['Delhi', 'Noida'],
    address: { street: '12 Lodi Colony', city: 'Delhi', state: 'Delhi' },
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80',
    ],
    photographersCount: 2,
    videographersCount: 1,
    socialMedia: true,
    album: true,
    avgReviewScore: 4.7,
    rankingScore: 82,
    status: 'approved',
    phoneVerified: true,
  },
  {
    name: 'Royal Feast Caterers',
    phoneNumber: '9000000002',
    password: 'Vendor@1234',
    serviceType: 'Caterer',
    gstNumber: 'GST002CATER',
    panNumber: 'CATER002PAN',
    teamSize: 15,
    yearsOfExperience: 10,
    locations: ['Delhi', 'Noida', 'Greater Noida', 'Ghaziabad'],
    address: { street: '45 Connaught Place', city: 'Delhi', state: 'Delhi' },
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    ],
    cuisine: ['North Indian', 'Punjabi', 'Desserts'],
    serviceStyle: ['Buffet', 'Live Counters'],
    menuType: ['Veg', 'Non Veg'],
    beveragesRequired: false,
    avgReviewScore: 4.5,
    rankingScore: 78,
    status: 'approved',
    phoneVerified: true,
  },
  {
    name: 'Beats by DJ Rahul',
    phoneNumber: '9000000003',
    password: 'Vendor@1234',
    serviceType: 'DJ',
    gstNumber: 'GST003DJRHL',
    panNumber: 'DJRHL003PAN',
    teamSize: 2,
    yearsOfExperience: 5,
    locations: ['Noida', 'Greater Noida', 'Delhi'],
    address: { street: '78 Sector 18', city: 'Noida', state: 'Uttar Pradesh' },
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    ],
    setup: ['Full Production'],
    lightsIncluded: true,
    eventTypes: ['House Party', 'Corporate', 'Venue'],
    avgReviewScore: 4.3,
    rankingScore: 71,
    status: 'approved',
    phoneVerified: true,
  },
  {
    name: 'Dream Decor Studio',
    phoneNumber: '9000000004',
    password: 'Vendor@1234',
    serviceType: 'Decorator',
    gstNumber: 'GST004DECOR',
    panNumber: 'DECOR004PAN',
    teamSize: 8,
    yearsOfExperience: 7,
    locations: ['Delhi', 'Ghaziabad'],
    address: { street: '22 Vasant Kunj', city: 'Delhi', state: 'Delhi' },
    portfolioPhotos: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
    ],
    venueCoverage: ['Interior', 'Full'],
    themes: ['Floral Focused', 'Balloon Dominant', 'Lighting Emphasis'],
    avgReviewScore: 4.6,
    rankingScore: 80,
    status: 'approved',
    phoneVerified: true,
  },
];

const CONSUMERS = [
  {
    name: 'Priya Sharma',
    phoneNumber: '9100000001',
    password: 'Consumer@1234',
    email: 'priya@example.com',
    phoneVerified: true,
    address: { city: 'Delhi', state: 'Delhi' },
  },
  {
    name: 'Arjun Mehta',
    phoneNumber: '9100000002',
    password: 'Consumer@1234',
    email: 'arjun@example.com',
    phoneVerified: true,
    address: { city: 'Noida', state: 'Uttar Pradesh' },
  },
];

const ADMIN = {
  name: 'Tendr Admin',
  phoneNumber: '9999999999',
  password: 'Admin@12345',
  email: process.env.ADMIN_EMAIL || 'admin@tendr.com',
  phoneVerified: true,
};

async function seed() {
  const uri = buildUri(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB → db: ${mongoose.connection.name}`);

  // Clear existing seed data
  await Promise.all([
    IndividualConsumer.deleteMany({ phoneNumber: { $in: ['9999999999', '9100000001', '9100000002'] } }),
    Vendor.deleteMany({ phoneNumber: { $in: VENDORS.map((v) => v.phoneNumber) } }),
  ]);
  console.log('Cleared old seed data');

  // Seed admin
  await IndividualConsumer.create(ADMIN);
  console.log(`Admin created: ${ADMIN.email}`);

  // Seed sample consumers
  for (const c of CONSUMERS) {
    await IndividualConsumer.create(c);
    console.log(`Consumer created: ${c.name}`);
  }

  // Seed vendors
  for (const v of VENDORS) {
    await Vendor.create(v);
    console.log(`Vendor created: ${v.name} (${v.serviceType})`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`\nAdmin login → phone: ${ADMIN.phoneNumber}  password: Admin@12345`);
  console.log('Sample vendor password: Vendor@1234');
  console.log('Sample consumer password: Consumer@1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
