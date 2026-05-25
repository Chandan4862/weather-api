import request from 'supertest';
import app from '../src/app';
import { initRedis, closeRedis } from '../src/redis/client';

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
});
