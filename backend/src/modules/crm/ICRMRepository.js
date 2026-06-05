export class ICRMRepository {
  async getById(id) {
    throw new Error('Method getById must be implemented');
  }

  async getByCustomerId(customerId) {
    throw new Error('Method getByCustomerId must be implemented');
  }

  async listLeads() {
    throw new Error('Method listLeads must be implemented');
  }

  async create(lead) {
    throw new Error('Method create must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update must be implemented');
  }
}
