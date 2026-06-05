import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../../store/cartSlice.js';
import { shopAPI, paymentAPI } from '../../services/api.js';
import Navbar from '../../layouts/Navbar.jsx';
import { ShoppingBag, Trash2, CreditCard, Sparkles, Check, AlertCircle, ShoppingCart, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Shop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cart = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  const [address, setAddress] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('shop'); // 'shop', 'checkout', 'paying', 'success'
  const [activeGatewayId, setActiveGatewayId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Stationery items
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: shopAPI.getProducts
  });

  // Checkout order placement mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => shopAPI.createOrder(orderData),
    onSuccess: async (order) => {
      // 2. Initialize checkout session
      try {
        const checkoutSession = await paymentAPI.checkout({
          entity_type: 'Order',
          entity_id: order.id,
          amount: order.total_amount,
          payment_method: 'Card'
        });
        setActiveGatewayId(checkoutSession.gatewayId);
        setCheckoutStep('paying');
      } catch (err) {
        setErrorMsg('Failed to initialize payment gateway checkout.');
      }
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to place e-commerce order.');
    }
  });

  // Confirm payment success mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (gatewayId) => paymentAPI.confirm({ gatewayId }),
    onSuccess: () => {
      dispatch(clearCart());
      setCheckoutStep('success');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      setErrorMsg('Failed to process verified transaction confirmation.');
    }
  });

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!address) {
      setErrorMsg('Please specify a delivery address.');
      return;
    }
    setErrorMsg('');
    
    // 1. Submit order lines
    const itemsPayload = cart.items.map(item => ({
      inventory_id: item.id,
      quantity: item.quantity
    }));
    createOrderMutation.mutate({
      items: itemsPayload,
      shipping_address: address
    });
  };

  const handleConfirmPay = () => {
    confirmPaymentMutation.mutate(activeGatewayId);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <Navbar />

      {/* Main body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        
        {checkoutStep === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-emerald-100 max-w-2xl mx-auto my-12 shadow-xl shadow-slate-100">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 mb-6">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-850">Purchase Confirmed!</h2>
            <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
              Your stationery order has been successfully placed. Your payment has been captured and an invoice has been generated for your record.
            </p>
            <button
              onClick={() => { setCheckoutStep('shop'); setAddress(''); }}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : checkoutStep === 'paying' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl border border-indigo-100 max-w-xl mx-auto my-12 shadow-xl shadow-slate-100">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 mb-6 animate-bounce">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-855 mb-2">Razorpay Checkout Sandbox</h3>
            <p className="text-xs text-slate-500 mb-6">Confirm payment capture simulation for order total ${cart.totalAmount.toFixed(2)}</p>
            
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left text-xs font-mono space-y-2 text-slate-700">
              <p className="text-slate-400">{"// Sandbox logs"}</p>
              <p><span className="text-indigo-600 font-bold">Gateway ID:</span> {activeGatewayId}</p>
              <p><span className="text-indigo-600 font-bold">Method:</span> Mock Credit Card</p>
              <p><span className="text-indigo-600 font-bold">Status:</span> Pending Capture</p>
            </div>

            <button
              onClick={handleConfirmPay}
              disabled={confirmPaymentMutation.isPending}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {confirmPaymentMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
              <span>Simulate Pay Now</span>
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fine Curated Stationery</h2>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  Error loading catalog items: {error.message}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products?.map((item) => (
                    <div key={item.id} className="glass-panel rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between group transition-all hover:border-indigo-200 hover:shadow-lg">
                      <div className="p-6">
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3 inline-block">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm mb-2">{item.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">{item.description}</p>
                      </div>
                      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-base font-bold text-indigo-600">${item.sale_price}</span>
                        <button
                          onClick={() => dispatch(addToCart(item))}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition-all active:scale-95 cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Side panel */}
            <div className="w-full md:w-96 shrink-0">
              <div className="glass-panel p-6 rounded-2xl border border-slate-100 sticky top-24">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <ShoppingCart className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Shopping Cart</h3>
                </div>

                {cart.items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-xs text-slate-400">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                            <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">${item.price} each</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => dispatch(updateQuantity({ id: item.id, quantity: Number(e.target.value) }))}
                              className="w-10 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Items Subtotal</span>
                        <span>${cart.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shipping Address</label>
                        <textarea
                          required
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Provide delivery location address..."
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={createOrderMutation.isPending}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {createOrderMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
                        <span>Process Checkout</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
