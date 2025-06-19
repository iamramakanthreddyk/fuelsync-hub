import request from 'supertest';
import app from '../server';
import pool from '../config/database';
import { describe, it } from 'node:test';
import { afterAll, beforeAll, expect } from '@jest/globals';

// Mock data
let authToken: string;
let stationId: string;

const testStation = {
  name: 'Test Station',
  address: '123 Test St',
  city: 'Testville',
  state: 'TS',
  zip: '12345',
  contactPhone: '555-1234',
};

describe('Station API', () => {
  // Get auth token before tests
  beforeAll(async () => {
    // Login as tenant owner
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@testcompany.com',
        password: 'Password123!'
      });
    
    authToken = res.body.token;
  });

  // Close database connection after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/stations', () => {
    it('should create a new station and return 201', async () => {
      const res = await request(app)
        .post('/api/stations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testStation);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', testStation.name);
      
      // Save ID for future tests
      stationId = res.body.id;
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/stations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: '456 Another St',
          city: 'Testopolis'
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/stations', () => {
    it('should return all stations', async () => {
      const res = await request(app)
        .get('/api/stations')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/stations/:id', () => {
    it('should return a station by ID', async () => {
      const res = await request(app)
        .get(`/api/stations/${stationId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', stationId);
      expect(res.body).toHaveProperty('name', testStation.name);
    });

    it('should return 404 for non-existent station', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/stations/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/stations/:id', () => {
    it('should update a station', async () => {
      const updatedName = 'Updated Test Station';
      
      const res = await request(app)
        .patch(`/api/stations/${stationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: updatedName });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', stationId);
      expect(res.body).toHaveProperty('name', updatedName);
    });
  });

  describe('DELETE /api/stations/:id', () => {
    it('should soft delete a station', async () => {
      const res = await request(app)
        .delete(`/api/stations/${stationId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(204);
      
      // Verify it's been soft deleted (not returned in list)
      const listRes = await request(app)
        .get('/api/stations')
        .set('Authorization', `Bearer ${authToken}`);
      
      const deletedStation = listRes.body.find((s: any) => s.id === stationId);
      expect(deletedStation).toBeUndefined();
    });
  });
});
