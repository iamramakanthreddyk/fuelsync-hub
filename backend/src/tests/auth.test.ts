import request from 'supertest';
import app from '../app';
import pool from '../config/database';
import { describe, it } from 'node:test';
import { afterAll, beforeAll, expect } from '@jest/globals';

// Mock data
const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
};

const testTenant = {
  name: 'Test Company',
  email: 'owner@testcompany.com',
  password: 'Password123!',
  subscriptionPlan: 'basic',
};

describe('Authentication API', () => {
  // Close database connection after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should create a new tenant and return 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testTenant);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Tenant created successfully');
      expect(res.body).toHaveProperty('tenant');
      expect(res.body.tenant).toHaveProperty('id');
      expect(res.body.tenant).toHaveProperty('name', testTenant.name);
      expect(res.body.tenant).toHaveProperty('subscriptionPlan', testTenant.subscriptionPlan);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Incomplete Company',
          email: 'incomplete@test.com'
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return token', async () => {
      // First try logging in with the tenant owner we created
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testTenant.email,
          password: testTenant.password
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testTenant.email);
      expect(res.body.user).toHaveProperty('role', 'owner');
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword123!'
        });
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});