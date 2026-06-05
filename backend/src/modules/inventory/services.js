import { v4 as uuidv4 } from 'uuid';
import { InventoryRepository } from './InventoryRepository.js';
import { RentalRepository } from '../rental/RentalRepository.js';
import appEvents from '../../shared/events/index.js';

export const inventoryService = {
  async listAll() {
    return InventoryRepository.listAll();
  },

  async getById(id) {
    const item = await InventoryRepository.getById(id);
    if (!item) throw new Error('Inventory item not found');
    return item;
  },

  async createItem({ name, sku, description, category, type, total_quantity, price_per_day, sale_price }) {
    const id = uuidv4();
    const item = await InventoryRepository.create({
      id,
      name,
      sku,
      description,
      category,
      type,
      total_quantity,
      price_per_day,
      sale_price
    });

    appEvents.publish('inventory.item-added', { item });
    return item;
  },

  async updateItem(id, { name, sku, description, category, type, total_quantity, available_quantity, price_per_day, sale_price, status }) {
    const item = await InventoryRepository.update(id, {
      name,
      sku,
      description,
      category,
      type,
      total_quantity,
      available_quantity,
      price_per_day,
      sale_price,
      status
    });

    appEvents.publish('inventory.item-updated', { item });
    return item;
  },

  async deleteItem(id) {
    // Check if there are active rentals referencing this item
    const rentals = await RentalRepository.getAll();
    const activeRental = rentals.find(r => r.inventory_id === id && ['Pending', 'Active'].includes(r.status));
    if (activeRental) {
      throw new Error('Cannot delete item: active rentals exist for this item');
    }

    await InventoryRepository.delete(id);
    appEvents.publish('inventory.item-deleted', { id });
    return { success: true };
  }
};

