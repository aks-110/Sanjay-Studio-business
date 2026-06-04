import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../database.sqlite');
const MONGO_MOCK_PATH = join(__dirname, '../../mongo_mock.json');

// Initialize Relational DB (SQLite)
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Wrap db.run, db.all, db.get in Promises
export const dbQuery = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Initialize Mock MongoDB collections
let mongoData = {
  activity_logs: [],
  notifications: [],
  gallery_metadata: [],
  analytics_metrics: []
};

const loadMongoData = () => {
  if (fs.existsSync(MONGO_MOCK_PATH)) {
    try {
      const data = fs.readFileSync(MONGO_MOCK_PATH, 'utf8');
      mongoData = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse mock MongoDB file:', e);
    }
  } else {
    saveMongoData();
  }
};

const saveMongoData = () => {
  try {
    fs.writeFileSync(MONGO_MOCK_PATH, JSON.stringify(mongoData, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write mock MongoDB file:', e);
  }
};

export const mongoMock = {
  collection(name) {
    loadMongoData();
    if (!mongoData[name]) {
      mongoData[name] = [];
    }
    return {
      find(filter = {}) {
        return mongoData[name].filter(item => {
          for (const key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      findOne(filter = {}) {
        return mongoData[name].find(item => {
          for (const key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      insert(doc) {
        const newDoc = {
          _id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          ...doc
        };
        mongoData[name].push(newDoc);
        saveMongoData();
        return newDoc;
      },
      updateMany(filter, updateDoc) {
        let count = 0;
        mongoData[name].forEach(item => {
          let match = true;
          for (const key in filter) {
            if (item[key] !== filter[key]) {
              match = false;
              break;
            }
          }
          if (match) {
            Object.assign(item, updateDoc);
            count++;
          }
        });
        if (count > 0) saveMongoData();
        return { modifiedCount: count };
      },
      deleteOne(filter) {
        const index = mongoData[name].findIndex(item => {
          for (const key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
        if (index > -1) {
          mongoData[name].splice(index, 1);
          saveMongoData();
          return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
      }
    };
  }
};

// Seed & Database Initialization DDL
export const initDatabase = async () => {
  // 1. Create Tables
  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'Customer',
      permissions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      total_quantity INTEGER NOT NULL DEFAULT 0,
      available_quantity INTEGER NOT NULL DEFAULT 0,
      price_per_day REAL,
      sale_price REAL,
      status TEXT NOT NULL DEFAULT 'Available',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      photographer_id TEXT,
      service_type TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      total_price REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (photographer_id) REFERENCES users(id)
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS rentals (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      inventory_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      total_price REAL NOT NULL,
      deposit REAL NOT NULL DEFAULT 0.0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (inventory_id) REFERENCES inventory(id)
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      total_amount REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      inventory_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (inventory_id) REFERENCES inventory(id)
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_gateway_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      payment_method TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      payment_id TEXT,
      customer_id TEXT NOT NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      total_amount REAL NOT NULL,
      tax_amount REAL NOT NULL DEFAULT 0.0,
      status TEXT NOT NULL DEFAULT 'Unpaid',
      pdf_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES payments(id),
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS crm_entries (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      lead_status TEXT NOT NULL DEFAULT 'New',
      last_contact_date TEXT,
      notes TEXT,
      assigned_agent_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
    )
  `);

  await dbQuery.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )
  `);

  // 2. Seed Default Users if none exist
  const existingUsers = await dbQuery.get('SELECT COUNT(*) as count FROM users');
  if (existingUsers.count === 0) {
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('password123', salt);

    // Seed Admin
    await dbQuery.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin-uuid-1111',
      'admin@platform.com',
      passHash,
      'John',
      'Admin',
      '+1234567890',
      'Admin',
      JSON.stringify(['*'])
    ]);

    // Seed Photographer
    await dbQuery.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'photo-uuid-2222',
      'photographer@platform.com',
      passHash,
      'Alice',
      'Lens',
      '+1234567891',
      'Photographer',
      JSON.stringify(['bookings:read', 'bookings:write-status', 'gallery:write'])
    ]);

    // Seed Rental Manager
    await dbQuery.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'rental-uuid-3333',
      'rental@platform.com',
      passHash,
      'Bob',
      'Gear',
      '+1234567892',
      'Rental Manager',
      JSON.stringify(['rentals:read', 'rentals:write', 'inventory:read'])
    ]);

    // Seed Customer
    await dbQuery.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'cust-uuid-4444',
      'customer@platform.com',
      passHash,
      'Sarah',
      'Buyer',
      '+1234567893',
      'Customer',
      JSON.stringify(['products:read', 'gallery:read', 'bookings:create', 'bookings:read-own', 'rentals:create', 'rentals:read-own', 'orders:create', 'orders:read-own'])
    ]);

    console.log('Seeded initial users successfully.');
  }

  // 3. Seed Inventory if none exist
  const existingInventory = await dbQuery.get('SELECT COUNT(*) as count FROM inventory');
  if (existingInventory.count === 0) {
    const items = [
      // Stationery for sale
      {
        id: 'stationery-1',
        name: 'Premium Leather Sketchbook',
        sku: 'SKB-PRM-001',
        description: 'Hardcover bound A5 sketchbook with 180gsm cartridge paper.',
        category: 'Stationery',
        type: 'Sale',
        qty: 100,
        price_per_day: null,
        sale_price: 24.99
      },
      {
        id: 'stationery-2',
        name: 'Calligraphy Fountain Pen Set',
        sku: 'PEN-CAL-002',
        description: 'Classic wood fountain pen with 5 nib sizes and ink reservoir.',
        category: 'Stationery',
        type: 'Sale',
        qty: 50,
        price_per_day: null,
        sale_price: 39.50
      },
      {
        id: 'stationery-3',
        name: 'Metallic Gel Pen Pack (12 Colors)',
        sku: 'PEN-GEL-003',
        description: 'Smooth writing high-opacity metallic inks perfect for dark paper.',
        category: 'Stationery',
        type: 'Sale',
        qty: 200,
        price_per_day: null,
        sale_price: 12.99
      },
      // Camera rentals
      {
        id: 'camera-1',
        name: 'Sony Alpha 7 IV Mirrorless',
        sku: 'CAM-SON-74',
        description: '33MP full-frame mirrorless camera with high-speed autofocus.',
        category: 'Camera',
        type: 'Rental',
        qty: 5,
        price_per_day: 75.00,
        sale_price: null
      },
      {
        id: 'camera-2',
        name: 'Canon EOS R5 Full-Frame',
        sku: 'CAM-CAN-R5',
        description: '45MP photo quality with 8K video capture capabilities.',
        category: 'Camera',
        type: 'Rental',
        qty: 3,
        price_per_day: 95.00,
        sale_price: null
      },
      {
        id: 'lens-1',
        name: 'Sony FE 24-70mm f/2.8 GM II',
        sku: 'LNS-SON-2470',
        description: 'Premium G Master standard zoom lens for weddings and portraits.',
        category: 'Lens',
        type: 'Rental',
        qty: 8,
        price_per_day: 40.00,
        sale_price: null
      },
      {
        id: 'lighting-1',
        name: 'Profoto B10X Location Flash',
        sku: 'LGT-PRO-B10',
        description: '250Ws powerful off-camera flash with continuous modeling light.',
        category: 'Lighting',
        type: 'Rental',
        qty: 4,
        price_per_day: 55.00,
        sale_price: null
      }
    ];

    for (const item of items) {
      await dbQuery.run(`
        INSERT INTO inventory (id, name, sku, description, category, type, total_quantity, available_quantity, price_per_day, sale_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')
      `, [
        item.id,
        item.name,
        item.sku,
        item.description,
        item.category,
        item.type,
        item.qty,
        item.qty,
        item.price_per_day,
        item.sale_price
      ]);
    }
    console.log('Seeded inventory items successfully.');
  }

  // 4. Seed MongoDB mock collections if they are empty
  loadMongoData();
  if (mongoData.gallery_metadata.length === 0) {
    mongoData.gallery_metadata = [
      {
        _id: 'gal-1',
        photographerId: 'photo-uuid-2222',
        title: 'Sunset Beach Wedding',
        description: 'A romantic wedding photoshoot on the beaches of Maui during golden hour.',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        tags: ['wedding', 'beach', 'sunset', 'couple'],
        dimensions: { width: 1200, height: 800 },
        sizeBytes: 450000,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'gal-2',
        photographerId: 'photo-uuid-2222',
        title: 'Rustic Forest Wedding',
        description: 'Ethereal forest background featuring warm fairy lights and classic elegance.',
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        tags: ['wedding', 'forest', 'nature', 'lights'],
        dimensions: { width: 1200, height: 800 },
        sizeBytes: 520000,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'gal-3',
        photographerId: 'photo-uuid-2222',
        title: 'Modern Studio Portraiture',
        description: 'Sleek studio headshots focusing on lighting transitions and shadow styling.',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        tags: ['portrait', 'studio', 'lighting', 'fashion'],
        dimensions: { width: 1000, height: 1000 },
        sizeBytes: 380000,
        createdAt: new Date().toISOString()
      }
    ];
    saveMongoData();
    console.log('Seeded gallery metadata in MongoDB Mock.');
  }
};
