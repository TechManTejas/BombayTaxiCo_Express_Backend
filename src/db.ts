import mongoose from 'mongoose';
import { createStaffUserIfNotExists } from './controllers/admin.controller';

const MONGODB_URI = `${process.env.MONGODB_URI}` || 'default_connection_string';

// Enhanced connection options with connection pooling
const connectionOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  retryWrites: true, // Retry write operations if they fail
  retryReads: true, // Retry read operations if they fail
  readPreference: 'primary', // Prefer primary reads
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 10000
  }
};

// Connection retry logic
const connectWithRetry = async (maxRetries = 5, retryDelay = 5000): Promise<void> => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      console.log(`MongoDB connection attempt ${attempt + 1}/${maxRetries}`);
      
      await mongoose.connect(MONGODB_URI, connectionOptions);
      console.log('Successfully connected to MongoDB');
      return;
      
    } catch (error) {
      attempt++;
      console.error(`MongoDB connection attempt ${attempt} failed:`, error);
      
      if (attempt >= maxRetries) {
        console.error('Max connection retries reached. Exiting...');
        process.exit(1);
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Initialize connection with retry
connectWithRetry();

const db = mongoose.connection;

// Enhanced error handling with reconnection logic
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  
  // Attempt to reconnect on connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    console.log('Attempting to reconnect to MongoDB...');
    setTimeout(() => connectWithRetry(), 5000);
  }
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

db.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

db.once('open', () => {
  console.log('Connected to MongoDB');

  const username = 'SUPERADMIN';
  const password = 'SUPERADMIN';

  createStaffUserIfNotExists(username, password)
    .then((createdUser) => {
      console.log('User created or already exists:', createdUser);
    })
    .catch((error) => {
      console.error('Error creating user:', error.message);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export default mongoose;
