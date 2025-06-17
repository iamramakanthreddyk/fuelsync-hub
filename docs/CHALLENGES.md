# Development Challenges and Solutions

## Database Issues

### 1. Decimal Precision in Sales Calculations

**Problem:** 
- Sales table validation constraint `amount = sale_volume * fuel_price` was failing
- PostgreSQL decimal multiplication produced rounding differences
- JavaScript decimal calculations didn't match PostgreSQL's precision

**Solution:**
1. Changed the schema to use `NUMERIC` type with appropriate precision:
   ```sql
   sale_volume NUMERIC(12,3)      -- More precision for volume
   fuel_price NUMERIC(10,3)       -- More precision for price
   amount NUMERIC(10,2) GENERATED -- Computed column
   ```

2. Created a PostgreSQL function for consistent calculation:
   ```sql
   CREATE OR REPLACE FUNCTION calc_sale_amount(volume NUMERIC, price NUMERIC) 
   RETURNS NUMERIC AS $$
   BEGIN
       RETURN ROUND(volume * price, 2);
   END;
   $$ LANGUAGE plpgsql IMMUTABLE;
   ```

3. Made amount a computed column to ensure consistency:
   ```sql
   amount NUMERIC(10,2) GENERATED ALWAYS AS (calc_sale_amount(sale_volume, fuel_price)) STORED
   ```

4. Added validation for volume readings with small tolerance:
   ```sql
   CONSTRAINT valid_sale_volume CHECK (ABS(sale_volume - (cumulative_reading - previous_reading)) < 0.001)
   ```

**Benefits:**
- Consistent calculations between app and database
- No more rounding issues or validation failures
- Better data integrity with computed columns
- All calculations handled by PostgreSQL

### 2. Seed Data Consistency

**Problem:**
- Data seeding was failing due to invalid foreign key references
- Inconsistent data between related tables
- Transaction rollbacks on constraint violations

**Solution:**
1. Used proper transaction handling in seed script
2. Let PostgreSQL handle all numeric calculations
3. Used proper type casting for all values
4. Added data validation in CTEs before insertion

**Key Learning:**
When dealing with financial calculations:
1. Use `NUMERIC` instead of `DECIMAL`
2. Let the database handle calculations
3. Use computed columns where possible
4. Add small tolerances for floating-point comparisons
5. Always validate both the computed values and the relationships between readings

## Best Practices Established

1. **Data Types:**
   - Use `NUMERIC` for financial calculations
   - Specify precision and scale explicitly
   - Use higher precision internally, round for display

2. **Validation:**
   - Add constraints with small tolerances
   - Validate relationships between fields
   - Use triggers or computed columns for derived values

3. **Schema Design:**
   - Define proper constraints
   - Use appropriate indexes
   - Document precision requirements

4. **Development Process:**
   - Always test with real-world data volumes
   - Use transactions for data consistency
   - Add proper error handling and logging
   - Document solutions for future reference
