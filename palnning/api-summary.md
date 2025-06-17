# FuelSync Hub - Daily Nozzle Reading & Dashboard APIs

## Nozzle Reading APIs

### Get Previous Day's Nozzle Readings
```
GET /stations/{stationId}/nozzle-readings/previous
```
- Returns previous day's cumulative readings for all nozzles at a station.

### Get Current Fuel Prices
```
GET /stations/{stationId}/fuel-prices
```
- Returns current fuel prices for each nozzle/fuel type at a station.

### Submit Today's Nozzle Readings
```
POST /stations/{stationId}/nozzle-readings
Body: { readings: [{ nozzleId, reading }] }
```
- Submits today's readings, validates, stores readings, and creates sales records.

---

## Owner/Manager Dashboard API

### Get Dashboard KPIs & Trends
```
GET /dashboard?stationId={stationId}
```
- Returns today's fuel prices, sales summary, 7-day trend, payment breakdown, and top creditors.

---

## Security & Validation
- All endpoints require JWT authentication and permissions.
- Cumulative readings are validated to be >= previous day's value.
- All data is tenant-isolated and audit-logged.

---

See [openapi.yaml](../backend/openapi.yaml) for full schema and request/response details.
