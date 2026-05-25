import express, { Application } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema, rootResolvers } from './graphql/schema';
import { getRedisClient } from './redis/client';
import { CacheService } from './services/cache.service';
import { CityService } from './services/city.service';
import { httpClient } from './lib/httpClient';
import { WeatherService } from './services/weather.service';
import { ActivityService } from './services/activities.service';

const app: Application = express();

app.use(express.json());

// Instantiate services
const redis = getRedisClient();
const cacheService = new CacheService(redis);
const cityService = new CityService(httpClient, cacheService);
const weatherService = new WeatherService(httpClient, cacheService)
const activityService = new ActivityService()

// GraphQL route with error formatting and context injection
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootResolvers,
  graphiql: true,
  context: {
    cacheService,
    cityService,
    weatherService,
    activityService
  }
}));

export default app;
