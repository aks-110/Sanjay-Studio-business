import { IOrderRepository } from './IOrderRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseOrderRepository extends IOrderRepository {
  mapOrder(o) {
    if (!o) return null;
    return {
      id: o.id,
      customer_id: o.customer_id,
      status: o.status,
      total_amount: o.total_amount ? Number(o.total_amount) : 0,
      shipping_address: o.shipping_address,
      created_at: o.created_at,
      updated_at: o.updated_at,
      customer_name: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : null,
      customer_email: o.customer ? o.customer.email : null,
      items: (o.order_items || []).map(oi => ({
        id: oi.id,
        order_id: oi.order_id,
        inventory_id: oi.inventory_id,
        quantity: oi.quantity,
        price: oi.price ? Number(oi.price) : 0,
        product_name: oi.inventory_items?.name || 'Unknown Product'
      }))
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users!orders_customer_id_fkey(email, first_name, last_name),
        order_items (
          *,
          inventory_items (
            name
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapOrder(data);
  }

  async create({ id, customer_id, status = 'Pending', total_amount, shipping_address }) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        id,
        customer_id,
        status,
        total_amount,
        shipping_address
      })
      .select(`
        *,
        customer:users!orders_customer_id_fkey(email, first_name, last_name)
      `)
      .single();

    if (error) throw error;
    return this.mapOrder(data);
  }

  async createItem({ id, order_id, inventory_id, quantity, price }) {
    const { data, error } = await supabase
      .from('order_items')
      .insert({
        id,
        order_id,
        inventory_id,
        quantity,
        price
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users!orders_customer_id_fkey(first_name, last_name),
        order_items (
          *,
          inventory_items (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(o => this.mapOrder(o));
  }

  async getByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          inventory_items (
            name
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(o => this.mapOrder(o));
  }

  async updateStatus(id, status) {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return this.getById(id);
  }
}
