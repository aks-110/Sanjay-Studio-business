import { rentalService } from './services.js';

export const rentalController = {
  async create(req, res) {
    try {
      const { inventory_id, start_date, end_date, total_price, deposit } = req.body;
      if (!inventory_id || !start_date || !end_date || !total_price) {
        return res.status(400).json({ error: 'inventory_id, start_date, end_date, and total_price are required fields' });
      }
      const rental = await rentalService.createRental(req.user.id, {
        inventory_id,
        start_date,
        end_date,
        total_price,
        deposit: deposit || 0.00
      });
      return res.status(201).json(rental);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const rentals = await rentalService.getRentals(req.user);
      return res.status(200).json(rentals);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { rentalId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = await rentalService.updateRentalStatus(rentalId, status);
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
