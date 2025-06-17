// src/server.ts
import { Server } from 'http';
import app from './app';
import { config } from './config/environment';
import pool from './config/database';

let server: Server;

const startServer = () => {
  server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`API docs → http://localhost:${config.port}/api-docs`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    // Close server & exit process
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    if (server) {
      server.close(async () => {
        console.log('Server closed.');
        await pool.end();
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

startServer();
