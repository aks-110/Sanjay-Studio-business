import { UserRepository } from './UserRepository.js';

export const usersService = {
  async getProfile(userId) {
    const user = await UserRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async updateProfile(userId, { first_name, last_name, phone }) {
    return UserRepository.updateProfile(userId, { first_name, last_name, phone });
  },

  async getAllUsers() {
    return UserRepository.getAll();
  },

  async updateRoleAndPermissions(userId, { role, permissions }) {
    return UserRepository.updateRoleAndPermissions(userId, { role, permissions });
  }
};

