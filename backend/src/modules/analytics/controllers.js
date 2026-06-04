import { analyticsService } from './services.js';

export const analyticsController = {
  async getStats(req, res) {
    try {
      const stats = await analyticsService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
