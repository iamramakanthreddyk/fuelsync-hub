// backend/start-server.js
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.PORT = 3001;
process.env.NODE_ENV = 'development';

// Start the server
console.log('Starting backend server on port 3001...');
const server = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: 3001,
    NODE_ENV: 'development'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
});