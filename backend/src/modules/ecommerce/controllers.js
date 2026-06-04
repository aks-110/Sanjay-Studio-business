import { ecommerceService } from './services.js';

export const ecommerceController = {
  async getProducts(req, res) {
    try {
      const products = await ecommerceService.getProducts();
      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async createOrder(req, res) {
    try {
      const { items, shipping_address } = req.body;
      if (!items || !shipping_address) {
        return res.status(400).json({ error: 'Cart items list and shipping address are required' });
      }
      const order = await ecommerceService.createOrder(req.user.id, { items, shipping_address });
      return res.status(201).json(order);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async getOrders(req, res) {
    try {
      const orders = await ecommerceService.getOrders(req.user);
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = await ecommerceService.updateOrderStatus(orderId, status);
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
