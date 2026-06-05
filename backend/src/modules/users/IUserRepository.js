export class IUserRepository {
  async getById(userId) {
    throw new Error('Method getById must be implemented');
  }

  async getByEmail(email) {
    throw new Error('Method getByEmail must be implemented');
  }

  async getFirstUserByRole(roleName) {
    throw new Error('Method getFirstUserByRole must be implemented');
  }

  async getAll() {
    throw new Error('Method getAll must be implemented');
  }

  async create(user) {
    throw new Error('Method create must be implemented');
  }

  async updateProfile(userId, data) {
    throw new Error('Method updateProfile must be implemented');
  }

  async updateRoleAndPermissions(userId, data) {
    throw new Error('Method updateRoleAndPermissions must be implemented');
  }
}
