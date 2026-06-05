import { IReviewRepository } from './IReviewRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseReviewRepository extends IReviewRepository {
  mapReview(r) {
    if (!r) return null;
    return {
      id: r.id,
      customer_id: r.customer_id,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      updated_at: r.updated_at,
      customer_name: r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : null
    };
  }

  async create({ customer_id, entity_type, entity_id, rating, comment }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        customer_id,
        entity_type,
        entity_id,
        rating,
        comment
      })
      .select(`
        *,
        customer:users!reviews_customer_id_fkey(first_name, last_name)
      `)
      .single();

    if (error) throw error;
    return this.mapReview(data);
  }

  async getReviews(entityType, entityId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:users!reviews_customer_id_fkey(first_name, last_name)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => this.mapReview(r));
  }
}
