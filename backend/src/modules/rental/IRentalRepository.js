export class IRentalRepository {
  async getById(id) {
    throw new Error('Method getById must be implemented');
  }

  async create(rental) {
    throw new Error('Method create must be implemented');
  }

  async getAll() {
    throw new Error('Method getAll must be implemented');
  }

  async getByCustomerId(customerId) {
    throw new Error('Method getByCustomerId must be implemented');
  }

  async updateStatus(id, status) {
    throw new Error('Method updateStatus must be implemented');
  }
}
