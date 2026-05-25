import express, { Application } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLError } from 'graphql';
import { schema, rootResolvers } from './graphql/schema';
import { getRedisClient } from './redis/client';
import { CacheService } from './services/cache.service';
import { CityService } from './services/city.service';
import { httpClient } from './lib/httpClient';
import { AppError } from './lib/errors';

const app: Application = express();

app.use(express.json());

// Instantiate services
const redis = getRedisClient();
const cacheService = new CacheService(redis);
const cityService = new CityService(httpClient, cacheService);

// GraphQL route with error formatting and context injection
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootResolvers,
  graphiql: true,
  context: {
    cacheService,
    cityService
  }
}));

export default app;
