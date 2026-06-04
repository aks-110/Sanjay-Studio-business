import { dbQuery } from '../../shared/database/index.js';

export const usersService = {
  async getProfile(userId) {
    const user = await dbQuery.get('SELECT id, email, first_name, last_name, phone, role, permissions, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async updateProfile(userId, { first_name, last_name, phone }) {
    await dbQuery.run(`
      UPDATE users
      SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [first_name, last_name, phone, userId]);

    return this.getProfile(userId);
  },

  async getAllUsers() {
    return dbQuery.all('SELECT id, email, first_name, last_name, phone, role, permissions, created_at FROM users');
  },

  async updateRoleAndPermissions(userId, { role, permissions }) {
    await dbQuery.run(`
      UPDATE users
      SET role = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [role, JSON.stringify(permissions), userId]);

    return this.getProfile(userId);
  }
};
