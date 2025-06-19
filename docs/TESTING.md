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
docker run --name fuelsync-test-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:14
```

### 2. Create a `.env.test` File

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fuelsync_test
DB_SSL=false
```

### 3. Configure Tests to Load `.env.test`

Ensure Jest or your test runner loads the environment properly:

```ts
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });
```

---

## 🧪 Running Tests

Use the following commands:

```bash
npm run db:migrate -- --env=test
npm run db:seed -- --env=test
npm test
```

Make sure your scripts reference the right environment.

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
* Always use a `.env.test` and reset the DB before/after tests if needed
* CI/CD runners should spin up local containers or use ephemeral test DBs

---

## 📌 Codex Note

When Codex or any other AI agent runs tests or migrations, it should:

* Use `.env.test` instead of default `.env`
* Expect the test DB to be available at `localhost:5432`
* Confirm that the `fuelsync_test` schema exists or create it via migration
