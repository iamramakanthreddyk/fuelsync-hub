# Tender Entry and Shift Management

## Overview
The Tender Entry and Shift Management system allows employees to track their work shifts and record tender entries (cash, card, UPI, credit) during their shifts. This system helps with cash drawer reconciliation and shift-close operations.

## Features
- Open and close shifts
- Record tender entries during shifts
- Track shift status and duration
- Generate shift summaries with tender totals and sales data

## API Endpoints

### Shifts
- `POST /api/tender/shifts` - Open a new shift
- `POST /api/tender/shifts/:id/close` - Close a shift
- `GET /api/tender/shifts/active` - Get current user's active shift
- `GET /api/tender/shifts/:id` - Get shift by ID
- `GET /api/tender/shifts` - Get shifts with optional filters
- `GET /api/tender/shifts/:shiftId/summary` - Get shift summary

### Tender Entries
- `POST /api/tender/tender-entries` - Record a tender entry
- `GET /api/tender/shifts/:shiftId/tender-entries` - Get tender entries for a shift

## Shift Workflow
1. Employee opens a shift at the beginning of their work period
2. During the shift, tender entries are recorded for different payment methods
3. At the end of the shift, the employee closes the shift with the closing cash amount
4. Managers can view shift summaries for reconciliation

## Tender Types
The system supports the following tender types:
- `cash` - Cash payments
- `card` - Card payments (credit/debit)
- `upi` - Unified Payment Interface payments
- `credit` - Credit sales

## Example Usage

### Open a Shift
```http
POST /api/tender/shifts
Content-Type: application/json
Authorization: Bearer <token>

{
  "stationId": "550e8400-e29b-41d4-a716-446655440000",
  "openingCash": 1000,
  "notes": "Morning shift"
}
```

### Record a Tender Entry
```http
POST /api/tender/tender-entries
Content-Type: application/json
Authorization: Bearer <token>

{
  "shiftId": "550e8400-e29b-41d4-a716-446655440001",
  "tenderType": "card",
  "amount": 250.50,
  "referenceNumber": "CARD-2023-001",
  "notes": "Visa payment"
}
```

### Close a Shift
```http
POST /api/tender/shifts/550e8400-e29b-41d4-a716-446655440001/close
Content-Type: application/json
Authorization: Bearer <token>

{
  "closingCash": 1250.75,
  "notes": "Shift completed successfully"
}
```

### Get Shift Summary
```http
GET /api/tender/shifts/550e8400-e29b-41d4-a716-446655440001/summary
Authorization: Bearer <token>
```

## Database Schema

### shifts table
```sql
CREATE TABLE shifts (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status shift_status NOT NULL DEFAULT 'open',
    opening_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
    closing_cash DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### tender_entries table
```sql
CREATE TABLE tender_entries (
    id UUID PRIMARY KEY,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    tender_type tender_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_tender_amount CHECK (amount > 0)
);
```

### shift_status enum
```sql
CREATE TYPE shift_status AS ENUM ('open', 'closed', 'reconciled');
```

### tender_type enum
```sql
CREATE TYPE tender_type AS ENUM ('cash', 'card', 'upi', 'credit');
```