import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  analyticsAPI, crmAPI, bookingAPI, rentalAPI, shopAPI, inventoryAPI, authAPI 
} from '../../services/api.js';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Users, Calendar, Repeat, ShoppingBag, Database, DollarSign,
  TrendingUp, CheckCircle, Clock, AlertTriangle, Plus, Edit3, Trash2, ArrowUpRight, Loader, ShieldAlert 
} from 'lucide-react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  // Panels: 'stats', 'crm', 'bookings', 'rentals', 'orders', 'inventory', 'users'
  const [panel, setPanel] = useState('stats');

  // Modal/Creation states
  const [activeItem, setActiveItem] = useState(null); // Used for editing leads or inventory items
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    name: '', sku: '', description: '', category: 'Camera', type: 'Rental',
    total_quantity: 1, price_per_day: 0, sale_price: 0
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: analyticsAPI.dashboard });
  const { data: leads } = useQuery({ queryKey: ['admin-leads'], queryFn: crmAPI.listLeads, enabled: panel === 'crm' });
  const { data: bookings } = useQuery({ queryKey: ['admin-bookings'], queryFn: bookingAPI.list, enabled: panel === 'bookings' });
  const { data: rentals } = useQuery({ queryKey: ['admin-rentals'], queryFn: rentalAPI.list, enabled: panel === 'rentals' });
  const { data: orders } = useQuery({ queryKey: ['admin-orders'], queryFn: shopAPI.getOrders, enabled: panel === 'orders' });
  const { data: inventory } = useQuery({ queryKey: ['admin-inventory'], queryFn: inventoryAPI.list, enabled: panel === 'inventory' });
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: authAPI.listUsers, enabled: panel === 'users' });

  // Mutations
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => crmAPI.updateLead(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-leads'] }); setActiveItem(null); }
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => bookingAPI.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); }
  });

  const updateRentalMutation = useMutation({
    mutationFn: ({ id, status }) => rentalAPI.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-rentals'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); }
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }) => shopAPI.updateOrderStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); }
  });

  const addInventoryMutation = useMutation({
    mutationFn: (data) => inventoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setAddInventoryOpen(false);
      setInventoryForm({ name: '', sku: '', description: '', category: 'Camera', type: 'Rental', total_quantity: 1, price_per_day: 0, sale_price: 0 });
    }
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id) => inventoryAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-inventory'] }); }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ userId, data }) => authAPI.updatePermissions(userId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setActiveItem(null); }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
      case 'Paid':
      case 'Delivered':
      case 'Won':
      case 'Available':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/20">{status}</span>;
      case 'Pending':
      case 'Contacted':
      case 'New':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-500/20">{status}</span>;
      case 'Cancelled':
      case 'Overdue':
      case 'Failed':
      case 'Lost':
      case 'Maintenance':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-950 text-red-400 border border-red-500/20">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-950 text-slate-400 border border-slate-800">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      {/* Dynamic panel selection menu bar */}
      <div className="flex gap-2 flex-wrap border-b border-slate-800 pb-6 mb-8">
        <button
          onClick={() => setPanel('stats')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview Statistics
        </button>
        <button
          onClick={() => setPanel('crm')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'crm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CRM Leads
        </button>
        <button
          onClick={() => setPanel('bookings')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'bookings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bookings Logs
        </button>
        <button
          onClick={() => setPanel('rentals')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'rentals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Rentals Tracker
        </button>
        <button
          onClick={() => setPanel('orders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Shop Orders
        </button>
        <button
          onClick={() => setPanel('inventory')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Inventory Control
        </button>
        <button
          onClick={() => setPanel('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            panel === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          User Permissions
        </button>
      </div>

      {/* Overview stats view */}
      {panel === 'stats' && (
        <div className="space-y-8">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="glass-panel h-28 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Sales Revenue</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">${stats?.cards?.totalRevenue.toFixed(2)}</h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-950 border border-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Photography Shoots</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{stats?.cards?.bookings}</h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-950 border border-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Rentals</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{stats?.cards?.rentals}</h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-950 border border-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    <Repeat className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Stationery Orders</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{stats?.cards?.orders}</h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-950 border border-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Chart panels */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Revenue Growth Timeline</h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.charts?.salesTimeline}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CRM leads view */}
      {panel === 'crm' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">CRM Lead Pipeline Tracker</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Pipeline Notes</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Lead Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads?.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-900/30">
                    <td className="p-4">
                      <p className="font-semibold text-white">{lead.customer_name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{lead.customer_email}</p>
                    </td>
                    <td className="p-4 max-w-xs text-slate-300 truncate whitespace-pre-line">{lead.notes}</td>
                    <td className="p-4 text-slate-300">{lead.agent_name || 'Unassigned'}</td>
                    <td className="p-4">{getStatusBadge(lead.lead_status)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveItem(lead)}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-[10px] font-bold text-indigo-400"
                      >
                        Edit Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings log management */}
      {panel === 'bookings' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">Photography Bookings Manager</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service Package</th>
                  <th className="p-4">Shoot Date</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4">Pricing</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings?.map(b => (
                  <tr key={b.id} className="hover:bg-slate-900/30">
                    <td className="p-4 font-semibold text-white">{b.customer_name}</td>
                    <td className="p-4 text-slate-300">{b.service_type}</td>
                    <td className="p-4 text-slate-300">{b.booking_date}</td>
                    <td className="p-4 text-slate-300">{b.photographer_name || 'Unallocated'}</td>
                    <td className="p-4 font-bold text-indigo-300">${b.total_price}</td>
                    <td className="p-4">{getStatusBadge(b.status)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => updateBookingMutation.mutate({ id: b.id, status: 'Confirmed' })}
                        className="px-2 py-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateBookingMutation.mutate({ id: b.id, status: 'Completed' })}
                        className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold"
                      >
                        Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rentals tracker management */}
      {panel === 'rentals' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">Equipment Rentals Manager</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Renter</th>
                  <th className="p-4">Equipment Description</th>
                  <th className="p-4">Timeline</th>
                  <th className="p-4">Total Quote</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rentals?.map(r => (
                  <tr key={r.id} className="hover:bg-slate-900/30">
                    <td className="p-4 font-semibold text-white">{r.customer_name}</td>
                    <td className="p-4 text-slate-300">{r.equipment_name}</td>
                    <td className="p-4 text-slate-400">{r.start_date} to {r.end_date}</td>
                    <td className="p-4 font-bold text-indigo-300">${r.total_price.toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(r.status)}</td>
                    <td className="p-4 text-right">
                      {r.status !== 'Returned' && (
                        <button
                          onClick={() => updateRentalMutation.mutate({ id: r.id, status: 'Returned' })}
                          className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory control management */}
      {panel === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Central Inventory Database</h3>
            <button
              onClick={() => setAddInventoryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stock Item</span>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">SKU / Item Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Stock Levels (Available / Total)</th>
                    <th className="p-4">Pricing</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventory?.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/30">
                      <td className="p-4">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{item.sku}</p>
                      </td>
                      <td className="p-4 text-slate-300">{item.category}</td>
                      <td className="p-4 text-slate-300">{item.type}</td>
                      <td className="p-4 text-slate-300">{item.available_quantity} / {item.total_quantity}</td>
                      <td className="p-4 text-indigo-300 font-bold">
                        {item.type === 'Rental' ? `$${item.price_per_day}/day` : `$${item.sale_price}`}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => deleteInventoryMutation.mutate(item.id)}
                          className="p-1.5 rounded border border-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-500 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User permissions config */}
      {panel === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">User Roles & Access Directories</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">User details</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Capabilities Permissions List</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users?.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/30">
                    <td className="p-4">
                      <p className="font-semibold text-white">{u.first_name} {u.last_name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{u.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-indigo-300">{u.role}</td>
                    <td className="p-4 max-w-xs truncate text-slate-400 font-mono text-[10px]">
                      {u.permissions}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveItem(u)}
                        className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-indigo-950 hover:text-indigo-400 text-[10px] font-bold text-slate-400 transition-all"
                      >
                        Modify Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modify user permissions dialog overlay */}
      {activeItem && panel === 'users' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-slate-800 relative">
            <h3 className="font-bold text-white text-base mb-2">Modify Permissions</h3>
            <p className="text-xs text-slate-400 mb-6">Update capabilities array for user: {activeItem.email}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const role = formData.get('role');
                const perms = formData.get('permissions').split(',').map(s => s.trim());
                updatePermissionsMutation.mutate({
                  userId: activeItem.id,
                  data: { role, permissions: perms }
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={activeItem.role}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Rental Manager">Rental Manager</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Permissions Keys (comma separated)</label>
                <textarea
                  name="permissions"
                  defaultValue={JSON.parse(activeItem.permissions || '[]').join(', ')}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all"
                >
                  Save Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit CRM lead dialog overlay */}
      {activeItem && panel === 'crm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-slate-800 relative">
            <h3 className="font-bold text-white text-base mb-2">Edit CRM Lead Stage</h3>
            <p className="text-xs text-slate-400 mb-6">Modify customer interest tags and update pipeline agent.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const lead_status = formData.get('lead_status');
                const notes = formData.get('notes');
                updateLeadMutation.mutate({
                  id: activeItem.id,
                  data: { lead_status, notes, assigned_agent_id: activeItem.assigned_agent_id }
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pipeline Stage</label>
                <select
                  name="lead_status"
                  defaultValue={activeItem.lead_status}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Interaction Notes</label>
                <textarea
                  name="notes"
                  defaultValue={activeItem.notes}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Item dialog overlay */}
      {addInventoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-slate-800 relative">
            <h3 className="font-bold text-white text-base mb-2">Add New Stock Item</h3>
            <p className="text-xs text-slate-400 mb-6">Create new stationery product listings or camera rental units.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addInventoryMutation.mutate(inventoryForm);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  placeholder="e.g. Nikon Z6 Mirrorless"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.sku}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })}
                    placeholder="SKU-NIK-001"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <select
                    value={inventoryForm.category}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Camera">Camera</option>
                    <option value="Lens">Lens</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Allocation Type</label>
                  <select
                    value={inventoryForm.type}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Rental">Rental Gear</option>
                    <option value="Sale">Stationery Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={inventoryForm.total_quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, total_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea
                  value={inventoryForm.description}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {inventoryForm.type === 'Rental' ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Price per day</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inventoryForm.price_per_day}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, price_per_day: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sale price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inventoryForm.sale_price}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, sale_price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setAddInventoryOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
