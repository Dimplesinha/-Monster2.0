const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB...uri:', uri);
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = { connectDB };
