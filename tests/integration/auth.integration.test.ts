import request from 'supertest';
import app from '../../backend/src/app';

describe('POST /api/auth/login', () => {
  it('returns 400 when missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
