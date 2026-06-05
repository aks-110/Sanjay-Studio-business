import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from './OrderRepository.js';
import { InventoryRepository } from '../inventory/InventoryRepository.js';
import appEvents from '../../shared/events/index.js';

export const ecommerceService = {
  async getProducts() {
    // Return all items flagged for sale (Stationery items)
    const items = await InventoryRepository.listAll();
    return items.filter(item => item.type === 'Sale' && item.status === 'Available');
  },

  async createOrder(customerId, { items, shipping_address }) {
    if (!items || items.length === 0) {
      throw new Error('Your shopping cart is empty');
    }

    // 1. Validate all items and stock levels
    let totalAmount = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      const dbItem = await InventoryRepository.getById(cartItem.inventory_id);
      if (!dbItem || dbItem.type !== 'Sale') {
        throw new Error(`Product not found`);
      }
      if (dbItem.available_quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for "${dbItem.name}". Available: ${dbItem.available_quantity}`);
      }
      const itemTotal = dbItem.sale_price * cartItem.quantity;
      totalAmount += itemTotal;
      validatedItems.push({
        inventory_id: dbItem.id,
        quantity: cartItem.quantity,
        price: dbItem.sale_price
      });
    }

    const orderId = uuidv4();

    // 2. Create Order Header record
    await OrderRepository.create({
      id: orderId,
      customer_id: customerId,
      status: 'Pending',
      total_amount: totalAmount,
      shipping_address
    });

    // 3. Create Order Line Items and deduct stock
    for (const item of validatedItems) {
      const lineId = uuidv4();
      await OrderRepository.createItem({
        id: lineId,
        order_id: orderId,
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        price: item.price
      });

      await InventoryRepository.decrementAvailableQuantity(item.inventory_id, item.quantity);
    }

    const order = await OrderRepository.getById(orderId);

    // Event: order.placed
    appEvents.publish('order.placed', { order });

    return order;
  },

  async getOrders(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Inventory Manager') {
      return OrderRepository.getAll();
    } else {
      // Customer
      return OrderRepository.getByCustomerId(user.id);
    }
  },

  async updateOrderStatus(orderId, status) {
    return OrderRepository.updateStatus(orderId, status);
  }
};

