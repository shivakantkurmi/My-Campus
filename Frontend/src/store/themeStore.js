import { create } from 'zustand';

/* Default to dark mode unless the user has explicitly chosen light */
const prefersDark = localStorage.getItem('mc_theme') !== 'light';

/* Apply immediately so there's no flash of light mode */
if (prefersDark) document.documentElement.classList.add('dark');

const useThemeStore = create((set) => ({
  dark: prefersDark,

  toggleTheme: () =>
    set((state) => {
      const next = !state.dark;
      localStorage.setItem('mc_theme', next ? 'dark' : 'light');
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { dark: next };
    }),

  initTheme: () =>
    set(() => {
      const dark = localStorage.getItem('mc_theme') !== 'light';
      if (dark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { dark };
    }),
}));

export default useThemeStore;
