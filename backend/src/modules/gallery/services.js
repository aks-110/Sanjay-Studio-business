import { GalleryRepository } from './GalleryRepository.js';

export const galleryService = {
  async getImages(tags = []) {
    return GalleryRepository.getFiltered(tags);
  },

  async addImage(photographerId, { title, description, imageUrl, tags, dimensions, sizeBytes }) {
    return GalleryRepository.create({
      photographerId,
      title,
      description,
      imageUrl,
      tags,
      dimensions,
      sizeBytes
    });
  },

  async deleteImage(id) {
    return GalleryRepository.delete(id);
  }
};

