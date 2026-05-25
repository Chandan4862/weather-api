import { buildSchema, GraphQLSchema } from 'graphql';
import { getRedisClient } from '../redis/client';
import { ValidationError, NotFoundError } from '../lib/errors';
import { City, DailyWeather, TravelPlan, WeatherForecast } from '../types';
import { validateCityName, validateLatitude, validateLongitude } from '../utils/validations';

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

  type ActivityRecommendation {
    activity: ActivityType!
    rank: Int!
  }
  
  enum ActivityType {
    SKIING
    SURFING
    INDOOR_SIGHTSEEING
    OUTDOOR_SIGHTSEEING    
  } 

  type DailyPlan {
    date: String!
    weather: DailyWeather!
    activities: [ActivityRecommendation!]!
  }

  type TravelPlan {
    city: City!
    dailyPlans: [DailyPlan!]!
  }

  type Query {
    hello: String!
    searchCities(name: String!, limit: Int): [City!]!
    getWeather(latitude: Float!, longitude: Float!, days: Int): WeatherForecast!
    getTravelPlan(cityName: String!, days: Int = 7): TravelPlan!
  }

  type Mutation {
    setHello(message: String!): String!
  }
`);

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
  },
  getTravelPlan: async ({ cityName, days }: { cityName: string, days?: number }, context: any): Promise<TravelPlan> => {
    const name = validateCityName(cityName);

    //Find City Lat, Lang
    const cities = await context.cityService.searchCities(name, 1);
    if (cities.length === 0) {
      throw new NotFoundError(`No cities found matching "${name}".`);
    }

    const city = cities[0];

    //Find forecast of n days
    const forecast = await context.weatherService.getWeather(city.latitude, city.longitude, days)

    //Daily Plans
    const dailyPlans = forecast.daily.map((weather: DailyWeather) => ({
      date: weather.date,
      weather,
      activities: context.activityService.rankActivities(weather)
    }))

    return {
      city,
      dailyPlans
    }
  }
};
