import { create } from 'zustand';
import api from '../api/axios';

const useCabinsStore = create((set, get) => ({
  cabins: [],
  loaded: false,
  loading: false,

  /** Fetch once; skip if already loaded */
  fetchCabins: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const res = await api.get('/cabins');
      set({ cabins: res.data, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  /** Force a fresh fetch (call after add / edit / delete) */
  refresh: async () => {
    set({ loaded: false, loading: true });
    try {
      const res = await api.get('/cabins');
      set({ cabins: res.data, loaded: true });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCabinsStore;
