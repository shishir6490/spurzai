import mongoose from 'mongoose';
import config from './env';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('✅ MongoDB connected successfully');
    if (mongoose.connection.db) {
      logger.info(`📊 Database: ${mongoose.connection.db.databaseName}`);
    }
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB error:', error);
});

export default connectDatabase;
