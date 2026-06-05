import { ICRMRepository } from './ICRMRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseCRMRepository extends ICRMRepository {
  mapLead(l) {
    if (!l) return null;
    return {
      id: l.id,
      customer_id: l.customer_id,
      lead_status: l.lead_status,
      last_contact_date: l.last_contact_date,
      notes: l.notes,
      assigned_agent_id: l.assigned_agent_id,
      created_at: l.created_at,
      updated_at: l.updated_at,
      customer_name: l.customer ? `${l.customer.first_name} ${l.customer.last_name}` : null,
      customer_email: l.customer ? l.customer.email : null,
      agent_name: l.agent ? `${l.agent.first_name} ${l.agent.last_name}` : null
    };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('crm_leads')
      .select(`
        *,
        customer:users!crm_leads_customer_id_fkey(email, first_name, last_name),
        agent:users!crm_leads_assigned_agent_id_fkey(first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapLead(data);
  }

  async getByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('crm_leads')
      .select(`
        *,
        customer:users!crm_leads_customer_id_fkey(email, first_name, last_name),
        agent:users!crm_leads_assigned_agent_id_fkey(first_name, last_name)
      `)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (error) throw error;
    return this.mapLead(data);
  }

  async listLeads() {
    const { data, error } = await supabase
      .from('crm_leads')
      .select(`
        *,
        customer:users!crm_leads_customer_id_fkey(email, first_name, last_name),
        agent:users!crm_leads_assigned_agent_id_fkey(first_name, last_name)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(l => this.mapLead(l));
  }

  async create({ customer_id, notes = 'Auto-generated sales pipeline entry', lead_status = 'New' }) {
    const { data, error } = await supabase
      .from('crm_leads')
      .insert({
        customer_id,
        lead_status,
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return this.getById(data.id);
  }

  async update(id, { lead_status, notes, assigned_agent_id }) {
    const updateObj = { updated_at: new Date().toISOString() };
    if (lead_status !== undefined) updateObj.lead_status = lead_status;
    if (notes !== undefined) updateObj.notes = notes;
    if (assigned_agent_id !== undefined) updateObj.assigned_agent_id = assigned_agent_id;

    const { error } = await supabase
      .from('crm_leads')
      .update(updateObj)
      .eq('id', id);

    if (error) throw error;
    return this.getById(id);
  }
}
