export class INotificationRepository {
  async getByUserId(userId) {
    throw new Error('Method getByUserId must be implemented');
  }

  async markAsRead(id) {
    throw new Error('Method markAsRead must be implemented');
  }

  async create(notification) {
    throw new Error('Method create must be implemented');
  }
}
