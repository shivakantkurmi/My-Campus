import { Menu, Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

export default function Header({ onMenuClick, title = 'Dashboard' }) {
  const { dark, toggleTheme } = useThemeStore();

  return (
    <header className="mc-fade-down sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-500 transition-all active:scale-90"
        >
          <Menu size={20} />
        </button>
        <h2 className="mc-write-in text-lg font-semibold text-gray-800 dark:text-white tracking-tight"
          key={title}>{title}</h2>
      </div>

      <button
        onClick={toggleTheme}
        className="mc-hover-spin p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-500 dark:hover:text-yellow-400 transition-all active:scale-90"
        title="Toggle theme"
      >
        {dark
          ? <Sun size={20} className="text-yellow-400 mc-heartbeat" />
          : <Moon size={20} className="hover:text-indigo-500" />}
      </button>
    </header>
  );
}
