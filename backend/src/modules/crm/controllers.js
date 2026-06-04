import { crmService } from './services.js';

export const crmController = {
  async list(req, res) {
    try {
      const list = await crmService.listLeads();
      return res.status(200).json(list);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { lead_status, notes, assigned_agent_id } = req.body;
      if (!lead_status) {
        return res.status(400).json({ error: 'lead_status is required' });
      }
      const updated = await crmService.updateLead(id, { lead_status, notes, assigned_agent_id });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
