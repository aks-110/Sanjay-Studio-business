import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
const userStr = localStorage.getItem('user');
let user = null;
let permissions = [];

if (userStr) {
  try {
    user = JSON.parse(userStr);
    permissions = JSON.parse(user.permissions || '[]');
  } catch (e) {
    console.error('Failed to parse user session storage:', e);
  }
}

const initialState = {
  user,
  token,
  permissions,
  isAuthenticated: !!token,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { user, token } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.permissions = JSON.parse(user.permissions || '[]');
      state.error = null;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateProfileSuccess(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
