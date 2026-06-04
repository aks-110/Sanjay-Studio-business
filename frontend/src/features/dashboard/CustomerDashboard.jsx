import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { authAPI, bookingAPI, rentalAPI, shopAPI, paymentAPI } from '../../services/api.js';
import { updateProfileSuccess } from '../../store/authSlice.js';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { User, Calendar, Repeat, ShoppingBag, FileText, CheckCircle, Clock, AlertCircle, Printer, Loader } from 'lucide-react';

export default function CustomerDashboard() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // States
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'bookings', 'rentals', 'orders', 'invoices'
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch customer datasets
  const { data: bookings } = useQuery({ queryKey: ['customer-bookings'], queryFn: bookingAPI.list, enabled: activeTab === 'bookings' });
  const { data: rentals } = useQuery({ queryKey: ['customer-rentals'], queryFn: rentalAPI.list, enabled: activeTab === 'rentals' });
  const { data: orders } = useQuery({ queryKey: ['customer-orders'], queryFn: shopAPI.getOrders, enabled: activeTab === 'orders' });
  const { data: invoices } = useQuery({ queryKey: ['customer-invoices'], queryFn: paymentAPI.invoices, enabled: activeTab === 'invoices' });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (updatedUser) => {
      dispatch(updateProfileSuccess(updatedUser));
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
      case 'Paid':
      case 'Delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/20 capitalize">{status}</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-500/20 capitalize">{status}</span>;
      case 'Cancelled':
      case 'Overdue':
      case 'Failed':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-950 text-red-400 border border-red-500/20 capitalize">{status}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-950 text-slate-400 border border-slate-800 capitalize">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      {/* Dashboard Sub-tabs bar menu */}
      <div className="flex gap-2 flex-wrap border-b border-slate-800 pb-6 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'bookings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Shoot Bookings</span>
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rentals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Repeat className="h-4 w-4" />
          <span>Gear Rentals</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Shop Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'invoices' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Billing Invoices</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 max-w-xl shadow-xl">
          <h3 className="font-bold text-white text-base mb-2">Edit Account Profile</h3>
          <p className="text-xs text-slate-400 mb-6">Modify details regarding your primary notification address.</p>

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              {updateProfileMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
              <span>Save Profile</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">Photography Bookings Log</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Service Package</th>
                  <th className="p-4">Shoot Date</th>
                  <th className="p-4">Photographer</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No photography shoot sessions scheduled.</td>
                  </tr>
                ) : (
                  bookings?.map(b => (
                    <tr key={b.id} className="hover:bg-slate-900/30">
                      <td className="p-4 font-semibold text-white">{b.service_type}</td>
                      <td className="p-4 text-slate-300">{b.booking_date}</td>
                      <td className="p-4 text-slate-300">{b.photographer_name || 'Allocating...'}</td>
                      <td className="p-4 text-indigo-300 font-bold">${b.total_price}</td>
                      <td className="p-4">{getStatusBadge(b.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">Camera Gear Hire Log</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Equipment Description</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Deposit</th>
                  <th className="p-4">Hire Price</th>
                  <th className="p-4">Rental Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rentals?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No active camera gear rental allocations.</td>
                  </tr>
                ) : (
                  rentals?.map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/30">
                      <td className="p-4 font-semibold text-white">{r.equipment_name}</td>
                      <td className="p-4 text-slate-300">{r.start_date}</td>
                      <td className="p-4 text-slate-300">{r.end_date}</td>
                      <td className="p-4 text-slate-300">${r.deposit.toFixed(2)}</td>
                      <td className="p-4 text-indigo-300 font-bold">${r.total_price.toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(r.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">E-Commerce Orders Log</h3>
          <div className="space-y-6">
            {orders?.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No stationery purchase orders placed yet.</p>
            ) : (
              orders?.map(order => (
                <div key={order.id} className="border border-slate-850 bg-slate-900/10 rounded-2xl p-6">
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Order ID: <span className="font-mono text-[10px] text-slate-200">{order.id}</span></p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Placed on {order.created_at}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-indigo-300">Total: ${order.total_amount.toFixed(2)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map(it => (
                      <div key={it.id} className="flex justify-between text-xs text-slate-300">
                        <span>{it.product_name} <span className="text-slate-500">x {it.quantity}</span></span>
                        <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <h3 className="font-bold text-white text-base mb-4">Account Invoices</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Invoice Number</th>
                  <th className="p-4">Date Generated</th>
                  <th className="p-4">Invoice Total (inc. Tax)</th>
                  <th className="p-4">Tax Component</th>
                  <th className="p-4">Billing Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No invoices generated for this account.</td>
                  </tr>
                ) : (
                  invoices?.map(i => (
                    <tr key={i.id} className="hover:bg-slate-900/30">
                      <td className="p-4 font-mono font-bold text-slate-200">{i.invoice_number}</td>
                      <td className="p-4 text-slate-300">{i.created_at}</td>
                      <td className="p-4 text-indigo-300 font-bold">${i.total_amount.toFixed(2)}</td>
                      <td className="p-4 text-slate-400">${i.tax_amount.toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(i.status)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => window.alert(`Mock PDF download initiated for Invoice ${i.invoice_number}`)}
                          className="p-1.5 bg-slate-850 hover:bg-indigo-650 hover:text-white rounded-lg border border-slate-800 text-slate-400 inline-flex items-center gap-1.5 transition-all text-[10px] font-bold"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
