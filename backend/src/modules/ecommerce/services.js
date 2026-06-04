import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const ecommerceService = {
  async getProducts() {
    // Return all items flagged for sale (Stationery items)
    return dbQuery.all('SELECT * FROM inventory WHERE type = "Sale" AND status = "Available"');
  },

  async createOrder(customerId, { items, shipping_address }) {
    if (!items || items.length === 0) {
      throw new Error('Your shopping cart is empty');
    }

    // 1. Validate all items and stock levels
    let totalAmount = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      const dbItem = await dbQuery.get('SELECT * FROM inventory WHERE id = ? AND type = "Sale"', [cartItem.inventory_id]);
      if (!dbItem) {
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
    await dbQuery.run(`
      INSERT INTO orders (id, customer_id, status, total_amount, shipping_address)
      VALUES (?, ?, 'Pending', ?, ?)
    `, [orderId, customerId, totalAmount, shipping_address]);

    // 3. Create Order Line Items and deduct stock
    for (const item of validatedItems) {
      const lineId = uuidv4();
      await dbQuery.run(`
        INSERT INTO order_items (id, order_id, inventory_id, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `, [lineId, orderId, item.inventory_id, item.quantity, item.price]);

      await dbQuery.run(`
        UPDATE inventory
        SET available_quantity = available_quantity - ?
        WHERE id = ?
      `, [item.quantity, item.inventory_id]);
    }

    const order = await dbQuery.get(`
      SELECT o.*, c.email as customer_email
      FROM orders o
      JOIN users c ON o.customer_id = c.id
      WHERE o.id = ?
    `, [orderId]);

    order.items = await dbQuery.all(`
      SELECT oi.*, i.name as product_name
      FROM order_items oi
      JOIN inventory i ON oi.inventory_id = i.id
      WHERE oi.order_id = ?
    `, [orderId]);

    // Event: order.placed
    appEvents.publish('order.placed', { order });

    return order;
  },

  async getOrders(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Inventory Manager') {
      const orders = await dbQuery.all(`
        SELECT o.*, c.first_name || ' ' || c.last_name as customer_name
        FROM orders o
        JOIN users c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
      `);
      for (const order of orders) {
        order.items = await dbQuery.all(`
          SELECT oi.*, i.name as product_name
          FROM order_items oi
          JOIN inventory i ON oi.inventory_id = i.id
          WHERE oi.order_id = ?
        `, [order.id]);
      }
      return orders;
    } else {
      // Customer
      const orders = await dbQuery.all(`
        SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC
      `, [user.id]);
      for (const order of orders) {
        order.items = await dbQuery.all(`
          SELECT oi.*, i.name as product_name
          FROM order_items oi
          JOIN inventory i ON oi.inventory_id = i.id
          WHERE oi.order_id = ?
        `, [order.id]);
      }
      return orders;
    }
  },

  async updateOrderStatus(orderId, status) {
    await dbQuery.run(`
      UPDATE orders
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, orderId]);

    return dbQuery.get('SELECT * FROM orders WHERE id = ?', [orderId]);
  }
};
