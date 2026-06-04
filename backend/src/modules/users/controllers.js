import { usersService } from './services.js';

export const usersController = {
  async getProfile(req, res) {
    try {
      const profile = await usersService.getProfile(req.user.id);
      return res.status(200).json(profile);
    } catch (err) {
      return res.status(404).json({ error: err.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { first_name, last_name, phone } = req.body;
      const profile = await usersService.updateProfile(req.user.id, { first_name, last_name, phone });
      return res.status(200).json(profile);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const list = await usersService.getAllUsers();
      return res.status(200).json(list);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async updateRolePermissions(req, res) {
    try {
      const { userId } = req.params;
      const { role, permissions } = req.body;
      if (!role || !permissions) {
        return res.status(400).json({ error: 'Role and permissions arrays are required' });
      }
      const updated = await usersService.updateRoleAndPermissions(userId, { role, permissions });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
