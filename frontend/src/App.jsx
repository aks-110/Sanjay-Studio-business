import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/index.js';

// Feature Pages Imports
import Home from './features/home/Home.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import Shop from './features/shop/Shop.jsx';
import Rentals from './features/rental/Rentals.jsx';
import Bookings from './features/booking/Bookings.jsx';
import Gallery from './features/gallery/Gallery.jsx';
import CustomerDashboard from './features/dashboard/CustomerDashboard.jsx';
import AdminDashboard from './features/dashboard/AdminDashboard.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Guard Component to enforce routing policies
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin/Manager Scopes */}
            <Route
              path="/dashboard/admin/*"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Super Admin', 'Rental Manager', 'Inventory Manager']}>
                  <AdminDashboard />
                </ProtectedRoute>
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
