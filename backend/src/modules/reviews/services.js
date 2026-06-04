import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';

export const reviewsService = {
  async addReview(customerId, { entity_type, entity_id, rating, comment }) {
    const id = uuidv4();
    await dbQuery.run(`
      INSERT INTO reviews (id, customer_id, entity_type, entity_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, customerId, entity_type, entity_id, rating, comment]);

    return dbQuery.get(`
      SELECT r.*, u.first_name || ' ' || u.last_name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.id = ?
    `, [id]);
  },

  async getReviews(entityType, entityId) {
    return dbQuery.all(`
      SELECT r.*, u.first_name || ' ' || u.last_name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.entity_type = ? AND r.entity_id = ?
      ORDER BY r.created_at DESC
    `, [entityType, entityId]);
  }
};
