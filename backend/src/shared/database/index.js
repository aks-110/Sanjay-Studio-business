import { supabase } from './client.js';
import { connectMongo, closeMongo, getMongoDb } from './mongoClient.js';

export const initDatabase = async () => {
  console.log('[Database Initialization] Starting connections...');
  
  // Verify Supabase connectivity
  try {
    const { error } = await supabase.from('roles').select('id').limit(1);
    if (error) throw error;
    console.log('[Supabase Connected] Successfully verified Supabase connection.');
  } catch (err) {
    console.error('[Supabase Connection Error] Could not connect to Supabase:', err.message);
    throw err;
  }

  // Verify MongoDB connectivity
  try {
    await connectMongo();
  } catch (err) {
    console.error('[MongoDB Connection Error] Could not connect to MongoDB:', err.message);
    throw err;
  }
  
  console.log('[Database Initialization] Database verification complete.');
};

// Graceful Shutdown hooks
export const closeDatabase = async () => {
  console.log('[Database Shutdown] Closing database connections...');
  await closeMongo();
  console.log('[Database Shutdown] Database connections closed.');
};

// Health Check monitoring
export const getDatabaseHealth = async () => {
  const health = {
    supabase: { status: 'down', latency: null },
    mongodb: { status: 'down', latency: null }
  };

  // Check Supabase
  const supabaseStart = Date.now();
  try {
    const { error } = await supabase.from('roles').select('id').limit(1);
    if (error) throw error;
    health.supabase.status = 'up';
    health.supabase.latency = `${Date.now() - supabaseStart}ms`;
  } catch (err) {
    health.supabase.status = 'down';
    health.supabase.error = err.message;
  }

  // Check MongoDB
  const mongoStart = Date.now();
  try {
    const db = getMongoDb();
    if (!db) throw new Error('MongoDB client is not connected');
    await db.command({ ping: 1 });
    health.mongodb.status = 'up';
    health.mongodb.latency = `${Date.now() - mongoStart}ms`;
  } catch (err) {
    health.mongodb.status = 'down';
    health.mongodb.error = err.message;
  }

  return health;
};

// Deprecated interfaces to ensure clean transition
export const dbQuery = {
  run() { throw new Error('dbQuery is deprecated. Use Repository Pattern instead.'); },
  all() { throw new Error('dbQuery is deprecated. Use Repository Pattern instead.'); },
  get() { throw new Error('dbQuery is deprecated. Use Repository Pattern instead.'); }
};

export const mongoMock = {
  collection() { throw new Error('mongoMock is deprecated. Use Repository Pattern instead.'); }
};
