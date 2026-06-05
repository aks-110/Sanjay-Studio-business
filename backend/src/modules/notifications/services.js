import { NotificationRepository } from './NotificationRepository.js';
import { PaymentRepository } from '../payments/PaymentRepository.js';
import appEvents from '../../shared/events/index.js';

export const notificationService = {
  async getNotifications(userId) {
    return NotificationRepository.getByUserId(userId);
  },

  async markAsRead(notificationId) {
    return NotificationRepository.markAsRead(notificationId);
  },

  async createNotification(userId, title, message, type = 'in_app') {
    return NotificationRepository.create({ userId, title, message, type });
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
  const customerId = await PaymentRepository.getCustomerIdFromEntity(payment.entity_type, payment.entity_id);
  if (customerId) {
    console.log('[Event Listener] Queueing payment receipt notification for customer:', customerId);
    await notificationService.createNotification(
      customerId,
      'Payment Captured Successfully',
      `Payment reference ${payment.payment_gateway_id} for $${payment.amount} has been processed successfully.`
    );
  }
});

