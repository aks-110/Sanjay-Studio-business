export class IAnalyticsRepository {
  async trackEvent(eventType, eventData) {
    throw new Error('Method trackEvent must be implemented');
  }

  async getDashboardStats() {
    throw new Error('Method getDashboardStats must be implemented');
  }

  async logActivity(userId, action, details) {
    throw new Error('Method logActivity must be implemented');
  }
}
