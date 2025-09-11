import { db } from './firebase';
import { logger } from '../utils/logger';

export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    await db.collection('_health').doc('test').set({
      timestamp: new Date(),
      status: 'healthy'
    });

    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw new Error('Database initialization failed');
  }
}
