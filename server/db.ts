import mongoose from "mongoose";
import { MONGODB_URI, MONGODB_DBNAME } from "./config";

// In a serverless / Next.js environment each function invocation may reuse a
// warm container, and dev-mode hot reloading re-evaluates modules repeatedly.
// Caching the connection (and its in-flight promise) on the global object
// prevents opening a new MongoDB connection on every request.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: MONGODB_DBNAME })
      .then((m) => {
        console.log("🚀 Connected to MongoDB!");
        return m;
      })
      .catch((error) => {
        // Reset so the next request can retry the connection.
        cached.promise = null;
        console.error("❌ MongoDB connection error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
