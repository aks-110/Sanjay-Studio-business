import { reviewsService } from './services.js';

export const reviewsController = {
  async add(req, res) {
    try {
      const { entity_type, entity_id, rating, comment } = req.body;
      if (!entity_type || !entity_id || !rating) {
        return res.status(400).json({ error: 'entity_type, entity_id, and rating (1-5) are required' });
      }
      const review = await reviewsService.addReview(req.user.id, {
        entity_type,
        entity_id,
        rating,
        comment
      });
      return res.status(201).json(review);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const reviews = await reviewsService.getReviews(entityType, entityId);
      return res.status(200).json(reviews);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
