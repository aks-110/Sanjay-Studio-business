import { ReviewRepository } from './ReviewRepository.js';

export const reviewsService = {
  async addReview(customerId, { entity_type, entity_id, rating, comment }) {
    return ReviewRepository.create({
      customer_id: customerId,
      entity_type,
      entity_id,
      rating,
      comment
    });
  },

  async getReviews(entityType, entityId) {
    return ReviewRepository.getReviews(entityType, entityId);
  }
};

