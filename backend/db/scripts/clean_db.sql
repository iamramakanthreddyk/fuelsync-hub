-- Clean all main tables in the public schema for a fresh start
TRUNCATE TABLE user_sessions, sales, nozzles, pumps, stations, user_stations, creditors, credit_payments, fuel_prices, day_reconciliations, users RESTART IDENTITY CASCADE;
