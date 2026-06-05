import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

let mongoClient = null;
let db = null;

export const connectMongo = async () => {
  if (db) return db;
  if (!mongoUri) {
    console.error('[MongoDB Error] MONGODB_URI or MONGODB_URL is missing from environment variables.');
    return null;
  }

  let retries = 3;
  while (retries > 0) {
    try {
      console.log(`[MongoDB Connection Attempt] Connecting to MongoDB... Attempts left: ${retries}`);
      mongoClient = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000, // 5 seconds connection timeout
      });
      await mongoClient.connect();
      db = mongoClient.db();
      console.log('[MongoDB Connected] Connection established successfully.');
      return db;
    } catch (err) {
      retries--;
      console.error(`[MongoDB Connection Retry Warning] Attempt failed. Error: ${err.message}`);
      if (retries === 0) {
        throw new Error(`Failed to connect to MongoDB after 3 attempts: ${err.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const getMongoDb = () => db;

export const closeMongo = async () => {
  if (mongoClient) {
    await mongoClient.close();
    db = null;
    mongoClient = null;
    console.log('[MongoDB Connection Closed] Connection closed gracefully.');
  }
};
