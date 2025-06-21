import request from 'supertest';
import app from '../app';
import pool from '../config/database';
import { describe, it } from 'node:test';
import { beforeAll, afterAll, expect } from '@jest/globals';

let ownerToken: string;
let stationId: string;

// Helper to create a new tenant and return token
async function createTenantAndStation() {
  const email = `tenant${Date.now()}@example.com`;
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Other Tenant',
      email,
      password: 'Password123!',
      subscriptionPlan: 'basic'
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Password123!' });

  const token = loginRes.body.token;

  const stationRes = await request(app)
    .post('/api/stations')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Other Station', address: '1 A', city: 'O' });

  const otherStationId = stationRes.body.id || stationRes.body.data?.id;
  return { token, stationId: otherStationId };
}

describe('Pump API', () => {
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@testcompany.com', password: 'Password123!' });

    ownerToken = res.body.token;

    const stationRes = await request(app)
      .post('/api/stations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Pump Test Station', address: '123', city: 'Testville' });

    stationId = stationRes.body.id || stationRes.body.data?.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates a pump for valid station', async () => {
    const res = await request(app)
      .post('/api/pumps')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        stationId,
        name: 'Valid Pump',
        serialNumber: 'VP-001',
        installationDate: '2024-01-01',
        nozzles: [
          { fuelType: 'petrol', initialReading: 0 },
          { fuelType: 'diesel', initialReading: 0 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('station_id', stationId);
  });

  it('fails for non-existent station', async () => {
    const res = await request(app)
      .post('/api/pumps')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        stationId: '00000000-0000-0000-0000-000000000000',
        name: 'Bad Pump',
        serialNumber: 'BAD-1',
        installationDate: '2024-01-01',
        nozzles: [
          { fuelType: 'petrol', initialReading: 0 },
          { fuelType: 'diesel', initialReading: 0 }
        ]
      });

    expect([400, 404]).toContain(res.status);
  });

  it('fails when station belongs to another tenant', async () => {
    const other = await createTenantAndStation();

    const res = await request(app)
      .post('/api/pumps')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        stationId: other.stationId,
        name: 'Cross Pump',
        serialNumber: 'CP-001',
        installationDate: '2024-01-01',
        nozzles: [
          { fuelType: 'petrol', initialReading: 0 },
          { fuelType: 'diesel', initialReading: 0 }
        ]
      });

    expect([400, 404]).toContain(res.status);
  });
});
