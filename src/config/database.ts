import mongoose, { Connection } from 'mongoose';
import Config from './config';

let connection: Connection | null = null;
let transactionSupportChecked = false;
let transactionSupported = false;

async function determineTransactionSupport(): Promise<void> {
  if (transactionSupportChecked) {
    return;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await session.commitTransaction();
    transactionSupported = true;
  } catch (error) {
    console.warn('⚠️ MongoDB transactions not supported:', error instanceof Error ? error.message : String(error));
    transactionSupported = false;
  } finally {
    await session.endSession();
    transactionSupportChecked = true;
  }
}

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
    await determineTransactionSupport();

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

export function getCompanyConnection(companyId: string): Connection {
  return getConnection().useDb(companyId, { useCache: true });
}

export function isTransactionSupported(): boolean {
  if (!transactionSupportChecked) {
    throw new Error('Transaction support has not been initialized yet. Call connectDatabase() first.');
  }
  return transactionSupported;
}

export default {
  connectDatabase,
  disconnectDatabase,
  getConnection,
  getCompanyConnection,
  isTransactionSupported,
};
