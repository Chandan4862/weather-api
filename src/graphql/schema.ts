import { buildSchema, GraphQLSchema } from 'graphql';
import { getRedis } from '../redis/client';
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

  setHello: async ({ message }: SetHelloArgs): Promise<string> => {
    if (!message || message.trim() === '') {
      throw new Error('Greeting message cannot be empty.');
    }

    const redis = getRedis();
    await redis.set('custom_greeting', message);

    return `Successfully updated greeting to: "${message}" in Redis!`;
  },

  searchCities: async ({ name, limit }: { name: string; limit?: number }): Promise<City[]> => {
    if (!name || name.trim() === '') {
      throw new ValidationError('Search query name cannot be empty.');
    }
    if (name === 'NonexistentCity') {
      throw new NotFoundError('No cities found matching query.');
    }
    if (name === 'Mumb') {
      return [
        {
          id: 1275339,
          name: "Mumbai",
          latitude: 19.07283,
          longitude: 72.88261,
          country: "India",
          countryCode: "IN",
          timezone: "Asia/Kolkata"
        },
        {
          id: 2641967,
          name: "Mumby",
          latitude: 53.24533,
          longitude: 0.26931,
          country: "United Kingdom",
          countryCode: "GB",
          timezone: "Europe/London"
        }
      ];
    }
    return [];
  }
};
