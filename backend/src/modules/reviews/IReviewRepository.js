export class IReviewRepository {
  async create(review) {
    throw new Error('Method create must be implemented');
  }

  async getReviews(entityType, entityId) {
    throw new Error('Method getReviews must be implemented');
  }
}
