import { AnalyticsRepository } from './AnalyticsRepository.js';
import appEvents from '../../shared/events/index.js';

export const analyticsService = {
  async logMetric(metricType, value, dimensions = {}) {
    return AnalyticsRepository.trackEvent(metricType, { value, dimensions });
  },

  async logActivity(userId, action, details = {}) {
    return AnalyticsRepository.logActivity(userId, action, details);
  },

  async getDashboardStats() {
    return AnalyticsRepository.getDashboardStats();
  }
};

// Event-driven bindings for automatic analytics logging!
appEvents.subscribe('user.registered', async () => {
  await analyticsService.logMetric('user_registered', 1);
});

appEvents.subscribe('booking.created', async ({ booking }) => {
  await analyticsService.logMetric('booking_count', 1, { service: booking.service_type });
});

appEvents.subscribe('rental.created', async ({ rental }) => {
  await analyticsService.logMetric('rental_count', 1, { itemId: rental.inventory_id });
});

appEvents.subscribe('order.placed', async ({ order }) => {
  await analyticsService.logMetric('sale_revenue', order.total_amount, { category: 'Stationery' });
});

appEvents.subscribe('activity.logged', async ({ userId, action, details }) => {
  await analyticsService.logActivity(userId, action, details);
});

