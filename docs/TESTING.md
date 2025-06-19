# 🧪 TESTING.md — Running Tests Safely in FuelSync Hub

This guide outlines the correct way to run backend tests using a **local PostgreSQL database** instead of a remote Azure server.

---

## ❌ Why NOT Azure for Tests?

| Problem                    | Reason                                 |
| -------------------------- | -------------------------------------- |
| Remote access errors       | CI/CD or agents can't reach Azure host |
| Risk of data corruption    | Tests may mutate real production data  |
| Firewall & IP restrictions | Local/dev environments may be blocked  |
| Slower execution           | Latency from cloud DB                  |

---

## ✅ Recommended Test Database Setup

Run a local PostgreSQL container with the required credentials:

### 1. Start Local Postgres via Docker

```bash
docker run --name fuelsync-test-db -p 5433:5432 \
  -e POSTGRES_DB=fuelsync_test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:14
```

### 2. Set Test Environment Variables

**Option A: Environment Variables (Recommended)**

```bash
# Unix/Linux/macOS
export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=fuelsync_test
export DB_SSL=false
export NODE_ENV=test

# Windows PowerShell
$env:DB_HOST="localhost"
$env:DB_PORT="5433"
$env:DB_USER="postgres"
$env:DB_PASSWORD="postgres"
$env:DB_NAME="fuelsync_test"
$env:DB_SSL="false"
$env:NODE_ENV="test"

# Windows CMD
set DB_HOST=localhost
set DB_PORT=5433
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_NAME=fuelsync_test
set DB_SSL=false
set NODE_ENV=test
```

**Option B: .env.test File (Optional)**

If you prefer using a .env.test file, create:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fuelsync_test
DB_SSL=false
NODE_ENV=test
```

Then load it in your test setup:
```ts
// Only if using .env.test approach
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });
}
```

---

## 🧪 Running Tests

### Setup Test Database

```bash
# Set test environment variables (see above)
# Then setup test database
npm run db:setup
```

### Run Tests

```bash
npm test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Test-Specific Commands

```bash
# Test database operations
npm run db check      # Test connection
npm run db verify     # Verify test data
npm run db reset      # Reset test database
```

---

## 🧹 Teardown (Optional)

After running tests:

```bash
docker stop fuelsync-test-db
docker rm fuelsync-test-db
```

---

## 🔐 Security Guidelines

* NEVER point to production or Azure DB for tests
* Always use separate test database (different port/name)
* Reset the DB before/after tests if needed
* CI/CD runners should spin up local containers or use ephemeral test DBs

---

## 🚀 CI/CD Integration

For automated testing environments:

```yaml
# Example GitHub Actions
- name: Start PostgreSQL
  run: |
    docker run --name postgres-test -p 5433:5432 \
      -e POSTGRES_DB=fuelsync_test \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -d postgres:14

- name: Run Tests
  env:
    DB_HOST: localhost
    DB_PORT: 5433
    DB_NAME: fuelsync_test
    DB_USER: postgres
    DB_PASSWORD: postgres
    DB_SSL: false
    NODE_ENV: test
  run: |
    npm run db:setup
    npm test
```

---

## 📌 Best Practices

When running tests:

* Use environment variables for configuration
* Use separate test database (different port: 5433)
* Expect the test DB to be available at `localhost:5433`
* Confirm that the `fuelsync_test` database exists
* Reset database state between test suites if needed

---

## 🔍 Debugging Tests

```bash
# Check test database connection
DB_PORT=5433 DB_NAME=fuelsync_test npm run db:check

# Verify test data
DB_PORT=5433 DB_NAME=fuelsync_test npm run db:verify

# Reset test database
DB_PORT=5433 DB_NAME=fuelsync_test npm run db:reset
```