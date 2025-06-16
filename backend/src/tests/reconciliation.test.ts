import request from 'supertest';
import app from '../server';
import pool from '../config/database';

// Mock data
let authToken: string;
let stationId: string;
let todaySales: {
  totalSales: number;
  cashTotal: number;
  creditTotal: number;
};

describe('Reconciliation API', () => {
  // Setup: get auth token and station ID
  beforeAll(async () => {
    // Login as tenant owner
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@testcompany.com',
        password: 'Password123!'
      });
    
    authToken = loginRes.body.token;
    
    // Get an existing station with sales
    const stationsRes = await request(app)
      .get('/api/stations')
      .set('Authorization', `Bearer ${authToken}`);
    
    if (stationsRes.body.length > 0) {
      stationId = stationsRes.body[0].id;
      
      // Get today's sales totals
      const today = new Date().toISOString().split('T')[0];
      const totalsRes = await request(app)
        .get(`/api/reconciliations/daily-totals?stationId=${stationId}&date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      todaySales = totalsRes.body;
    } else {
      // If no stations, create one with sales
      const stationRes = await request(app)
        .post('/api/stations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Reconciliation Test Station',
          address: '123 Reconcile St',
          city: 'ReconcileCity'
        });
      
      stationId = stationRes.body.id;
      
      // Create pump and nozzle
      const pumpRes = await request(app)
        .post('/api/pumps')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stationId,
          name: 'Recon Pump'
        });
      
      const nozzleRes = await request(app)
        .post('/api/nozzles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pumpId: pumpRes.body.id,
          fuelType: 'diesel',
          initialReading: 2000
        });
      
      // Set fuel price
      await request(app)
        .post('/api/fuel-prices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stationId,
          fuelType: 'diesel',
          pricePerUnit: 3.25,
          effectiveFrom: new Date().toISOString()
        });
      
      // Create a sale
      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stationId,
          nozzleId: nozzleRes.body.id,
          cumulativeReading: 2020, // 20 liter sale
          cashReceived: 65, // $3.25 per liter * 20 liters
          creditGiven: 0
        });
      
      // Get today's sales totals
      const today = new Date().toISOString().split('T')[0];
      const totalsRes = await request(app)
        .get(`/api/reconciliations/daily-totals?stationId=${stationId}&date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      todaySales = totalsRes.body;
    }
  });

  // Close database connection after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/reconciliations', () => {
    it('should create a new reconciliation', async () => {
      // Only proceed if we have sales to reconcile
      if (todaySales.totalSales > 0) {
        const today = new Date().toISOString().split('T')[0];
        
        const reconciliationData = {
          stationId,
          date: today,
          cardTotal: todaySales.totalSales * 0.2, // 20% card
          upiTotal: todaySales.totalSales * 0.1, // 10% UPI
          notes: 'Test reconciliation'
        };
        
        const res = await request(app)
          .post('/api/reconciliations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(reconciliationData);
        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('stationId', stationId);
        expect(res.body).toHaveProperty('date', today);
        expect(res.body).toHaveProperty('totalSales');
        expect(parseFloat(res.body.totalSales)).toBeCloseTo(todaySales.totalSales, 1);
        expect(res.body).toHaveProperty('cashTotal');
        expect(parseFloat(res.body.cashTotal)).toBeCloseTo(todaySales.cashTotal, 1);
        expect(res.body).toHaveProperty('creditTotal');
        expect(parseFloat(res.body.creditTotal)).toBeCloseTo(todaySales.creditTotal, 1);
        expect(res.body).toHaveProperty('cardTotal');
        expect(parseFloat(res.body.cardTotal)).toBeCloseTo(todaySales.totalSales * 0.2, 1);
        expect(res.body).toHaveProperty('upiTotal');
        expect(parseFloat(res.body.upiTotal)).toBeCloseTo(todaySales.totalSales * 0.1, 1);
      } else {
        console.log('Skipping reconciliation test - no sales to reconcile');
      }
    });

    it('should validate payment totals', async () => {
      // Only proceed if we have sales to reconcile
      if (todaySales.totalSales > 0) {
        const today = new Date().toISOString().split('T')[0];
        
        const invalidReconciliation = {
          stationId,
          date: today,
          cardTotal: todaySales.totalSales, // This makes total payments exceed total sales
          upiTotal: todaySales.totalSales
        };
        
        const res = await request(app)
          .post('/api/reconciliations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidReconciliation);
        
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
      } else {
        console.log('Skipping validation test - no sales to reconcile');
      }
    });
  });

  describe('GET /api/reconciliations', () => {
    it('should return all reconciliations', async () => {
      const res = await request(app)
        .get('/api/reconciliations')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter reconciliations by station', async () => {
      const res = await request(app)
        .get(`/api/reconciliations?stationId=${stationId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // All reconciliations should belong to this station
      res.body.forEach((rec: any) => {
        expect(rec.stationId).toBe(stationId);
      });
    });
  });
});