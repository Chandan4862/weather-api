import { buildSchema, GraphQLSchema } from 'graphql';
import { getRedis } from '../redis/client';

// 1. GraphQL Schema definition using AST buildSchema
export const schema: GraphQLSchema = buildSchema(`
  type Query {
    hello: String!
    searchCities(name: String!): [String!]!
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

  searchCities: async ({ name }: { name: string }): Promise<string[]> => {
    return [];
  }
};
