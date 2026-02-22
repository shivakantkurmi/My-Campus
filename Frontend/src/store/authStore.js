import { create } from 'zustand';

// Persist user & token in localStorage so page refresh keeps session
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('mc_user') || 'null'),
  token: localStorage.getItem('mc_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('mc_token', token);
    localStorage.setItem('mc_user', JSON.stringify(user));
    set({ user, token });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('mc_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: () => {
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
