import { galleryService } from './services.js';

export const galleryController = {
  async list(req, res) {
    try {
      const { tags } = req.query;
      const tagList = tags ? tags.split(',') : [];
      const images = await galleryService.getImages(tagList);
      return res.status(200).json(images);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { title, description, imageUrl, tags, dimensions, sizeBytes } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ error: 'Title and imageUrl are required' });
      }
      const image = await galleryService.addImage(req.user.id, {
        title,
        description,
        imageUrl,
        tags,
        dimensions,
        sizeBytes
      });
      return res.status(201).json(image);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await galleryService.deleteImage(id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
