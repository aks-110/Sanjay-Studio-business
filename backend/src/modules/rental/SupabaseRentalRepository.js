import { IRentalRepository } from './IRentalRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseRentalRepository extends IRentalRepository {
  mapRental(r) {
    if (!r) return null;
    return {
      id: r.id,
      customer_id: r.customer_id,
      inventory_id: r.inventory_id,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status,
      total_price: r.total_price ? Number(r.total_price) : 0,
      deposit: r.deposit ? Number(r.deposit) : 0,
      created_at: r.created_at,
      updated_at: r.updated_at,
      equipment_name: r.inventory_items?.name || 'Unknown Equipment',
      customer_name: r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : null,
      customer_email: r.customer ? r.customer.email : null
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        inventory_items (
          name
        ),
        customer:users!rentals_customer_id_fkey(email, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapRental(data);
  }

  async create({ id, customer_id, inventory_id, start_date, end_date, total_price, deposit, status = 'Pending' }) {
    const { data, error } = await supabase
      .from('rentals')
      .insert({
        id,
        customer_id,
        inventory_id,
        start_date,
        end_date,
        total_price,
        deposit,
        status
      })
      .select(`
        *,
        inventory_items (
          name
        ),
        customer:users!rentals_customer_id_fkey(email, first_name, last_name)
      `)
      .single();

    if (error) throw error;
    return this.mapRental(data);
  }

  async getAll() {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        inventory_items (
          name
        ),
        customer:users!rentals_customer_id_fkey(first_name, last_name)
      `)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => this.mapRental(r));
  }

  async getByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        inventory_items (
          name
        )
      `)
      .eq('customer_id', customerId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => this.mapRental(r));
  }

  async updateStatus(id, status) {
    const { error } = await supabase
      .from('rentals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return this.getById(id);
  }
}
