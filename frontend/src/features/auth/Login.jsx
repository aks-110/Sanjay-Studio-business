import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice.js';
import { authAPI } from '../../services/api.js';
import { Camera, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const data = await authAPI.login(form);
      dispatch(loginSuccess(data));

      const role = data.user.role;
      if (['Admin', 'Super Admin', 'Rental Manager', 'Inventory Manager'].includes(role)) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'Failed to authenticate user'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-indigo-400 font-extrabold text-2xl mb-2">
            <Camera className="h-7 w-7" />
            <span>APEX<span className="text-white">STUDIOS</span></span>
          </Link>
          <p className="text-xs text-slate-400">Sign in to manage your bookings, rentals, and stationery orders.</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="customer@platform.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              <span>Sign In</span>
            </button>
          </form>

          {/* Quick Seeds Guide */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-[10px] text-slate-500">
            <p className="font-bold mb-2 uppercase text-slate-400">Sandbox Test Accounts (Password: password123):</p>
            <ul className="space-y-1">
              <li>• Admin: <span className="text-indigo-400">admin@platform.com</span></li>
              <li>• Customer: <span className="text-indigo-400">customer@platform.com</span></li>
              <li>• Photographer: <span className="text-indigo-400">photographer@platform.com</span></li>
              <li>• Rental Manager: <span className="text-indigo-400">rental@platform.com</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
