import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { rentalAPI, paymentAPI, inventoryAPI } from '../../services/api.js';
import Navbar from '../../layouts/Navbar.jsx';
import { CalendarRange, Sparkles, HelpCircle, Check, Loader, AlertCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rentals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector(state => state.auth);

  // Search filter and dates
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeItem, setActiveItem] = useState(null); // Item modal detail
  const [dates, setDates] = useState({ start: '', end: '' });
  const [orderStep, setOrderStep] = useState('list'); // 'list', 'paying', 'success'
  const [activeGatewayId, setActiveGatewayId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Inventory items
  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryAPI.list
  });

  const categories = ['All', 'Camera', 'Lens', 'Lighting', 'Accessories'];
  const filteredInventory = inventory?.filter(item => {
    if (item.type !== 'Rental') return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  // Calculate rental day difference
  const calculateDays = () => {
    if (!dates.start || !dates.end) return 0;
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotalPrice = (pricePerDay) => {
    const days = calculateDays();
    return days * pricePerDay;
  };

  // Rental reservation mutation
  const createRentalMutation = useMutation({
    mutationFn: (rentalData) => rentalAPI.create(rentalData),
    onSuccess: async (rental) => {
      try {
        const checkoutSession = await paymentAPI.checkout({
          entity_type: 'Rental',
          entity_id: rental.id,
          amount: rental.total_price + rental.deposit,
          payment_method: 'Card'
        });
        setActiveGatewayId(checkoutSession.gatewayId);
        setOrderStep('paying');
      } catch (err) {
        setErrorMsg('Failed to initialize payment gateway.');
      }
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to request equipment rental.');
    }
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (gatewayId) => paymentAPI.confirm({ gatewayId }),
    onSuccess: () => {
      setOrderStep('success');
      setActiveItem(null);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => {
      setErrorMsg('Failed to process transaction.');
    }
  });

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!dates.start || !dates.end) {
      setErrorMsg('Please specify rental timeline dates.');
      return;
    }
    setErrorMsg('');

    const days = calculateDays();
    const totalPrice = days * activeItem.price_per_day;
    const deposit = activeItem.price_per_day * 2; // Flat 2-day rate deposit mockup

    createRentalMutation.mutate({
      inventory_id: activeItem.id,
      start_date: dates.start,
      end_date: dates.end,
      total_price: totalPrice,
      deposit
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orderStep === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-emerald-100 max-w-2xl mx-auto my-12 shadow-xl shadow-slate-100">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 mb-6">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-850">Rental Reserved!</h2>
            <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
              Your camera gear rental order has been confirmed. You will receive email reminders when returning equipment. Check your portal for status updates.
            </p>
            <button
              onClick={() => { setOrderStep('list'); setDates({ start: '', end: '' }); }}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Rent More Gear
            </button>
          </div>
        ) : orderStep === 'paying' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-indigo-100 max-w-xl mx-auto my-12 shadow-xl shadow-slate-100">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 mb-6 animate-bounce">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-850 mb-2">Rental Checkout</h3>
            <p className="text-xs text-slate-500 mb-6">
              Processing rental invoice: ${calculateTotalPrice(activeItem.price_per_day).toFixed(2)} + ${ (activeItem.price_per_day * 2).toFixed(2) } Security Deposit
            </p>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left text-xs font-mono space-y-2 text-slate-700">
              <p className="text-slate-400">{"// Sandbox Gateway info"}</p>
              <p><span className="text-indigo-600 font-bold">Gateway ID:</span> {activeGatewayId}</p>
              <p><span className="text-indigo-600 font-bold">Status:</span> Authorized Deposit</p>
            </div>

            <button
              onClick={() => confirmPaymentMutation.mutate(activeGatewayId)}
              disabled={confirmPaymentMutation.isPending}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {confirmPaymentMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
              <span>Simulate Pay Deposit</span>
            </button>
          </div>
        ) : (
          <>
            {/* Catalog list view */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-800">Camera Gear & Optics Rental</h2>
              </div>

              {/* Category filtration tab menu */}
              <div className="flex gap-2 flex-wrap bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                Failed to query inventory: {error.message}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory?.map((item) => (
                  <div key={item.id} className="glass-panel rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between group transition-all hover:border-indigo-200 hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                          {item.category}
                        </span>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.available_quantity > 0 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {item.available_quantity > 0 ? `${item.available_quantity} In Stock` : 'Out of Stock'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">{item.description}</p>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-base font-bold text-indigo-600">${item.price_per_day}</span>
                        <span className="text-[10px] text-slate-400 font-semibold"> / day</span>
                      </div>
                      <button
                        onClick={() => { setActiveItem(item); setErrorMsg(''); }}
                        disabled={item.available_quantity <= 0}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-[10px] font-bold text-white transition-all cursor-pointer"
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Equipment Hire Scheduler Overlay Modal */}
            {activeItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-slate-200 relative shadow-2xl">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">Rent "{activeItem.name}"</h3>
                  <p className="text-xs text-slate-500 mb-6">Price: ${activeItem.price_per_day}/day. Security deposit: ${ (activeItem.price_per_day * 2) } refundable deposit.</p>

                  {errorMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          value={dates.start}
                          onChange={(e) => setDates({ ...dates, start: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">End Date</label>
                        <input
                          type="date"
                          required
                          value={dates.end}
                          onChange={(e) => setDates({ ...dates, end: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Total Days</span>
                        <span>{calculateDays()} days</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Rental Cost</span>
                        <span>${calculateTotalPrice(activeItem.price_per_day).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Security Deposit</span>
                        <span>${ (activeItem.price_per_day * 2).toFixed(2) }</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-805 border-t border-slate-100 pt-2">
                        <span>Due Amount</span>
                        <span>${ (calculateTotalPrice(activeItem.price_per_day) + (activeItem.price_per_day * 2)).toFixed(2) }</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveItem(null)}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createRentalMutation.isPending}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {createRentalMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
                        <span>Book Rental</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
