import { createClient } from 'redis';
import config from '../config/env';

let redisClient: any = null;

/**
 * Creates a lightweight in-memory fallback for Redis to ensure the app works out-of-the-box
 * even if a Redis server is not running locally.
 */
function createMockRedis(): any {
  const store = new Map<string, string>();
  console.log('Using Resilient In-Memory Redis Mock Client');
  return {
    isMock: true,
    get: async (key: string): Promise<string | null> => {
      return store.get(key) ?? null;
    },
    set: async (key: string, value: string | number): Promise<string> => {
      store.set(key, String(value));
      return 'OK';
    },
    del: async (key: string): Promise<number> => {
      const existed = store.delete(key);
      return existed ? 1 : 0;
    },
  };
}

/**
 * Initializes Redis client connection.
 */
export async function initRedis(): Promise<any> {
  if (redisClient) {
    return redisClient;
  }

  // Create the actual redis client
  const client = createClient({
    url: config.REDIS_URL,
    socket: {
      connectTimeout: 1000, // Fail fast if Redis server is down
      reconnectStrategy: () => false // Do not keep retrying to connect
    }
  });

  client.on('error', (err: any) => {
    // Suppress console flood if disconnected or failing
    if (config.NODE_ENV !== 'test') {
      console.error('Redis Client Error:', err.message);
    }
  });

  try {
    await client.connect();
    redisClient = client;
    console.log(`Connected to Redis at ${config.REDIS_URL}`);
  } catch (err: any) {
    // If connection fails, fallback to mock to prevent blocking startup / tests
    if (config.NODE_ENV !== 'test') {
      console.warn(`Redis connection failed to ${config.REDIS_URL}:`, err.message);
    }
    redisClient = createMockRedis();
  }

  return redisClient;
}

/**
 * Gets the current active Redis client.
 */
export function getRedis(): any {
  if (!redisClient) {
    throw new Error('Redis client has not been initialized. Call initRedis() first.');
  }
  return redisClient;
}

/**
 * Closes the Redis client connection cleanly.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    if (!redisClient.isMock) {
      await redisClient.quit();
    }
    redisClient = null;
  }
}
