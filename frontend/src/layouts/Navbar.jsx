import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Camera, ShoppingCart, User, LogOut, LogIn, Image } from 'lucide-react';
import { logout } from '../store/authSlice.js';
import { clearCart } from '../store/cartSlice.js';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const cart = useSelector(state => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-indigo-400 font-extrabold text-xl tracking-wider hover:text-indigo-300 transition-colors">
            <Camera className="h-6 w-6 stroke-[2.5]" />
            <span>APEX<span className="text-white">STUDIOS</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/shop" className="hover:text-indigo-400 transition-colors">Stationery Shop</Link>
            <Link to="/rentals" className="hover:text-indigo-400 transition-colors">Camera Rentals</Link>
            <Link to="/bookings" className="hover:text-indigo-400 transition-colors">Book Shoot</Link>
            <Link to="/gallery" className="hover:text-indigo-400 transition-colors">Gallery</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Link to="/shop" className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cart.totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
                  {cart.totalQuantity}
                </span>
              )}
            </Link>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to={user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Rental Manager' || user.role === 'Inventory Manager' ? '/dashboard/admin' : '/dashboard/customer'}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 hover:border-indigo-500/80 text-xs font-semibold text-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{user.first_name || 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
