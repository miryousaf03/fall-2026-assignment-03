import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('sums multiple time logs for a ticket', async () => {
    // Create a user
    const userRes = await request(app)
      .post('/users')
      .send({ name: 'Test User', email: `test${Date.now()}@example.com` });
    const userId = userRes.body.id;

    // Create a ticket
    const ticketRes = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({ title: 'Time log ticket', description: 'Testing time logs' });
    const ticketId = ticketRes.body.id;

    // Sanity checks on setup
    expect(userRes.status).toBe(201);
    expect(ticketRes.status).toBe(201);

    // Log three sets of hours
    for (const hours of [2, 3, 5]) {
      const logRes = await request(app)
        .post(`/tickets/${ticketId}/time`)
        .set('X-User-Id', String(userId))
        .send({ hours });
      expect(logRes.status).toBe(201);
    }

    // Check the total
    const totalRes = await request(app).get(`/tickets/${ticketId}/time`);
    expect(totalRes.status).toBe(200);
    expect(totalRes.body).toEqual({ ticket_id: ticketId, total_hours: 10 });
  });
});
