import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { bookingAPI, paymentAPI } from '../../services/api.js';
import Navbar from '../../layouts/Navbar.jsx';
import { Camera, Calendar, Sparkles, AlertCircle, Check, Loader, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Bookings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  // Packages definition
  const packages = [
    {
      id: 'pkg-wedding',
      name: 'Wedding Photography Package',
      description: 'Full day coverage (8 hours), 2 shooters, 400+ high-res edited digital deliveries, online delivery portal.',
      price: 1500.00
    },
    {
      id: 'pkg-portrait',
      name: 'Standard Portrait Session',
      description: '2 hours studio or outdoor location coverage, 25 high-end retouched portraits, unlimited wardrobe changes.',
      price: 300.00
    },
    {
      id: 'pkg-corp',
      name: 'Corporate Brand Shoot',
      description: '4 hours shoot, employee headshots, environmental workspace visuals, commercial rights inclusion.',
      price: 800.00
    }
  ];

  const [selectedPkg, setSelectedPkg] = useState(packages[0]);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [orderStep, setOrderStep] = useState('form'); // 'form', 'paying', 'success'
  const [activeGatewayId, setActiveGatewayId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Booking reservation mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => bookingAPI.create(bookingData),
    onSuccess: async (booking) => {
      try {
        const checkoutSession = await paymentAPI.checkout({
          entity_type: 'Booking',
          entity_id: booking.id,
          amount: booking.total_price,
          payment_method: 'Card'
        });
        setActiveGatewayId(checkoutSession.gatewayId);
        setOrderStep('paying');
      } catch (err) {
        setErrorMsg('Failed to process payment gateway checkout.');
      }
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to create photography booking.');
    }
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (gatewayId) => paymentAPI.confirm({ gatewayId }),
    onSuccess: () => {
      setOrderStep('success');
    },
    onError: () => {
      setErrorMsg('Failed to verify transaction.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!date) {
      setErrorMsg('Please select a booking date.');
      return;
    }
    setErrorMsg('');

    createBookingMutation.mutate({
      service_type: selectedPkg.name,
      booking_date: date,
      total_price: selectedPkg.price,
      notes
    });
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orderStep === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-emerald-500/20 max-w-2xl mx-auto my-12 shadow-xl shadow-emerald-500/5">
            <div className="h-16 w-16 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/30 mb-6">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Booking Scheduled!</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
              Your photography shoot appointment has been confirmed. A photographer has been allocated to your date. Check details in your account dashboard.
            </p>
            <button
              onClick={() => { setOrderStep('form'); setDate(''); setNotes(''); }}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Book Another Session
            </button>
          </div>
        ) : orderStep === 'paying' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-indigo-500/20 max-w-xl mx-auto my-12 shadow-xl shadow-indigo-500/5">
            <div className="h-12 w-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-500/10 mb-6 animate-bounce">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shoot Payment</h3>
            <p className="text-xs text-slate-400 mb-6">Confirm payment capture simulation for: ${selectedPkg.price.toFixed(2)}</p>

            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 text-left text-xs font-mono space-y-2">
              <p className="text-slate-500">{"// Sandbox logs"}</p>
              <p><span className="text-indigo-400">Gateway ID:</span> {activeGatewayId}</p>
              <p><span className="text-indigo-400">Entity:</span> Booking Payment</p>
            </div>

            <button
              onClick={() => confirmPaymentMutation.mutate(activeGatewayId)}
              disabled={confirmPaymentMutation.isPending}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              {confirmPaymentMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
              <span>Simulate Pay Now</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Packages panel */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h2 className="text-2xl font-bold tracking-tight text-white">Photography Shoot Packages</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">Select a preconfigured photography package to launch schedules booking.</p>

              <div className="space-y-4">
                {packages.map(pkg => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`glass-panel p-6 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/5' 
                          : 'border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm text-white">{pkg.name}</h3>
                        <span className="text-sm font-bold text-indigo-300">${pkg.price}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{pkg.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Schedule scheduler */}
            <div className="w-full">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 sticky top-24">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">Schedule Session</h3>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl text-xs space-y-2">
                    <p className="font-bold text-slate-300">Package Details</p>
                    <p className="text-slate-400">{selectedPkg.name}</p>
                    <div className="flex justify-between font-semibold text-indigo-300 pt-2 border-t border-slate-800">
                      <span>Rate</span>
                      <span>${selectedPkg.price}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Additional Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify location details, reference preferences..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
                  >
                    {createBookingMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
                    <span>Book Session</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
