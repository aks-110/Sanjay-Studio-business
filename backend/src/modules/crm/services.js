import { v4 as uuidv4 } from 'uuid';
import { CRMRepository } from './CRMRepository.js';
import appEvents from '../../shared/events/index.js';

export const crmService = {
  async listLeads() {
    return CRMRepository.listLeads();
  },

  async createLead(customerId, notes = 'Auto-generated sales pipeline entry') {
    // Check if lead already exists
    const existing = await CRMRepository.getByCustomerId(customerId);
    if (existing) return existing;

    return CRMRepository.create({ customer_id: customerId, notes });
  },

  async updateLead(leadId, { lead_status, notes, assigned_agent_id }) {
    return CRMRepository.update(leadId, { lead_status, notes, assigned_agent_id });
  }
};

// Event-driven bindings for automatic CRM tracking!
appEvents.subscribe('user.registered', async ({ user }) => {
  console.log('[Event Listener] Creating CRM Entry for newly registered customer:', user.email);
  await crmService.createLead(user.id, `New account sign-up. Verified Email: ${user.email}`);
});

appEvents.subscribe('booking.created', async ({ booking }) => {
  console.log('[Event Listener] Updating CRM notes for customer Booking activity:', booking.customer_id);
  const existingLead = await CRMRepository.getByCustomerId(booking.customer_id);
  if (existingLead) {
    const updatedNotes = `${existingLead.notes || ''}\n- Requested Photography Shoot: "${booking.service_type}" scheduled on ${booking.booking_date} (Price: $${booking.total_price}).`.trim();
    await crmService.updateLead(existingLead.id, {
      lead_status: 'Contacted',
      notes: updatedNotes,
      assigned_agent_id: booking.photographer_id
    });
  } else {
    await crmService.createLead(booking.customer_id, `Created shoot booking: "${booking.service_type}".`);
  }
});

