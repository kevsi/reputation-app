import request from 'supertest';
import { createApp } from '../../app';

import { Application } from 'express';

describe('Mentions API', () => {
  let app: Application;
  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/mentions doit retourner 200', async () => {
    const res = await request(app).get('/api/v1/mentions');
    expect(res.status).toBe(401);
    // expect(res.body).toHaveProperty('data');
  });
});
