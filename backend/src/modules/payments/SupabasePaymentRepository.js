import { IPaymentRepository } from './IPaymentRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabasePaymentRepository extends IPaymentRepository {
  mapInvoice(i) {
    if (!i) return null;
    return {
      id: i.id,
      payment_id: i.payment_id,
      customer_id: i.customer_id,
      invoice_number: i.invoice_number,
      total_amount: i.total_amount ? Number(i.total_amount) : 0,
      tax_amount: i.tax_amount ? Number(i.tax_amount) : 0,
      status: i.status,
      pdf_url: i.pdf_url,
      created_at: i.created_at,
      updated_at: i.updated_at,
      customer_name: i.customer ? `${i.customer.first_name} ${i.customer.last_name}` : null,
      customer_email: i.customer ? i.customer.email : null
    };
  }

  async createInvoice({ id, payment_id, customer_id, invoice_number, total_amount, tax_amount, status, pdf_url }) {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        id,
        payment_id,
        customer_id,
        invoice_number,
        total_amount,
        tax_amount,
        status,
        pdf_url
      })
      .select()
      .single();

    if (error) throw error;
    return this.getInvoiceById(data.id);
  }

  async getInvoiceById(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:users!invoices_customer_id_fkey(email, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapInvoice(data);
  }

  async getAllInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:users!invoices_customer_id_fkey(email, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(i => this.mapInvoice(i));
  }

  async getInvoicesByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(i => this.mapInvoice(i));
  }

  async createPayment({ id, payment_gateway_id, amount, status = 'Pending', payment_method, entity_type, entity_id }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        id,
        payment_gateway_id,
        amount,
        status,
        payment_method,
        entity_type,
        entity_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentByGatewayId(gatewayId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_gateway_id', gatewayId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updatePaymentStatus(gatewayId, status) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('payment_gateway_id', gatewayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCustomerIdFromEntity(type, id) {
    let table = '';
    if (type === 'Booking') table = 'bookings';
    else if (type === 'Rental') table = 'rentals';
    else if (type === 'Order') table = 'orders';
    else return null;

    const { data, error } = await supabase
      .from(table)
      .select('customer_id')
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return data ? data.customer_id : null;
  }

  async updateSourceEntityStatus(type, id) {
    let table = '';
    let status = '';
    if (type === 'Booking') {
      table = 'bookings';
      status = 'Confirmed';
    } else if (type === 'Rental') {
      table = 'rentals';
      status = 'Active';
    } else if (type === 'Order') {
      table = 'orders';
      status = 'Paid';
    } else return;

    await supabase
      .from(table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
  }
}
