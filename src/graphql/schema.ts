import { buildSchema, GraphQLSchema } from 'graphql';
import { getRedisClient } from '../redis/client';
import { ValidationError, NotFoundError } from '../lib/errors';
import { City } from '../types';

// 1. GraphQL Schema definition using AST buildSchema
export const schema: GraphQLSchema = buildSchema(`
  type City {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    country: String!
    countryCode: String!  
    timezone: String
  }

  type Query {
    hello: String!
    searchCities(name: String!, limit: Int): [City!]!
  }

  type Mutation {
    setHello(message: String!): String!
  }
`);

interface SetHelloArgs {
  message: string;
}

// 2. Root Resolver implementation
export const rootResolvers = {
  hello: (): string => {
    return 'Hello, World!';
  },
  searchCities: async ({ name, limit }: { name: string; limit?: number }, context: any): Promise<City[]> => {
    if (!name || name.trim() === '') {
      throw new ValidationError('Search query name cannot be empty.');
    }
    const cities = await context.cityService.searchCities(name, limit);
    if (!cities || cities.length === 0) {
      throw new NotFoundError(`No cities found matching "${name}".`);
    }
    return cities;
  }
};
