export class IInventoryRepository {
  async listAll() {
    throw new Error('Method listAll must be implemented');
  }

  async getById(id) {
    throw new Error('Method getById must be implemented');
  }

  async getBySku(sku) {
    throw new Error('Method getBySku must be implemented');
  }

  async create(item) {
    throw new Error('Method create must be implemented');
  }

  async update(id, item) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async decrementAvailableQuantity(id, amount, reference_type, reference_id, created_by) {
    throw new Error('Method decrementAvailableQuantity must be implemented');
  }

  async incrementAvailableQuantity(id, amount, reference_type, reference_id, created_by) {
    throw new Error('Method incrementAvailableQuantity must be implemented');
  }
}
