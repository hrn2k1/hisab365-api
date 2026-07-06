import mongoose, { Connection } from 'mongoose';
import dns from 'node:dns';
import Config from './config';

let connection: Connection | null = null;
let transactionSupportChecked = false;
let transactionSupported = false;

let dnsConfigured = false;

function configureDnsServers(): void {
  if (dnsConfigured) {
    return;
  }

  const customDnsServers = Config.DNS_SERVERS.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (customDnsServers.length > 0) {
    dns.setServers(customDnsServers);
    console.log(`Using custom DNS servers: ${customDnsServers.join(', ')}`);
  }

  dnsConfigured = true;
}

function isSrvLookupRefusedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const networkCode = (error as NodeJS.ErrnoException).code;
  const systemCall = (error as NodeJS.ErrnoException).syscall;

  return networkCode === 'ECONNREFUSED' && systemCall === 'querySrv';
}

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

    configureDnsServers();
    const activeDnsServers = dns.getServers();
    console.log(`MongoDB DNS resolvers in use: ${activeDnsServers.join(', ') || 'none'}`);

    let connectedWithFallback = false;

    try {
      await mongoose.connect(Config.MONGODB_URI);
    } catch (error) {
      if (isSrvLookupRefusedError(error) && Config.MONGODB_DIRECT_URI) {
        connectedWithFallback = true;
        console.warn('⚠️ SRV DNS lookup failed. Retrying with MONGODB_DIRECT_URI fallback...');
        await mongoose.connect(Config.MONGODB_DIRECT_URI);
      } else if (isSrvLookupRefusedError(error)) {
        throw new Error(
          'MongoDB SRV DNS lookup failed (querySrv ECONNREFUSED). Configure DNS_SERVERS (for example: 1.1.1.1,8.8.8.8) or set MONGODB_DIRECT_URI with a non-SRV connection string.',
        );
      } else {
        throw error;
      }
    }

    connection = mongoose.connection;
    await determineTransactionSupport();

    if (connectedWithFallback) {
      console.log('✓ Database connected successfully (direct URI fallback)');
    } else {
      console.log('✓ Database connected successfully');
    }
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
