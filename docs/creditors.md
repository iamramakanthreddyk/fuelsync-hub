# Creditor Management

## Overview
The Creditor Management system allows tracking of customers who purchase fuel on credit. It supports full CRUD operations for creditors and payment settlement.

## Features
- Create, read, update creditors
- Record payments from creditors
- Track payment history
- Manage credit balances

## API Endpoints

### Creditors
- `POST /api/creditors` - Create a new creditor
- `GET /api/creditors` - Get all creditors
- `GET /api/creditors/:id` - Get creditor by ID
- `PATCH /api/creditors/:id` - Update creditor

### Payments
- `POST /api/creditors/:id/payments` - Record a payment from a creditor
- `GET /api/creditors/:id/payments` - Get payment history for a creditor

## Payment Methods
The system supports the following payment methods:
- `cash` - Cash payment
- `bank_transfer` - Bank transfer
- `check` - Check/cheque payment
- `upi` - Unified Payment Interface
- `credit_card` - Credit card payment
- `debit_card` - Debit card payment

## Example Usage

### Create a Creditor
```http
POST /api/creditors
Content-Type: application/json
Authorization: Bearer <token>

{
  "stationId": "<station-id>",
  "partyName": "ABC Trucking Company",
  "contactPerson": "John Smith",
  "contactPhone": "555-123-4567",
  "email": "john@abctrucking.com",
  "address": "123 Main St, Anytown, USA",
  "creditLimit": 5000,
  "notes": "Regular customer, payment terms net 30"
}
```

### Record a Payment
```http
POST /api/creditors/550e8400-e29b-41d4-a716-446655440000/payments
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 500,
  "paymentMethod": "upi",
  "referenceNumber": "UPI-2023-001",
  "notes": "Payment via UPI for June fuel purchases"
}
```

## Database Schema

### creditors table
```sql
CREATE TABLE creditors (
  id UUID PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES stations(id),
  party_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  credit_limit DECIMAL(10,2),
  running_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### credit_payments table
```sql
CREATE TABLE credit_payments (
  id UUID PRIMARY KEY,
  creditor_id UUID NOT NULL REFERENCES creditors(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method creditor_payment_method NOT NULL,
  reference_number VARCHAR(100),
  recorded_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_payment_amount CHECK (amount > 0)
);
```

### creditor_payment_method enum
```sql
CREATE TYPE creditor_payment_method AS ENUM (
  'cash', 
  'bank_transfer', 
  'check', 
  'upi', 
  'credit_card', 
  'debit_card'
);
```