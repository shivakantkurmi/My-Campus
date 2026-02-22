import { Menu, Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

export default function Header({ onMenuClick, title = 'Dashboard' }) {
  const { dark, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
      </div>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Toggle theme"
      >
        {dark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
      </button>
    </header>
  );
}
