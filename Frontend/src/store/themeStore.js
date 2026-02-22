import { create } from 'zustand';

const useThemeStore = create((set) => ({
  dark: localStorage.getItem('mc_theme') === 'dark',

  toggleTheme: () =>
    set((state) => {
      const next = !state.dark;
      localStorage.setItem('mc_theme', next ? 'dark' : 'light');
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { dark: next };
    }),

  initTheme: () => {
    const dark = localStorage.getItem('mc_theme') === 'dark';
    if (dark) document.documentElement.classList.add('dark');
    return { dark };
  },
}));

export default useThemeStore;
