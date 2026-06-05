import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Camera, BarChart3, Users, Calendar, Repeat, ShoppingBag, 
  Database, LineChart, FileText, UserCircle, LogOut, Home, Menu, X 
} from 'lucide-react';
import { logout } from '../store/authSlice.js';
import { clearCart } from '../store/cartSlice.js';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  const isAdmin = user && user.role === 'Admin';

  // Define sidebar menu options based on role
  const adminLinks = [
    { name: 'Overview Stats', path: '/dashboard/admin', icon: BarChart3 },
    { name: 'CRM Pipelines', path: '/dashboard/admin/crm', icon: LineChart },
    { name: 'Bookings Slots', path: '/dashboard/admin/bookings', icon: Calendar },
    { name: 'Rentals Tracker', path: '/dashboard/admin/rentals', icon: Repeat },
    { name: 'E-Commerce Orders', path: '/dashboard/admin/orders', icon: ShoppingBag },
    { name: 'Inventory Control', path: '/dashboard/admin/inventory', icon: Database },
    { name: 'User Directories', path: '/dashboard/admin/users', icon: Users },
  ];

  const customerLinks = [
    { name: 'My Profile', path: '/dashboard/customer', icon: UserCircle },
    { name: 'Shoot Bookings', path: '/dashboard/customer/bookings', icon: Calendar },
    { name: 'Gear Rentals', path: '/dashboard/customer/rentals', icon: Repeat },
    { name: 'Store Orders', path: '/dashboard/customer/orders', icon: ShoppingBag },
    { name: 'Billing Invoices', path: '/dashboard/customer/invoices', icon: FileText }
  ];

  const currentLinks = isAdmin ? adminLinks : customerLinks;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-600" />
              <span className="font-bold text-sm tracking-wider text-indigo-600">APEX PORTAL</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <div className="h-px bg-slate-100 my-4"></div>

            {currentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Identity Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-700 truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-indigo-600 font-semibold truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-8">
          <div className="flex items-center">
            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 mr-3 text-slate-500 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-bold text-slate-600 tracking-wide uppercase">
              {isAdmin ? 'Management Workspace' : 'Customer Account'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              Session Active
            </span>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
