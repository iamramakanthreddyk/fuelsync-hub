// scripts/db.ts - Unified database management
import { execSync } from 'child_process';
import path from 'path';

const BACKEND_DIR = path.join(__dirname, '..', 'backend');

interface DbCommand {
  name: string;
  description: string;
  script: string;
}

const commands: DbCommand[] = [
  {
    name: 'setup',
    description: 'Complete database setup with schema and seed data',
    script: 'npm run db:setup'
  },
  {
    name: 'reset',
    description: 'Reset database to clean state',
    script: 'npm run db:reset'
  },
  {
    name: 'check',
    description: 'Test database connection',
    script: 'npm run db:check'
  },
  {
    name: 'fix',
    description: 'Fix data relationships',
    script: 'npm run db:fix'
  },
  {
    name: 'verify',
    description: 'Verify database setup',
    script: 'npm run db:verify'
  }
];

function showHelp() {
  console.log('🗄️  FuelSync Database Management\n');
  console.log('Usage: npm run db <command>\n');
  console.log('Available commands:');
  
  commands.forEach(cmd => {
    console.log(`  ${cmd.name.padEnd(10)} - ${cmd.description}`);
  });
  
  console.log('\nExamples:');
  console.log('  npm run db setup   # Initial setup');
  console.log('  npm run db fix     # Fix relationships');
  console.log('  npm run db check   # Test connection');
}

function runCommand(commandName: string) {
  const command = commands.find(cmd => cmd.name === commandName);
  
  if (!command) {
    console.error(`❌ Unknown command: ${commandName}`);
    showHelp();
    process.exit(1);
  }
  
  console.log(`🔧 Running: ${command.description}`);
  
  try {
    execSync(command.script, {
      cwd: BACKEND_DIR,
      stdio: 'inherit'
    });
    console.log(`✅ ${command.description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${command.description} failed`);
    process.exit(1);
  }
}

// Main execution
const commandName = process.argv[2];

if (!commandName || commandName === 'help' || commandName === '--help') {
  showHelp();
} else {
  runCommand(commandName);
}