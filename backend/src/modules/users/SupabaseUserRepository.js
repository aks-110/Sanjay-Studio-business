import { IUserRepository } from './IUserRepository.js';
import { supabase } from '../../shared/database/client.js';

export class SupabaseUserRepository extends IUserRepository {
  // Helper to map DB response to match SQLite object format
  mapUser(dbUser) {
    if (!dbUser) return null;
    const roleName = dbUser.user_roles?.[0]?.role?.name || 'Customer';
    
    const permissionsList = [];
    if (dbUser.user_roles) {
      for (const ur of dbUser.user_roles) {
        if (ur.role && ur.role.role_permissions) {
          for (const rp of ur.role.role_permissions) {
            if (rp.permission && rp.permission.name) {
              permissionsList.push(rp.permission.name);
            }
          }
        }
      }
    }
    const uniquePermissions = [...new Set(permissionsList)];

    return {
      id: dbUser.id,
      email: dbUser.email,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      phone: dbUser.phone,
      role: roleName,
      permissions: JSON.stringify(uniquePermissions),
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    };
  }

  async getById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (
          role:roles (
            name,
            role_permissions (
              permission:permissions (
                name
              )
            )
          )
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return this.mapUser(data);
  }

  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (
          role:roles (
            name,
            role_permissions (
              permission:permissions (
                name
              )
            )
          )
        )
      `)
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Preserve the password_hash when returning full user record for authentication
    const mapped = this.mapUser(data);
    mapped.password_hash = data.password_hash;
    return mapped;
  }

  async getFirstUserByRole(roleName) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles!inner (
          role:roles!inner (
            name
          )
        )
      `)
      .eq('user_roles.role.name', roleName)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return this.mapUser(data);
  }

  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (
          role:roles (
            name,
            role_permissions (
              permission:permissions (
                name
              )
            )
          )
        )
      `);

    if (error) throw error;
    return (data || []).map(u => this.mapUser(u));
  }

  async create({ id, email, password_hash, first_name, last_name, phone, role = 'Customer', permissions = [] }) {
    // 1. Insert user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ id, email, password_hash, first_name, last_name, phone })
      .select()
      .single();

    if (userError) throw userError;

    // 2. Fetch role ID
    let { data: roleRecord, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .maybeSingle();

    if (roleError) throw roleError;

    if (!roleRecord) {
      // Create role if it doesn't exist
      const { data: newRole, error: newRoleError } = await supabase
        .from('roles')
        .insert({ name: role })
        .select()
        .single();
      if (newRoleError) throw newRoleError;
      roleRecord = newRole;
    }

    // 3. Link user to role
    const { error: linkError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role_id: roleRecord.id });

    if (linkError) throw linkError;

    // 4. Ensure permissions exist and link them to the role
    if (permissions && permissions.length > 0) {
      for (const permName of permissions) {
        let { data: permRecord } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', permName)
          .maybeSingle();

        if (!permRecord) {
          const { data: newPerm } = await supabase
            .from('permissions')
            .insert({ name: permName })
            .select()
            .single();
          permRecord = newPerm;
        }

        const { error: rolePermError } = await supabase
          .from('role_permissions')
          .upsert(
            {
              role_id: roleRecord.id,
              permission_id: permRecord.id
            },
            {
              onConflict: 'role_id,permission_id'
            }
          );

        if (rolePermError) {
          throw rolePermError;
        }
      }
    }

    return this.getById(user.id);
  }

  async updateProfile(userId, { first_name, last_name, phone }) {
    const { error } = await supabase
      .from('users')
      .update({ first_name, last_name, phone, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return this.getById(userId);
  }

  async updateRoleAndPermissions(userId, { role, permissions }) {
    // 1. Get role ID or create role
    let { data: roleRecord } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .maybeSingle();

    if (!roleRecord) {
      const { data: newRole } = await supabase
        .from('roles')
        .insert({ name: role })
        .select()
        .single();
      roleRecord = newRole;
    }

    // 2. Update user_roles mapping
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('user_roles').insert({ user_id: userId, role_id: roleRecord.id });

    // 3. Re-assign permissions to the role
    if (permissions && permissions.length > 0) {
      // Ensure all permissions exist in database
      const permIds = [];
      for (const permName of permissions) {
        let { data: permRecord } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', permName)
          .maybeSingle();

        if (!permRecord) {
          const { data: newPerm } = await supabase
            .from('permissions')
            .insert({ name: permName })
            .select()
            .single();
          permRecord = newPerm;
        }
        if (permRecord) {
          permIds.push(permRecord.id);
        }
      }

      // Clear existing permissions for this role and insert new ones
      await supabase.from('role_permissions').delete().eq('role_id', roleRecord.id);
      
      const rolePerms = permIds.map(pid => ({ role_id: roleRecord.id, permission_id: pid }));
      if (rolePerms.length > 0) {
        await supabase.from('role_permissions').insert(rolePerms);
      }
    }

    return this.getById(userId);
  }
}
