import app from './app';
import config from './config/env';
import { initRedis, closeRedis } from './redis/client';
import { Server } from 'http';

async function startServer(): Promise<void> {
  try {
    console.log('Starting Travel Planner GraphQL service...');

    // 1. Initialize Redis client (handles actual connection or resilient memory mock)
    await initRedis();

    // 2. Start Express server listener
    const server: Server = app.listen(config.PORT, () => {
      console.log(`Travel Planner server running on port ${config.PORT}`);
    });

    // 3. Graceful Shutdown handlers to prevent socket/connection leaks
    const handleShutdown = async (signal: string): Promise<void> => {
      console.log(`Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await closeRedis();
          console.log('Redis connection closed.');
          console.log('Shutdown finished. Goodbye!');
          process.exit(0);
        } catch (err: any) {
          console.error('Error during Redis connection shutdown:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  } catch (err: any) {
    console.error('Failed to bootstrap server components:', err.message);
    process.exit(1);
  }
}

startServer();
