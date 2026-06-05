import { IGalleryRepository } from './IGalleryRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseGalleryRepository extends IGalleryRepository {
  // Map PG properties to MongoDB mock property names (_id, imageUrl, sizeBytes, createdAt)
  mapImage(img) {
    if (!img) return null;
    return {
      _id: img.id,
      id: img.id,
      photographerId: img.photographer_id,
      title: img.title,
      description: img.description,
      imageUrl: img.image_url,
      tags: img.tags || [],
      dimensions: img.dimensions || { width: 1920, height: 1080 },
      sizeBytes: img.size_bytes || 500000,
      createdAt: img.created_at
    };
  }

  async getAll() {
    const { data, error } = await supabase
      .from('gallery_media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(img => this.mapImage(img));
  }

  async getFiltered(tags = []) {
    const all = await this.getAll();
    if (tags.length === 0) return all;
    return all.filter(img => tags.every(t => img.tags && img.tags.includes(t)));
  }

  async create({ photographerId, title, description, imageUrl, tags = [], dimensions, sizeBytes }) {
    // Ensure default album exists
    let { data: album } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('name', 'Default Album')
      .maybeSingle();

    if (!album) {
      const { data: newAlbum } = await supabase
        .from('gallery_albums')
        .insert({ name: 'Default Album', description: 'Default workspace album' })
        .select()
        .single();
      album = newAlbum;
    }

    const { data, error } = await supabase
      .from('gallery_media')
      .insert({
        album_id: album.id,
        photographer_id: photographerId,
        title,
        description,
        image_url: imageUrl,
        tags,
        dimensions: dimensions || { width: 1920, height: 1080 },
        size_bytes: sizeBytes || 500000
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapImage(data);
  }

  async delete(id) {
    const { error } = await supabase
      .from('gallery_media')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { deletedCount: 1 };
  }
}
