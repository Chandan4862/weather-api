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
              name: "Mumbai2",
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
});
