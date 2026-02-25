import { create } from 'zustand';
import api from '../api/axios';

const useAdminStore = create((set, get) => ({
  users: [],
  notes: [],
  complaints: [],
  stats: {},
  loaded: false,
  loading: false,

  /** Fetch once per session; skip if already loaded */
  fetchAll: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const [u, n, c, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/notes'),
        api.get('/admin/complaints'),
        api.get('/stats'),
      ]);
      set({
        users: u.data,
        notes: n.data,
        complaints: c.data,
        stats: s.data,
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  /** Force a fresh fetch (call after block / unblock / delete / resolve / new user) */
  refresh: async () => {
    set({ loaded: false, loading: true });
    try {
      const [u, n, c, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/notes'),
        api.get('/admin/complaints'),
        api.get('/stats'),
      ]);
      set({
        users: u.data,
        notes: n.data,
        complaints: c.data,
        stats: s.data,
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  /** Mark data as stale so next fetchAll() triggers a real fetch.
   *  Call this from anywhere outside the admin panel (e.g. after new user registers). */
  invalidate: () => set({ loaded: false }),
}));

export default useAdminStore;
