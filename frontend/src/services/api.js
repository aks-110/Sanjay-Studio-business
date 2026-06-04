import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // necessary for HttpOnly cookie exchange
});

// Automatically inject JWT token into header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified API service mappings
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  getProfile: () => api.get('/users/profile').then(r => r.data),
  updateProfile: (data) => api.put('/users/profile', data).then(r => r.data),
  listUsers: () => api.get('/users').then(r => r.data),
  updatePermissions: (userId, data) => api.put(`/users/${userId}/permissions`, data).then(r => r.data)
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data).then(r => r.data),
  list: () => api.get('/bookings').then(r => r.data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }).then(r => r.data)
};

export const rentalAPI = {
  create: (data) => api.post('/rentals', data).then(r => r.data),
  list: () => api.get('/rentals').then(r => r.data),
  updateStatus: (id, status) => api.patch(`/rentals/${id}/status`, { status }).then(r => r.data)
};

export const shopAPI = {
  getProducts: () => api.get('/shop/products').then(r => r.data),
  createOrder: (data) => api.post('/shop/orders', data).then(r => r.data),
  getOrders: () => api.get('/shop/orders').then(r => r.data),
  updateOrderStatus: (id, status) => api.patch(`/shop/orders/${id}/status`, { status }).then(r => r.data)
};

export const inventoryAPI = {
  list: () => api.get('/inventory').then(r => r.data),
  create: (data) => api.post('/inventory', data).then(r => r.data),
  update: (id, data) => api.put(`/inventory/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/inventory/${id}`).then(r => r.data)
};

export const crmAPI = {
  listLeads: () => api.get('/crm').then(r => r.data),
  updateLead: (id, data) => api.put(`/crm/${id}`, data).then(r => r.data)
};

export const paymentAPI = {
  checkout: (data) => api.post('/payments/checkout', data).then(r => r.data),
  confirm: (data) => api.post('/payments/confirm', data).then(r => r.data),
  invoices: () => api.get('/payments/invoices').then(r => r.data)
};

export const galleryAPI = {
  list: (tags = '') => api.get(`/gallery${tags ? '?tags=' + tags : ''}`).then(r => r.data),
  create: (data) => api.post('/gallery', data).then(r => r.data),
  delete: (id) => api.delete(`/gallery/${id}`).then(r => r.data)
};

export const reviewAPI = {
  list: (type, id) => api.get(`/reviews/${type}/${id}`).then(r => r.data),
  create: (data) => api.post('/reviews', data).then(r => r.data)
};

export const notificationAPI = {
  list: () => api.get('/notifications').then(r => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data)
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard').then(r => r.data)
};

export default api;
