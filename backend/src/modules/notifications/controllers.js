import { notificationService } from './services.js';

export const notificationController = {
  async getMyNotifications(req, res) {
    try {
      const list = await notificationService.getNotifications(req.user.id);
      return res.status(200).json(list);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async markRead(req, res) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
