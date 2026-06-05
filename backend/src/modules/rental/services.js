import { v4 as uuidv4 } from 'uuid';
import { RentalRepository } from './RentalRepository.js';
import { InventoryRepository } from '../inventory/InventoryRepository.js';
import appEvents from '../../shared/events/index.js';

export const rentalService = {
  async createRental(customerId, { inventory_id, start_date, end_date, total_price, deposit }) {
    // 1. Verify item availability
    const item = await InventoryRepository.getById(inventory_id);
    if (!item || item.type !== 'Rental') {
      throw new Error('Equipment not found or is not available for rental');
    }

    if (item.available_quantity < 1) {
      throw new Error(`Equipment "${item.name}" is currently out of stock`);
    }

    const id = uuidv4();

    // 2. Decrement available inventory quantity
    await InventoryRepository.decrementAvailableQuantity(inventory_id);

    // 3. Create rental record
    const rental = await RentalRepository.create({
      id,
      customer_id: customerId,
      inventory_id,
      start_date,
      end_date,
      total_price,
      deposit
    });

    // Event: rental.created
    appEvents.publish('rental.created', { rental });

    return rental;
  },

  async getRentals(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Rental Manager') {
      return RentalRepository.getAll();
    } else {
      // Customer
      return RentalRepository.getByCustomerId(user.id);
    }
  },

  async updateRentalStatus(rentalId, status) {
    const current = await RentalRepository.getById(rentalId);
    if (!current) {
      throw new Error('Rental record not found');
    }

    const rental = await RentalRepository.updateStatus(rentalId, status);

    // If equipment returned, restore available stock
    if (status === 'Returned' && current.status !== 'Returned') {
      await InventoryRepository.incrementAvailableQuantity(current.inventory_id);
      appEvents.publish('rental.returned', { rentalId, inventoryId: current.inventory_id });
    }

    return rental;
  }
};

