import { mongoMock } from '../../shared/database/index.js';

export const galleryService = {
  async getImages(tags = []) {
    const coll = mongoMock.collection('gallery_metadata');
    const all = coll.find({});
    if (tags.length === 0) return all;

    // Filter by tags locally
    return all.filter(img => tags.every(t => img.tags && img.tags.includes(t)));
  },

  async addImage(photographerId, { title, description, imageUrl, tags, dimensions, sizeBytes }) {
    const coll = mongoMock.collection('gallery_metadata');
    const doc = coll.insert({
      photographerId,
      title,
      description,
      imageUrl,
      tags: tags || [],
      dimensions: dimensions || { width: 1920, height: 1080 },
      sizeBytes: sizeBytes || 500000
    });
    return doc;
  },

  async deleteImage(id) {
    const coll = mongoMock.collection('gallery_metadata');
    return coll.deleteOne({ _id: id });
  }
};
