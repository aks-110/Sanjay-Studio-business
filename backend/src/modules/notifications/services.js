import { mongoMock } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const notificationService = {
  async getNotifications(userId) {
    const coll = mongoMock.collection('notifications');
    return coll.find({ userId }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async markAsRead(notificationId) {
    const coll = mongoMock.collection('notifications');
    return coll.updateMany({ _id: notificationId }, { status: 'read' });
  },

  async createNotification(userId, title, message, type = 'in_app') {
    const coll = mongoMock.collection('notifications');
    return coll.insert({
      userId,
      title,
      message,
      type,
      status: 'unread'
    });
  }
};

// Event-driven bindings for automatic system alerts!
appEvents.subscribe('booking.created', async ({ booking }) => {
  console.log('[Event Listener] Queueing booking notification for customer:', booking.customer_id);
  await notificationService.createNotification(
    booking.customer_id,
    'Photography Shoot Requested',
    `Your request for "${booking.service_type}" has been received and is pending confirmation. Date: ${booking.booking_date}.`
  );
});

appEvents.subscribe('rental.created', async ({ rental }) => {
  console.log('[Event Listener] Queueing rental notification for customer:', rental.customer_id);
  await notificationService.createNotification(
    rental.customer_id,
    'Camera Rental Initiated',
    `You have successfully booked gear. Rental start: ${rental.start_date}.`
  );
});

appEvents.subscribe('order.placed', async ({ order }) => {
  console.log('[Event Listener] Queueing order notification for customer:', order.customer_id);
  await notificationService.createNotification(
    order.customer_id,
    'Stationery Order Placed',
    `Your order for stationery items has been placed. Invoice generated for $${order.total_amount}.`
  );
});

appEvents.subscribe('payment.completed', async ({ payment }) => {
  const customerId = await paymentServiceGetCustomerId(payment.entity_type, payment.entity_id);
  if (customerId) {
    console.log('[Event Listener] Queueing payment receipt notification for customer:', customerId);
    await notificationService.createNotification(
      customerId,
      'Payment Captured Successfully',
      `Payment reference ${payment.payment_gateway_id} for $${payment.amount} has been processed successfully.`
    );
  }
});

// Avoid circular imports helper
async function paymentServiceGetCustomerId(type, id) {
  // Directly query SQLite to get customer_id
  import('../../shared/database/index.js').then(async ({ dbQuery }) => {
    let row;
    if (type === 'Booking') {
      row = await dbQuery.get('SELECT customer_id FROM bookings WHERE id = ?', [id]);
    } else if (type === 'Rental') {
      row = await dbQuery.get('SELECT customer_id FROM rentals WHERE id = ?', [id]);
    } else if (type === 'Order') {
      row = await dbQuery.get('SELECT customer_id FROM orders WHERE id = ?', [id]);
    }
    return row ? row.customer_id : null;
  }).catch(() => null);
}
