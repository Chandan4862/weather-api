import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from local .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  NODE_ENV: string;
  PORT: string;
  REDIS_URL: string;
  WEATHER_API: {
    geocodingBaseUrl: string
    weatherBaseUrl: string
    ttl: number
  }
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '4000',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  WEATHER_API: {
    geocodingBaseUrl: process.env.GEOCODING_BASE_URL!,
    weatherBaseUrl: process.env.WEATHER_BASE_URL!,
    ttl: 3600
  }
};

export default config;
