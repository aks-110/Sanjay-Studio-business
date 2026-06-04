import { paymentService } from './services.js';

export const paymentController = {
  async initCheckout(req, res) {
    try {
      const { entity_type, entity_id, amount, payment_method } = req.body;
      if (!entity_type || !entity_id || !amount || !payment_method) {
        return res.status(400).json({ error: 'entity_type, entity_id, amount, and payment_method are required' });
      }
      const checkoutSession = await paymentService.initCheckout(req.user.id, {
        entity_type,
        entity_id,
        amount,
        payment_method
      });
      return res.status(200).json(checkoutSession);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async confirmPayment(req, res) {
    try {
      const { gatewayId } = req.body;
      if (!gatewayId) {
        return res.status(400).json({ error: 'gatewayId transaction identifier is required' });
      }
      const transaction = await paymentService.capturePayment(gatewayId);
      return res.status(200).json(transaction);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async getInvoices(req, res) {
    try {
      const list = await paymentService.listInvoices(req.user);
      return res.status(200).json(list);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
