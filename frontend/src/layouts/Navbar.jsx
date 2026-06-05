import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Camera,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  ChevronDown,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { logout } from "../store/authSlice.js";
import { clearCart } from "../store/cartSlice.js";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl tracking-wider hover:text-indigo-500 transition-colors"
          >
            <Camera className="h-6 w-6 stroke-[2.5]" />
            <span>
              APEX<span className="text-slate-800">STUDIOS</span>
            </span>
          </Link>

          {/* Navigation Links (Center-aligned) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link
              to="/shop"
              className="hover:text-indigo-600 transition-colors"
            >
              Stationery Shop
            </Link>
            <Link
              to="/rentals"
              className="hover:text-indigo-600 transition-colors"
            >
              Camera Rentals
            </Link>
            <Link
              to="/bookings"
              className="hover:text-indigo-600 transition-colors"
            >
              Book Shoot
            </Link>
            <Link
              to="/gallery"
              className="hover:text-indigo-600 transition-colors"
            >
              Gallery
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* QuickStay-like Lang & Currency Switchers */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-500 mr-2">
              <button className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer">
                <span>EN</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer">
                <span>₹ INR</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* Cart Button */}
            <Link
              to="/shop"
              className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cart.totalQuantity}
                </span>
              )}
            </Link>

            {import.meta.env.VITE_USE_CLERK !== "true" ? (
              // Fallback to local authentication when Clerk is disabled
              isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={
                      user?.role === "Admin"
                        ? "/dashboard/admin"
                        : "/dashboard/customer"
                    }
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-sm shadow-indigo-600/10 cursor-pointer font-bold"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>{user?.first_name || "Dashboard"}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.02] cursor-pointer font-bold"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
              )
            ) : (
              // Live Clerk Authentication flow
              <>
                <SignedIn>
                  <div className="flex items-center gap-3">
                    {user && (
                      <Link
                        to={
                          user?.role === "Admin"
                            ? "/dashboard/admin"
                            : "/dashboard/customer"
                        }
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-sm shadow-indigo-600/10 cursor-pointer font-bold"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.02] cursor-pointer font-bold">
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
