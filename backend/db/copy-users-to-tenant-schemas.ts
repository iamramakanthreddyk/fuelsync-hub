import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function copyUsersToTenantSchemas() {
  console.log('Copying users to tenant schemas...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Get tenant IDs
    const tenantsResult = await client.query('SELECT id, name FROM tenants');
    const tenants = tenantsResult.rows;
    
    console.log(`Found ${tenants.length} tenants`);
    
    // Copy users for each tenant
    for (const tenant of tenants) {
      const tenantId = tenant.id;
      const tenantName = tenant.name;
      const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      
      console.log(`\nCopying users for tenant ${tenantName} (${tenantId}) to schema ${schemaName}`);
      
      try {
        // Start transaction
        await client.query('BEGIN');
        
        // Check if schema exists
        const schemaResult = await client.query(`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name = $1
        `, [schemaName]);
        
        if (schemaResult.rows.length === 0) {
          console.error(`❌ Schema ${schemaName} does not exist!`);
          await client.query('ROLLBACK');
          continue;
        }
        
        // Get users for this tenant
        const usersResult = await client.query(`
          SELECT * FROM public.users 
          WHERE tenant_id = $1
        `, [tenantId]);
        
        const users = usersResult.rows;
        console.log(`Found ${users.length} users for tenant ${tenantName}`);
        
        // Copy each user to tenant schema
        for (const user of users) {
          // Check if user already exists in tenant schema
          const existingUserResult = await client.query(`
            SELECT 1 FROM "${schemaName}".users 
            WHERE id = $1
          `, [user.id]);
          
          if (existingUserResult.rows.length > 0) {
            console.log(`User ${user.email} already exists in schema ${schemaName}`);
            continue;
          }
          
          // Insert user into tenant schema
          await client.query(`
            INSERT INTO "${schemaName}".users (
              id, email, password_hash, role, first_name, last_name, 
              tenant_id, phone, active, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            )
          `, [
            user.id, user.email, user.password_hash, user.role, 
            user.first_name, user.last_name, user.tenant_id, 
            user.phone, user.active, user.created_at, user.updated_at
          ]);
          
          console.log(`✅ Copied user ${user.email} to schema ${schemaName}`);
        }
        
        // Commit transaction
        await client.query('COMMIT');
        console.log(`✅ Successfully copied users for tenant ${tenantName}`);
      } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK');
        console.error(`❌ Error copying users for tenant ${tenantName}:`, error);
      }
    }
    
    client.release();
    console.log('\nUser copying completed!');
  } catch (error) {
    console.error('Error copying users to tenant schemas:', error);
  } finally {
    await pool.end();
  }
}

copyUsersToTenantSchemas().catch(console.error);