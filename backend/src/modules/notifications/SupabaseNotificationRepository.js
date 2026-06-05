import { INotificationRepository } from './INotificationRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseNotificationRepository extends INotificationRepository {
  // Map PostgreSQL notification to match MongoDB mock structure expected by service/frontend
  mapNotification(n) {
    if (!n) return null;
    return {
      _id: n.id,
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      status: n.status,
      timestamp: n.created_at,
      created_at: n.created_at,
      updated_at: n.updated_at
    };
  }

  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(n => this.mapNotification(n));
  }

  async markAsRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapNotification(data);
  }

  async create({ userId, title, message, type = 'in_app' }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        status: 'unread'
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapNotification(data);
  }
}
