import { mongoMock, dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const analyticsService = {
  async logMetric(metricType, value, dimensions = {}) {
    const coll = mongoMock.collection('analytics_metrics');
    return coll.insert({
      metricType,
      value,
      dimensions,
      dateStr: new Date().toISOString().split('T')[0]
    });
  },

  async getDashboardStats() {
    // 1. Gather SQL table aggregates
    const userCount = await dbQuery.get('SELECT COUNT(*) as count FROM users WHERE role = "Customer"');
    const bookingCount = await dbQuery.get('SELECT COUNT(*) as count FROM bookings');
    const rentalCount = await dbQuery.get('SELECT COUNT(*) as count FROM rentals');
    const orderCount = await dbQuery.get('SELECT COUNT(*) as count FROM orders');
    
    const revenues = await dbQuery.get(`
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = "Paid" OR status = "Delivered") as shop_revenue,
        (SELECT COALESCE(SUM(total_price), 0) FROM rentals WHERE status = "Active" OR status = "Returned") as rental_revenue,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = "Confirmed" OR status = "Completed") as booking_revenue
    `);

    // 2. Fetch recent transactions for admin stream
    const recentOrders = await dbQuery.all(`
      SELECT o.id, o.total_amount, o.status, o.created_at, u.first_name || ' ' || u.last_name as customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `);

    const recentBookings = await dbQuery.all(`
      SELECT b.id, b.service_type, b.total_price, b.status, b.booking_date, u.first_name || ' ' || u.last_name as customer_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      ORDER BY b.created_at DESC LIMIT 5
    `);

    // 3. Compile mock timeline data for UI charts
    const salesTimeline = [
      { month: 'Jan', revenue: 1200 },
      { month: 'Feb', revenue: 1900 },
      { month: 'Mar', revenue: 3200 },
      { month: 'Apr', revenue: 4500 },
      { month: 'May', revenue: Number(revenues.shop_revenue) + Number(revenues.rental_revenue) + Number(revenues.booking_revenue) + 2000 }
    ];

    return {
      cards: {
        customers: userCount.count,
        bookings: bookingCount.count,
        rentals: rentalCount.count,
        orders: orderCount.count,
        totalRevenue: Number(revenues.shop_revenue) + Number(revenues.rental_revenue) + Number(revenues.booking_revenue)
      },
      recent: {
        orders: recentOrders,
        bookings: recentBookings
      },
      charts: {
        salesTimeline
      }
    };
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
