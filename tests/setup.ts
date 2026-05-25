import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Set default fallback environment variables for tests
process.env.PORT = process.env.PORT || '4001';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL;
process.env.WEATHER_BASE_URL = process.env.WEATHER_BASE_URL;
