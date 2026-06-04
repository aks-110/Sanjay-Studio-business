import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const bookingService = {
  async createBooking(customerId, { service_type, booking_date, total_price, notes }) {
    const id = uuidv4();
    
    // Auto-assign first available photographer just for mockup/demo convenience
    const photographer = await dbQuery.get("SELECT id FROM users WHERE role = 'Photographer' LIMIT 1");
    const photographerId = photographer ? photographer.id : null;

    await dbQuery.run(`
      INSERT INTO bookings (id, customer_id, photographer_id, service_type, booking_date, status, total_price, notes)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)
    `, [id, customerId, photographerId, service_type, booking_date, total_price, notes]);

    const booking = await dbQuery.get(`
      SELECT b.*, u.first_name as photographer_name, c.email as customer_email
      FROM bookings b
      LEFT JOIN users u ON b.photographer_id = u.id
      JOIN users c ON b.customer_id = c.id
      WHERE b.id = ?
    `, [id]);

    // Publish booking.created event (event-driven actions)
    appEvents.publish('booking.created', { booking });

    return booking;
  },

  async getBookings(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin') {
      return dbQuery.all(`
        SELECT b.*, u.first_name || ' ' || u.last_name as photographer_name, c.first_name || ' ' || c.last_name as customer_name
        FROM bookings b
        LEFT JOIN users u ON b.photographer_id = u.id
        JOIN users c ON b.customer_id = c.id
        ORDER BY b.booking_date DESC
      `);
    } else if (user.role === 'Photographer') {
      return dbQuery.all(`
        SELECT b.*, c.first_name || ' ' || c.last_name as customer_name
        FROM bookings b
        JOIN users c ON b.customer_id = c.id
        WHERE b.photographer_id = ?
        ORDER BY b.booking_date DESC
      `, [user.id]);
    } else {
      // Customer
      return dbQuery.all(`
        SELECT b.*, u.first_name || ' ' || u.last_name as photographer_name
        FROM bookings b
        LEFT JOIN users u ON b.photographer_id = u.id
        WHERE b.customer_id = ?
        ORDER BY b.booking_date DESC
      `, [user.id]);
    }
  },

  async updateBookingStatus(bookingId, status) {
    await dbQuery.run(`
      UPDATE bookings
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, bookingId]);

    const booking = await dbQuery.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    
    // Publish booking.updated event
    appEvents.publish('booking.updated', { booking });

    return booking;
  }
};
