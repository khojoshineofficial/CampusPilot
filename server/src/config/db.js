const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB attempt ${i}/${retries}: ${err.message}`);
      if (i === retries) process.exit(1);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

module.exports = connectDB;
