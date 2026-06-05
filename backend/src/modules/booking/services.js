import { v4 as uuidv4 } from 'uuid';
import { BookingRepository } from './BookingRepository.js';
import { UserRepository } from '../users/UserRepository.js';
import appEvents from '../../shared/events/index.js';

export const bookingService = {
  async createBooking(customerId, { service_type, booking_date, total_price, notes }) {
    const id = uuidv4();
    
    // Auto-assign first available photographer just for mockup/demo convenience
    const photographer = await UserRepository.getFirstUserByRole('Photographer');
    const photographerId = photographer ? photographer.id : null;

    const booking = await BookingRepository.create({
      id,
      customer_id: customerId,
      photographer_id: photographerId,
      service_type,
      booking_date,
      total_price,
      notes
    });

    // Publish booking.created event (event-driven actions)
    appEvents.publish('booking.created', { booking });

    return booking;
  },

  async getBookings(user) {
    if (user.role === 'Admin' || user.role === 'Super Admin') {
      return BookingRepository.getAll();
    } else if (user.role === 'Photographer') {
      return BookingRepository.getByPhotographerId(user.id);
    } else {
      // Customer
      return BookingRepository.getByCustomerId(user.id);
    }
  },

  async updateBookingStatus(bookingId, status) {
    const booking = await BookingRepository.updateStatus(bookingId, status);
    
    // Publish booking.updated event
    appEvents.publish('booking.updated', { booking });

    return booking;
  }
};

