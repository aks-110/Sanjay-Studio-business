import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  theme: 'dark',
  activeModal: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    }
  }
});

export const { toggleSidebar, setSidebarOpen, setTheme, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
