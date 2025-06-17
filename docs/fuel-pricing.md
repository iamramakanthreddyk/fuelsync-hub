# Fuel Price Management

## Overview
The Fuel Price Management system allows station owners and managers to set and track fuel prices over time. It supports historical price tracking, which is essential for accurate sales reporting and analysis.

## Features
- Create new fuel prices with effective dates
- Retrieve current fuel prices for a station
- View historical fuel prices
- Get fuel price at a specific date
- Automatic tracking of price change history

## API Endpoints

### Fuel Prices
- `POST /api/fuel-prices` - Create a new fuel price
- `GET /api/fuel-prices/current` - Get current fuel prices for a station
- `GET /api/fuel-prices/history` - Get fuel price history for a station
- `GET /api/fuel-prices/:id` - Get fuel price by ID
- `GET /api/fuel-prices/at-date` - Get fuel price at a specific date

## Fuel Types
The system supports the following fuel types:
- `petrol` - Regular petrol/gasoline
- `diesel` - Diesel fuel
- `premium` - Premium petrol/gasoline
- `super` - Super premium petrol/gasoline
- `cng` - Compressed Natural Gas
- `lpg` - Liquefied Petroleum Gas

## Historical Price Tracking
When a new fuel price is created, the system automatically:
1. Sets the new price as the current price
2. Updates the previous price's effective_to date to the new price's effective_from date
3. Maintains a complete history of all price changes

This allows for accurate reporting and analysis of sales at different price points over time.

## Example Usage

### Create a New Fuel Price
```http
POST /api/fuel-prices
Content-Type: application/json
Authorization: Bearer <token>

{
  "stationId": "550e8400-e29b-41d4-a716-446655440000",
  "fuelType": "petrol",
  "pricePerUnit": 3.99,
  "effectiveFrom": "2023-06-15T08:00:00Z",
  "notes": "Price increase due to market conditions"
}
```

### Get Current Fuel Prices
```http
GET /api/fuel-prices/current?stationId=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

### Get Fuel Price History
```http
GET /api/fuel-prices/history?stationId=550e8400-e29b-41d4-a716-446655440000&fuelType=petrol&startDate=2023-01-01&endDate=2023-12-31
Authorization: Bearer <token>
```

### Get Fuel Price at a Specific Date
```http
GET /api/fuel-prices/at-date?stationId=550e8400-e29b-41d4-a716-446655440000&fuelType=petrol&date=2023-05-15T12:00:00Z
Authorization: Bearer <token>
```

## Database Schema

### fuel_price_history table
```sql
CREATE TABLE fuel_price_history (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    fuel_type fuel_type NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price_per_unit > 0)
);
```

### fuel_type enum
```sql
CREATE TYPE fuel_type AS ENUM (
  'petrol', 
  'diesel', 
  'premium', 
  'super', 
  'cng', 
  'lpg'
);
```