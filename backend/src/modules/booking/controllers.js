import { bookingService } from './services.js';

export const bookingController = {
  async create(req, res) {
    try {
      const { service_type, booking_date, total_price, notes } = req.body;
      if (!service_type || !booking_date || !total_price) {
        return res.status(400).json({ error: 'service_type, booking_date, and total_price are required fields' });
      }
      const booking = await bookingService.createBooking(req.user.id, {
        service_type,
        booking_date,
        total_price,
        notes
      });
      return res.status(201).json(booking);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const bookings = await bookingService.getBookings(req.user);
      return res.status(200).json(bookings);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      const updated = await bookingService.updateBookingStatus(bookingId, status);
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
