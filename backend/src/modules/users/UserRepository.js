import { SupabaseUserRepository } from "./SupabaseUserRepository.js";

class SupabaseClerkUserRepository {
  constructor() {
    this.repo = new SupabaseUserRepository();
  }

  isClerkId(userId) {
    return typeof userId === "string" && userId.startsWith("user_");
  }

  async getById(userId) {
    if (this.isClerkId(userId)) {
      return this.repo.getByClerkId(userId);
    }
    return this.repo.getById(userId);
  }

  async getByClerkId(clerkId) {
    return this.repo.getByClerkId(clerkId);
  }

  async getByEmail(email) {
    return this.repo.getByEmail(email);
  }

  async getFirstUserByRole(roleName) {
    return this.repo.getFirstUserByRole(roleName);
  }

  async getAll() {
    return this.repo.getAll();
  }

  async create(user) {
    return this.repo.create(user);
  }

  async updateProfile(userId, data) {
    let targetId = userId;
    if (this.isClerkId(userId)) {
      const user = await this.repo.getByClerkId(userId);
      if (user) {
        targetId = user.id;
      } else {
        throw new Error(`User not found with clerk_id: ${userId}`);
      }
    }
    return this.repo.updateProfile(targetId, data);
  }

  async updateRoleAndPermissions(userId, data) {
    let targetId = userId;
    if (this.isClerkId(userId)) {
      const user = await this.repo.getByClerkId(userId);
      if (user) {
        targetId = user.id;
      } else {
        throw new Error(`User not found with clerk_id: ${userId}`);
      }
    }
    return this.repo.updateRoleAndPermissions(targetId, data);
  }

  async updateLastLogin(userId) {
    let targetId = userId;
    if (this.isClerkId(userId)) {
      const user = await this.repo.getByClerkId(userId);
      if (user) {
        targetId = user.id;
      }
    }
    return this.repo.updateProfile(targetId, {
      last_login: new Date().toISOString(),
    });
  }
}

export const UserRepository = new SupabaseClerkUserRepository();
export default UserRepository;
