import { inventoryService } from './services.js';

export const inventoryController = {
  async list(req, res) {
    try {
      const items = await inventoryService.listAll();
      return res.status(200).json(items);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { name, sku, description, category, type, total_quantity, price_per_day, sale_price } = req.body;
      if (!name || !sku || !category || !type) {
        return res.status(400).json({ error: 'name, sku, category, and type are required' });
      }
      const item = await inventoryService.createItem({
        name,
        sku,
        description,
        category,
        type,
        total_quantity: total_quantity || 0,
        price_per_day,
        sale_price
      });
      return res.status(201).json(item);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const item = await inventoryService.updateItem(id, req.body);
      return res.status(200).json(item);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await inventoryService.deleteItem(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
