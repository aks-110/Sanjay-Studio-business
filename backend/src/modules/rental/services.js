import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const rentalService = {
  async createRental(customerId, { inventory_id, start_date, end_date, total_price, deposit }) {
    // 1. Verify item availability
    const item = await dbQuery.get('SELECT available_quantity, name FROM inventory WHERE id = ? AND type = "Rental"', [inventory_id]);
    if (!item) {
      throw new Error('Equipment not found or is not available for rental');
    }

    if (item.available_quantity < 1) {
      throw new Error(`Equipment "${item.name}" is currently out of stock`);
    }

    const id = uuidv4();

    // 2. Decrement available inventory quantity
    await dbQuery.run(`
      UPDATE inventory
      SET available_quantity = available_quantity - 1
      WHERE id = ?
    `, [inventory_id]);

    // 3. Create rental record
    await dbQuery.run(`
      INSERT INTO rentals (id, customer_id, inventory_id, start_date, end_date, status, total_price, deposit)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)
    `, [id, customerId, inventory_id, start_date, end_date, total_price, deposit]);

    const rental = await dbQuery.get(`
      SELECT r.*, i.name as equipment_name, c.email as customer_email
      FROM rentals r
      JOIN inventory i ON r.inventory_id = i.id
      JOIN users c ON r.customer_id = c.id
      WHERE r.id = ?
    `, [id]);

    // Event: rental.created
    appEvents.publish('rental.created', { rental });

    return rental;
  },

  async getRentals(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Rental Manager') {
      return dbQuery.all(`
        SELECT r.*, i.name as equipment_name, c.first_name || ' ' || c.last_name as customer_name
        FROM rentals r
        JOIN inventory i ON r.inventory_id = i.id
        JOIN users c ON r.customer_id = c.id
        ORDER BY r.start_date DESC
      `);
    } else {
      // Customer
      return dbQuery.all(`
        SELECT r.*, i.name as equipment_name
        FROM rentals r
        JOIN inventory i ON r.inventory_id = i.id
        WHERE r.customer_id = ?
        ORDER BY r.start_date DESC
      `, [user.id]);
    }
  },

  async updateRentalStatus(rentalId, status) {
    const current = await dbQuery.get('SELECT inventory_id, status FROM rentals WHERE id = ?', [rentalId]);
    if (!current) {
      throw new Error('Rental record not found');
    }

    await dbQuery.run(`
      UPDATE rentals
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, rentalId]);

    // If equipment returned, restore available stock
    if (status === 'Returned' && current.status !== 'Returned') {
      await dbQuery.run(`
        UPDATE inventory
        SET available_quantity = available_quantity + 1
        WHERE id = ?
      `, [current.inventory_id]);

      appEvents.publish('rental.returned', { rentalId, inventoryId: current.inventory_id });
    }

    return dbQuery.get('SELECT * FROM rentals WHERE id = ?', [rentalId]);
  }
};
