import mongoose from "mongoose";

// Database Connection & Server Startup
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatapp";

export const connection = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("Mongo DB URL not found");
    }
    const res = await mongoose.connect(MONGO_URI);
    if (res) {
      console.log(
        "Connected to MongoDB successfully.",
        res.connection.host,
        res.connection.name,
        res.connection.port,
      );
    }
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};

export default connection;
