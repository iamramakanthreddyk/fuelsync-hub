import request from 'supertest';
import app from '../app';
import pool from '../config/database';
import { describe, it } from 'node:test';
import { afterAll, beforeAll, expect } from '@jest/globals';

// Mock data
let authToken: string;
let stationId: string;
let pumpId: string;
let nozzleId: string;
let creditorId: string;

describe('Sales API', () => {
  // Setup: get auth token, create station, pump, and nozzle
  beforeAll(async () => {
    // Login as tenant owner
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@testcompany.com',
        password: 'Password123!'
      });
    
    authToken = loginRes.body.token;
    
    // Create test station
    const stationRes = await request(app)
      .post('/api/stations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Sales Test Station',
        address: '789 Sales St',
        city: 'Salesville'
      });
    
    stationId = stationRes.body.id;
    
    // Create test pump
    const pumpRes = await request(app)
      .post('/api/pumps')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        stationId,
        name: 'Test Pump',
        serialNumber: 'TP123'
      });
    
    pumpId = pumpRes.body.id;
    
    // Create test nozzle
    const nozzleRes = await request(app)
      .post('/api/nozzles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        pumpId,
        fuelType: 'petrol',
        initialReading: 1000
      });
    
    nozzleId = nozzleRes.body.id;

    // Set fuel price
    await request(app)
      .post('/api/fuel-prices')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        stationId,
        fuelType: 'petrol',
        pricePerUnit: 3.50,
        effectiveFrom: new Date().toISOString()
      });

    // Create a creditor for credit sales tests
    const creditorRes = await request(app)
      .post('/api/creditors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ partyName: 'Test Creditor' });

    creditorId = creditorRes.body.data?.id || creditorRes.body.id;
  });

  // Close database connection after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/sales', () => {
    it('should create a new sale record', async () => {
      const saleData = {
        stationId,
        nozzleId,
        cumulativeReading: 1010, // 10 liter sale
        cashReceived: 35, // $3.50 per liter * 10 liters
        creditGiven: 0
      };
      
      const res = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('stationId', stationId);
      expect(res.body).toHaveProperty('nozzleId', nozzleId);
      expect(res.body).toHaveProperty('saleVolume');
      expect(parseFloat(res.body.saleVolume)).toBeCloseTo(10, 1);
      expect(res.body).toHaveProperty('amount');
      expect(parseFloat(res.body.amount)).toBeCloseTo(35, 1);
    });

    it('should validate required fields', async () => {
      const incompleteSale = {
        stationId,
        nozzleId
        // Missing cumulativeReading and payment info
      };

      const res = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteSale);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should create a credit sale with creditor', async () => {
      const saleData = {
        stationId,
        nozzleId,
        cumulativeReading: 1020,
        cashReceived: 0,
        creditGiven: 35,
        creditPartyId: creditorId
      };

      const res = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('creditPartyId', creditorId);
    });

    it('should fail for invalid creditor id', async () => {
      const invalidSale = {
        stationId,
        nozzleId,
        cumulativeReading: 1030,
        cashReceived: 0,
        creditGiven: 40,
        creditPartyId: '00000000-0000-0000-0000-000000000000'
      };

      const res = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSale);

      expect(res.status).not.toBe(201);
    });
  });

  describe('GET /api/sales', () => {
    it('should return all sales', async () => {
      const res = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter sales by station', async () => {
      const res = await request(app)
        .get(`/api/sales?stationId=${stationId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All sales should belong to this station
      res.body.forEach((sale: any) => {
        expect(sale.stationId).toBe(stationId);
      });
    });

    it('should filter sales by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const res = await request(app)
        .get(`/api/sales?startDate=${today}&endDate=${today}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All sales should have today's date
      res.body.forEach((sale: any) => {
        const saleDate = new Date(sale.recordedAt).toISOString().split('T')[0];
        expect(saleDate).toBe(today);
      });
    });
  });
});