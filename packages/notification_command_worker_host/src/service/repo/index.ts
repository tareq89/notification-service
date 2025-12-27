// db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
