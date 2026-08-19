import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI;

let redisClient: Redis | null = null;
let isRedisReady = false;

if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("[Redis] Failed to connect after 3 attempts, running in degraded mode.");
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on("connect", () => {
      isRedisReady = true;
      console.log("[Redis] Connected successfully.");
    });

    redisClient.on("error", (err) => {
      isRedisReady = false;
      console.warn("[Redis] Connection warning:", err.message);
    });
  } catch (err: any) {
    console.warn("[Redis] Initialization skipped:", err?.message);
  }
} else {
  console.log("[Redis] No REDIS_URL provided. Operating in in-memory session mode.");
}

// Helper methods with safe fallback
export const redisCache = {
  get: async (key: string): Promise<string | null> => {
    if (!redisClient || !isRedisReady) return null;
    try {
      return await redisClient.get(key);
    } catch {
      return null;
    }
  },

  set: async (key: string, value: string, expireSeconds?: number): Promise<void> => {
    if (!redisClient || !isRedisReady) return;
    try {
      if (expireSeconds) {
        await redisClient.set(key, value, "EX", expireSeconds);
      } else {
        await redisClient.set(key, value);
      }
    } catch (err) {
      console.warn("[Redis] Set error:", err);
    }
  },

  del: async (key: string): Promise<void> => {
    if (!redisClient || !isRedisReady) return;
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn("[Redis] Del error:", err);
    }
  },
};

export default redisClient;
