import mongoose, { Connection } from 'mongoose';
import Config from './config';

let connection: Connection | null = null;

/**
 * Establish connection to MongoDB
 */
export async function connectDatabase(): Promise<void> {
  try {
    if (!Config.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(Config.MONGODB_URI);
    connection = mongoose.connection;

    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
    console.log('✓ Database disconnected');
  }
}

/**
 * Get the database connection
 */
export function getConnection(): Connection {
  if (!connection) {
    throw new Error('Database is not connected');
  }
  return connection;
}

export default {
  connectDatabase,
  disconnectDatabase,
  getConnection,
};
