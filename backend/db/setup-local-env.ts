import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default values
const defaults = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'fuelsync',
  DB_USER: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_SSL: 'false'
};

// Function to prompt for input with default value
function prompt(question: string, defaultValue: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${question} (default: ${defaultValue}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

async function setupLocalEnv() {
  console.log('Setting up local environment variables...');
  
  // Check if .env file exists
  const envPath = path.resolve(__dirname, '../.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Existing .env file found. We will update the database connection parameters.');
  } else {
    console.log('No .env file found. We will create a new one with default values.');
    // Copy from .env.example if it exists
    const examplePath = path.resolve(__dirname, '../.env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
    }
  }
  
  // Get database connection parameters
  console.log('\nPlease enter your database connection parameters:');
  const dbHost = await prompt('Database host', defaults.DB_HOST);
  const dbPort = await prompt('Database port', defaults.DB_PORT);
  const dbName = await prompt('Database name', defaults.DB_NAME);
  const dbUser = await prompt('Database user', defaults.DB_USER);
  const dbPassword = await prompt('Database password', defaults.DB_PASSWORD);
  const dbSsl = await prompt('Use SSL (true/false)', defaults.DB_SSL);
  
  // Update or add database connection parameters in .env content
  const envVars = {
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_NAME: dbName,
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    DB_SSL: dbSsl
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    // Check if the variable already exists in the .env file
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      // Replace existing value
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new variable
      envContent += `\n${key}=${value}`;
    }
  });
  
  // Write updated content to .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\nEnvironment variables updated successfully!');
  console.log(`Database connection parameters set to:\n`);
  console.log(`DB_HOST=${dbHost}`);
  console.log(`DB_PORT=${dbPort}`);
  console.log(`DB_NAME=${dbName}`);
  console.log(`DB_USER=${dbUser}`);
  console.log(`DB_PASSWORD=********`);
  console.log(`DB_SSL=${dbSsl}`);
  
  console.log('\nYou can now run the following commands:');
  console.log('1. npm run db:check - to test the database connection');
  console.log('2. npm run db:setup - to set up the database schema and seed data');
  
  rl.close();
}

setupLocalEnv().catch(console.error);