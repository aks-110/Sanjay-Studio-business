import { v4 as uuidv4 } from 'uuid';
import { dbQuery } from '../../shared/database/index.js';
import appEvents from '../../shared/events/index.js';

export const crmService = {
  async listLeads() {
    return dbQuery.all(`
      SELECT c.*, u.first_name || ' ' || u.last_name as customer_name, u.email as customer_email,
             a.first_name || ' ' || a.last_name as agent_name
      FROM crm_entries c
      JOIN users u ON c.customer_id = u.id
      LEFT JOIN users a ON c.assigned_agent_id = a.id
      ORDER BY c.updated_at DESC
    `);
  },

  async createLead(customerId, notes = 'Auto-generated sales pipeline entry') {
    // Check if lead already exists
    const existing = await dbQuery.get('SELECT id FROM crm_entries WHERE customer_id = ?', [customerId]);
    if (existing) return existing;

    const id = uuidv4();
    await dbQuery.run(`
      INSERT INTO crm_entries (id, customer_id, lead_status, notes)
      VALUES (?, ?, 'New', ?)
    `, [id, customerId, notes]);

    return dbQuery.get('SELECT * FROM crm_entries WHERE id = ?', [id]);
  },

  async updateLead(leadId, { lead_status, notes, assigned_agent_id }) {
    await dbQuery.run(`
      UPDATE crm_entries
      SET lead_status = ?, notes = ?, assigned_agent_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [lead_status, notes, assigned_agent_id, leadId]);

    return dbQuery.get('SELECT * FROM crm_entries WHERE id = ?', [leadId]);
  }
};

// Event-driven bindings for automatic CRM tracking!
appEvents.subscribe('user.registered', async ({ user }) => {
  console.log('[Event Listener] Creating CRM Entry for newly registered customer:', user.email);
  await crmService.createLead(user.id, `New account sign-up. Verified Email: ${user.email}`);
});

appEvents.subscribe('booking.created', async ({ booking }) => {
  console.log('[Event Listener] Updating CRM notes for customer Booking activity:', booking.customer_id);
  const existingLead = await dbQuery.get('SELECT id, notes FROM crm_entries WHERE customer_id = ?', [booking.customer_id]);
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
