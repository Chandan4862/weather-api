import request from 'supertest';
import app from '../src/app';
import { initRedis, closeRedis } from '../src/redis/client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Travel Planner GraphQL API Integration Tests', () => {

  // Connect Redis cache prior to running tests
  beforeAll(async () => {
    await initRedis();
  });

  // Disconnect Redis cleanly after all tests finish
  afterAll(async () => {
    await closeRedis();
  });

  test('Query: hello - Should return Hello, World!', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: '{ hello }'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.hello).toBe('Hello, World!');
  });

  describe('Query: searchCities', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Should return list of matching cities on successful fetch', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              searchCities(name: "Mumb", limit:2)
            }
          `
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.searchCities).toEqual([
        'Mumbai',
        'Mumby'
      ]);
    });

    test('Should throw a VALIDATION_ERROR if the search query name is empty', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              searchCities(name: "")
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('cannot be empty');
      expect(response.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
    });

    test('Should throw a NOT_FOUND error if no cities match the search query', async () => {
      mockedAxios.get.mockResolvedValueOnce({
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
              searchCities(name: "NonexistentCity")
            }
          `
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('No cities found');
      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    });
  });
});
