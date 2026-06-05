import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/index.js';

// Feature Pages Imports
import Home from './features/home/Home.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import ClerkSync from './features/auth/ClerkSync.jsx';
import Shop from './features/shop/Shop.jsx';
import Rentals from './features/rental/Rentals.jsx';
import Bookings from './features/booking/Bookings.jsx';
import Gallery from './features/gallery/Gallery.jsx';
import CustomerDashboard from './features/dashboard/customer/CustomerDashboard.jsx';
import AdminDashboard from './features/dashboard/admin/AdminDashboard.jsx';

import PrivateRoute from './routes/PrivateRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import CustomerRoute from './routes/CustomerRoute.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export default function App() {
  const useClerk = import.meta.env.VITE_USE_CLERK === 'true';

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {useClerk && <ClerkSync />}
          <Routes>
            {/* Public Access */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/gallery" element={<Gallery />} />

            {/* Customer Area */}
            <Route
              path="/dashboard/customer/*"
              element={
                <CustomerRoute>
                  <CustomerDashboard />
                </CustomerRoute>
              }
            />

            {/* Admin/Manager Scopes */}
            <Route
              path="/dashboard/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
