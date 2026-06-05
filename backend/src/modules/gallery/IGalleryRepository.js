export class IGalleryRepository {
  async getAll() {
    throw new Error('Method getAll must be implemented');
  }

  async getFiltered(tags) {
    throw new Error('Method getFiltered must be implemented');
  }

  async create(image) {
    throw new Error('Method create must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }
}
