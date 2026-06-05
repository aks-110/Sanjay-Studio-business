import { IInventoryRepository } from './IInventoryRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseInventoryRepository extends IInventoryRepository {
  // Helper to map DB response to match SQLite object format
  mapItem(dbItem) {
    if (!dbItem) return null;
    return {
      id: dbItem.id,
      name: dbItem.name,
      sku: dbItem.sku,
      description: dbItem.description,
      category: dbItem.inventory_categories?.name || 'Uncategorized',
      type: dbItem.type,
      total_quantity: dbItem.total_quantity,
      available_quantity: dbItem.available_quantity,
      price_per_day: dbItem.price_per_day ? Number(dbItem.price_per_day) : null,
      sale_price: dbItem.sale_price ? Number(dbItem.sale_price) : null,
      status: dbItem.status,
      created_at: dbItem.created_at,
      updated_at: dbItem.updated_at
    };
  }

  async getCategoryIdByName(name) {
    let { data: cat } = await supabase
      .from('inventory_categories')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (!cat) {
      const { data: newCat } = await supabase
        .from('inventory_categories')
        .insert({ name })
        .select()
        .single();
      cat = newCat;
    }
    return cat.id;
  }

  async listAll() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        inventory_categories (
          name
        )
      `);

    if (error) throw error;
    
    // Sort locally to replicate the SQLite ORDER BY type, category, name
    const sorted = (data || []).map(item => this.mapItem(item));
    sorted.sort((a, b) => {
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare !== 0) return typeCompare;
      
      const catCompare = a.category.localeCompare(b.category);
      if (catCompare !== 0) return catCompare;
      
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        inventory_categories (
          name
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return this.mapItem(data);
  }

  async getBySku(sku) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        inventory_categories (
          name
        )
      `)
      .eq('sku', sku)
      .maybeSingle();

    if (error) throw error;
    return this.mapItem(data);
  }

  async create({ id, name, sku, description, category, type, total_quantity, price_per_day, sale_price, status = 'Available' }) {
    const category_id = await this.getCategoryIdByName(category);
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        id,
        category_id,
        name,
        sku,
        description,
        type,
        total_quantity,
        available_quantity: total_quantity,
        price_per_day,
        sale_price,
        status
      })
      .select(`
        *,
        inventory_categories (
          name
        )
      `)
      .single();

    if (error) throw error;

    // Log transaction
    await supabase.from('inventory_transactions').insert({
      inventory_id: data.id,
      change_type: 'CREATE',
      quantity_before: 0,
      quantity_after: total_quantity,
      reason: 'Initial item creation'
    });

    return this.mapItem(data);
  }

  async update(id, { name, sku, description, category, type, total_quantity, available_quantity, price_per_day, sale_price, status }) {
    const category_id = await this.getCategoryIdByName(category);
    const oldItem = await this.getById(id);

    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        name,
        sku,
        description,
        category_id,
        type,
        total_quantity,
        available_quantity,
        price_per_day,
        sale_price,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        inventory_categories (
          name
        )
      `)
      .single();

    if (error) throw error;

    // Log transaction if quantity changed
    if (oldItem && (oldItem.total_quantity !== total_quantity || oldItem.available_quantity !== available_quantity)) {
      await supabase.from('inventory_transactions').insert({
        inventory_id: id,
        change_type: 'UPDATE',
        quantity_before: oldItem.available_quantity,
        quantity_after: available_quantity,
        reason: `Item update. Total changed from ${oldItem.total_quantity} to ${total_quantity}.`
      });
    }

    return this.mapItem(data);
  }

  async delete(id) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async decrementAvailableQuantity(id, amount = 1, reference_type = null, reference_id = null, created_by = null) {
    const item = await this.getById(id);
    if (!item) throw new Error('Item not found');
    const newQty = item.available_quantity - amount;

    const { data, error } = await supabase
      .from('inventory_items')
      .update({ available_quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log transaction
    await supabase.from('inventory_transactions').insert({
      inventory_id: id,
      change_type: 'DECREMENT',
      quantity_before: item.available_quantity,
      quantity_after: newQty,
      reason: 'Stock deducted for booking/sale',
      reference_type,
      reference_id,
      created_by
    });

    return data;
  }

  async incrementAvailableQuantity(id, amount = 1, reference_type = null, reference_id = null, created_by = null) {
    const item = await this.getById(id);
    if (!item) throw new Error('Item not found');
    const newQty = item.available_quantity + amount;

    const { data, error } = await supabase
      .from('inventory_items')
      .update({ available_quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log transaction
    await supabase.from('inventory_transactions').insert({
      inventory_id: id,
      change_type: 'INCREMENT',
      quantity_before: item.available_quantity,
      quantity_after: newQty,
      reason: 'Stock restored (return/cancellation)',
      reference_type,
      reference_id,
      created_by
    });

    return data;
  }
}
