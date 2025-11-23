import app from './app';
import config from './config/env';
import connectDatabase from './config/database';
import { initializeFirebase } from './config/firebase';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting Spurz.ai Backend Server...');
    
    // Initialize Firebase Admin SDK
    initializeFirebase();
    
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server - bind to 0.0.0.0 to accept connections from all interfaces
    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🌐 Health check: http://localhost:${config.port}/health`);
      logger.info(`🌐 Network access: http://172.20.10.2:${config.port}/health`);
      logger.info(`📚 API docs: http://localhost:${config.port}/`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
