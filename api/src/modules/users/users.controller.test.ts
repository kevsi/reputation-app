import request from 'supertest';
import { createApp } from '../../app';

import { Application } from 'express';

describe('Users API', () => {
  let app: Application;
  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/users doit retourner 200', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    // expect(res.body).toHaveProperty('data');
  });
});
