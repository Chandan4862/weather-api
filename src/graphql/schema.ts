import { buildSchema, GraphQLSchema } from 'graphql';
import { getRedisClient } from '../redis/client';
import { ValidationError, NotFoundError } from '../lib/errors';
import { City, WeatherForecast } from '../types';
import { validateLatitude, validateLongitude } from '../utils/validations';

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

  type WeatherForecast {
    latitude: Float!
    longitude: Float!
    timezone: String!
    daily: [DailyWeather!]!
  }

  type DailyWeather {
    date: String!
    temperatureMax: Float!
    temperatureMin: Float!
    precipitationSum: Float!
    windSpeedMax: Float!
    weatherCode: Int!
    snowfallSum: Float!
  }
  type Query {
    hello: String!
    searchCities(name: String!, limit: Int): [City!]!
    getWeather(latitude: Float!, longitude: Float!, days: Int): WeatherForecast!
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
  },
  getWeather: async ({ latitude, longitude, days }: { latitude: number, longitude: number, days: number }, context: any): Promise<WeatherForecast> => {
    const lat = validateLatitude(latitude)
    const long = validateLongitude(longitude)
    return context.weatherService.getWeather(lat, long, days);
  }
};
