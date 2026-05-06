const mongoose = require('mongoose');

const DB_NAME = 'tendr';

// Injects database name into Atlas URI if not already present.
// Atlas URIs: mongodb+srv://user:pass@cluster.net/?options
// Result:     mongodb+srv://user:pass@cluster.net/tendr?options
function buildUri(raw) {
  if (!raw) return `mongodb://localhost:27017/${DB_NAME}`;
  if (raw.includes(`/${DB_NAME}`)) return raw;
  return raw.replace(/(\?|$)/, `/${DB_NAME}$1`);
}

const connectDB = async () => {
  try {
    const uri = buildUri(process.env.MONGODB_URI);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} → db: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 