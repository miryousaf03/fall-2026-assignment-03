import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  // Test user creation (POST /users)
  it('should create a new user and return 201', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'Test User', email: 'testuser@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test User');
  });

  // Test ticket creation (POST /tickets)
  it('should create a new ticket and return 201', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({ name: 'Ticket Creator', email: 'creator@example.com' });
    const userId = userResponse.body.id;

    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({ title: 'Test Ticket', description: 'Test description' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Ticket');
  });

  // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
  it('should reject ticket creation with 401 when X-User-Id is missing', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({ title: 'No Auth Ticket', description: 'Should fail' });

    expect(response.status).toBe(401);
  });

  // Test 404 responses for non-existent users and tickets
  it('should return 404 for a non-existent ticket', async () => {
    const response = await request(app).get('/tickets/999999');
    expect(response.status).toBe(404);
  });

  it('should return 404 for a non-existent user', async () => {
    const response = await request(app).get('/users/999999');
    expect(response.status).toBe(404);
  });

  // Test pagination and filtering on GET /tickets
  it('should support pagination on GET /tickets', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({ name: 'Pagination Tester', email: 'pagination@example.com' });
    const userId = userResponse.body.id;

    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/tickets')
        .set('X-User-Id', String(userId))
        .send({ title: `Ticket ${i}`, description: 'desc' });
    }

    const response = await request(app).get('/tickets?limit=2&offset=0');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should support status filtering on GET /tickets', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({ name: 'Filter Tester', email: 'filter@example.com' });
    const userId = userResponse.body.id;

    await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({ title: 'Filtered Ticket', description: 'desc' });

    const response = await request(app).get('/tickets?status=TODO');
    expect(response.status).toBe(200);
    for (const ticket of response.body) {
      expect(ticket.status).toBe('TODO');
    }
  });
});
