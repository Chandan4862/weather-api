import request from 'supertest';
import axios from 'axios';

// Mock axios BEFORE importing app (which imports httpClient → axios.create)
const mockGet = jest.fn();
jest.mock('axios', () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      })),
      get: jest.fn(),
    },
  };
});

import app from '../src/app';
import { getRedisClient, closeRedis } from '../src/redis/client';

describe('Travel Planner GraphQL API Integration Tests', () => {

  beforeAll(async () => {
    getRedisClient();
  });

  beforeEach(async () => {
    // Clear any stale cached data from previous test runs or dev usage
    const redis = getRedisClient();
    await redis.flushdb();
  });

  afterAll(async () => {
    await closeRedis();
  });

  describe('Query: searchCities', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Should return list of matching cities on successful fetch', async () => {
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
          results: [
            {
              id: 1275339,
              name: "Mumbai",
              latitude: 19.07283,
              longitude: 72.88261,
              country: "India",
              country_code: "IN",
              timezone: "Asia/Kolkata"
            },
            {
              id: 2641967,
              name: "Mumby",
              latitude: 53.24533,
              longitude: 0.26931,
              country: "United Kingdom",
              country_code: "GB",
              timezone: "Europe/London"
            }
          ]
        }
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              searchCities(name: "Mumb", limit: 2) {
                id
                name
                latitude
                longitude
              }
            }
          `
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.searchCities).toEqual([
        {
          id: "1275339",
          name: "Mumbai",
          latitude: 19.07283,
          longitude: 72.88261
        },
        {
          id: "2641967",
          name: "Mumby",
          latitude: 53.24533,
          longitude: 0.26931
        }
      ]);
    });

    test('Should return a VALIDATION_ERROR when name is empty', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              searchCities(name: "") {
                id
              }
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('cannot be empty');
    });

    test('Should return a NOT_FOUND error when no cities match', async () => {
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
          results: []
        }
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              searchCities(name: "NonexistentCity", limit:3) {
                id
              }
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('No cities found');
    });
  });

  describe('Query: getWeather', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Should return weather forecast for valid coordinates', async () => {
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
          latitude: 19.07,
          longitude: 72.88,
          timezone: 'Asia/Kolkata',
          daily: {
            time: ['2026-05-25', '2026-05-26'],
            temperature_2m_max: [35.2, 33.8],
            temperature_2m_min: [27.1, 26.5],
            precipitation_sum: [0.0, 2.3],
            wind_speed_10m_max: [12.5, 15.0],
            weather_code: [1, 61],
            snowfall_sum: [0.0, 0.0],
          }
        }
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              getWeather(latitude: 19.07, longitude: 72.88, days: 2) {
                latitude
                longitude
                timezone
                daily {
                  date
                  temperatureMax
                  temperatureMin
                  precipitationSum
                  windSpeedMax
                  weatherCode
                  snowfallSum
                }
              }
            }
          `
        });

      expect(response.status).toBe(200);
      expect(response.body.data.getWeather.latitude).toBe(19.07);
      expect(response.body.data.getWeather.timezone).toBe('Asia/Kolkata');
      expect(response.body.data.getWeather.daily).toHaveLength(2);
      expect(response.body.data.getWeather.daily[0]).toEqual({
        date: '2026-05-25',
        temperatureMax: 35.2,
        temperatureMin: 27.1,
        precipitationSum: 0.0,
        windSpeedMax: 12.5,
        weatherCode: 1,
        snowfallSum: 0.0,
      });
    });

    test('Should return VALIDATION_ERROR for invalid latitude', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              getWeather(latitude: 999, longitude: 72.88, days: 3) {
                latitude
              }
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Latitude must be between');
    });
  });

  describe('Query: getTravelPlan', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Should return travel plan with city, weather, and sorted activities', async () => {
      // city search
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
          results: [
            {
              id: 1275339,
              name: "Mumbai",
              latitude: 19.07283,
              longitude: 72.88261,
              country: "India",
              country_code: "IN",
              timezone: "Asia/Kolkata"
            }
          ]
        }
      });

      // Second weather
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
          latitude: 19.07,
          longitude: 72.88,
          timezone: 'Asia/Kolkata',
          daily: {
            time: ['2026-05-25'],
            temperature_2m_max: [35.2],
            temperature_2m_min: [27.1],
            precipitation_sum: [0.0],
            wind_speed_10m_max: [12.5],
            weather_code: [1],
            snowfall_sum: [0.0],
          }
        }
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              getTravelPlan(cityName: "Mumbai", days: 1) {
                city {
                  name
                  latitude
                  longitude
                }
                dailyPlans {
                  date
                  weather {
                    temperatureMax
                    temperatureMin
                  }
                  activities {
                    activity
                    rank
                  }
                }
              }
            }
          `
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();

      const plan = response.body.data.getTravelPlan;
      expect(plan.city.name).toBe("Mumbai");
      expect(plan.dailyPlans).toHaveLength(1);

      const dailyPlan = plan.dailyPlans[0];
      expect(dailyPlan.date).toBe("2026-05-25");
      expect(dailyPlan.weather.temperatureMax).toBe(35.2);
      expect(dailyPlan.activities).toHaveLength(4);

      // rank verification
      const activities = dailyPlan.activities;
      expect(activities[0].rank).toBe(1);
      expect(activities[1].rank).toBe(2);
      expect(activities[2].rank).toBe(3);
      expect(activities[3].rank).toBe(4);
    });

    test('Should return VALIDATION_ERROR when city name is too short', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              getTravelPlan(cityName: "M", days: 1) {
                city {
                  name
                }
              }
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('City name must be at least 2 characters');
    });

    test('Should return NOT_FOUND error when city does not exist', async () => {
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: {
          results: []
        }
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              getTravelPlan(cityName: "NonexistentCity", days: 1) {
                city {
                  name
                }
              }
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('No cities found matching');
    });
  });
});
