import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice.js';
import { authAPI } from '../../services/api.js';
import { Camera, AlertCircle, Loader } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const data = await authAPI.register(form);
      dispatch(loginSuccess(data));
      if (data.user.role === 'Admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-extrabold text-2xl mb-2 hover:text-indigo-500 transition-colors">
            <Camera className="h-7 w-7" />
            <span>APEX<span className="text-slate-800">STUDIOS</span></span>
          </Link>
          <p className="text-xs text-slate-500">Join today and start booking shoot services & renting camera gear.</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-55 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Sarah"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Connor"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="sarah@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="+1 555-0199"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              <span>Create Account</span>
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 font-semibold">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
