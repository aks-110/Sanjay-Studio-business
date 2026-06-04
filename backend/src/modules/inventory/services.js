import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const inventoryService = {
  async listAll() {
    return dbQuery.all('SELECT * FROM inventory ORDER BY type, category, name');
  },

  async getById(id) {
    const item = await dbQuery.get('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!item) throw new Error('Inventory item not found');
    return item;
  },

  async createItem({ name, sku, description, category, type, total_quantity, price_per_day, sale_price }) {
    const id = uuidv4();
    await dbQuery.run(`
      INSERT INTO inventory (id, name, sku, description, category, type, total_quantity, available_quantity, price_per_day, sale_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')
    `, [id, name, sku, description, category, type, total_quantity, total_quantity, price_per_day, sale_price]);

    const item = await this.getById(id);
    appEvents.publish('inventory.item-added', { item });
    return item;
  },

  async updateItem(id, { name, sku, description, category, type, total_quantity, available_quantity, price_per_day, sale_price, status }) {
    await dbQuery.run(`
      UPDATE inventory
      SET name = ?, sku = ?, description = ?, category = ?, type = ?, total_quantity = ?, available_quantity = ?, price_per_day = ?, sale_price = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, sku, description, category, type, total_quantity, available_quantity, price_per_day, sale_price, status, id]);

    const item = await this.getById(id);
    appEvents.publish('inventory.item-updated', { item });
    return item;
  },

  async deleteItem(id) {
    // Check if there are active rentals or orders referencing this item
    const activeRental = await dbQuery.get('SELECT id FROM rentals WHERE inventory_id = ? AND status IN ("Pending", "Active")', [id]);
    if (activeRental) {
      throw new Error('Cannot delete item: active rentals exist for this item');
    }

    await dbQuery.run('DELETE FROM inventory WHERE id = ?', [id]);
    appEvents.publish('inventory.item-deleted', { id });
    return { success: true };
  }
};
