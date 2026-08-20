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

      // Safely drop deprecated legacy indexes like clerkId_1 on the users collection
      try {
        const usersCollection = res.connection.collection("users");
        const indexes = await usersCollection.indexes();
        const hasClerkIndex = indexes.some((idx) => idx.name === "clerkId_1");
        if (hasClerkIndex) {
          await usersCollection.dropIndex("clerkId_1");
          console.log("Successfully dropped legacy index: clerkId_1 from users collection");
        }
      } catch (idxErr) {
        console.warn("Index check/cleanup notice:", idxErr);
      }
    }
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};

export default connection;
