import { IBookingRepository } from './IBookingRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseBookingRepository extends IBookingRepository {
  // Map PostgreSQL response to SQLite output format
  mapBooking(b) {
    if (!b) return null;
    return {
      id: b.id,
      customer_id: b.customer_id,
      photographer_id: b.photographer_id,
      service_type: b.service_type,
      booking_date: b.booking_date,
      status: b.status,
      total_price: b.total_price ? Number(b.total_price) : 0,
      notes: b.notes,
      created_at: b.created_at,
      updated_at: b.updated_at,
      photographer_name: b.photographer ? `${b.photographer.first_name} ${b.photographer.last_name}` : null,
      customer_name: b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : null,
      customer_email: b.customer ? b.customer.email : null
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        photographer:users!bookings_photographer_id_fkey(first_name, last_name),
        customer:users!bookings_customer_id_fkey(email, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapBooking(data);
  }

  async create({ id, customer_id, photographer_id, service_type, booking_date, status = 'Pending', total_price, notes }) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        id,
        customer_id,
        photographer_id,
        service_type,
        booking_date,
        status,
        total_price,
        notes
      })
      .select(`
        *,
        photographer:users!bookings_photographer_id_fkey(first_name, last_name),
        customer:users!bookings_customer_id_fkey(email, first_name, last_name)
      `)
      .single();

    if (error) throw error;
    return this.mapBooking(data);
  }

  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        photographer:users!bookings_photographer_id_fkey(first_name, last_name),
        customer:users!bookings_customer_id_fkey(first_name, last_name)
      `)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => this.mapBooking(b));
  }

  async getByPhotographerId(photographerId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:users!bookings_customer_id_fkey(first_name, last_name)
      `)
      .eq('photographer_id', photographerId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => this.mapBooking(b));
  }

  async getByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        photographer:users!bookings_photographer_id_fkey(first_name, last_name)
      `)
      .eq('customer_id', customerId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => this.mapBooking(b));
  }

  async updateStatus(id, status) {
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return this.getById(id);
  }
}
