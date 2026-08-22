import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';

export default function Header({ onMenuClick, title = 'Dashboard' }) {
  const { dark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <header className={`mc-fade-down sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 transition-all ${
      dark
        ? 'bg-[#050508]/60 border-b border-[#c9a84c]/20 backdrop-blur-[30px]'
        : 'bg-white/40 border-b border-white/80 backdrop-blur-[40px] rounded-l-[2rem] ml-2 lg:ml-4 mt-4 lg:mt-6 border border-r-0'
    }`}
    >
      {/* Left — hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2.5 rounded-2xl transition-all active:scale-90 ${
            dark
              ? 'text-[#c9a84c] bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/20 shadow-[0_0_15px_rgba(201,168,76,0.2)]'
              : 'text-gray-900 bg-white/70 hover:bg-white border border-white shadow-sm'
          }`}
        >
          <Menu size={19} />
        </button>

        <div>
          <h2
            className={`mc-write-in text-base sm:text-lg font-bold tracking-tight leading-none ${
              dark ? 'text-white' : 'text-gray-800'
            }`}
            key={title}
          >
            {title}
          </h2>
          {user?.department && (
            <p className={`text-xs mt-0.5 hidden sm:block ${dark ? 'text-[#c9a84c]/50' : 'text-gray-400'}`}>
              {user.department}
            </p>
          )}
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Bell (decorative but styled) */}
        <button className={`relative p-2 rounded-xl transition-all active:scale-90 ${
          dark
            ? 'text-[#c9a84c]/50 hover:bg-[#c9a84c]/10 hover:text-[#c9a84c]/80 border border-[#c9a84c]/10'
            : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 border border-indigo-100/60'
        }`}>
          <Bell size={18} />
          {/* Notification dot */}
          <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
            dark ? 'bg-[#c9a84c]' : 'bg-indigo-500'
          }`} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className={`p-2 rounded-xl transition-all active:scale-90 ${
            dark
              ? 'text-[#c9a84c] hover:bg-[#c9a84c]/10 border border-[#c9a84c]/20'
              : 'text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 border border-indigo-100'
          }`}
        >
          {dark
            ? <Sun size={18} className="mc-heartbeat" />
            : <Moon size={18} />}
        </button>

        {/* Avatar chip */}
        <div className={`hidden sm:flex items-center gap-2 pl-3 ml-1 border-l ${
          dark ? 'border-[#c9a84c]/12' : 'border-indigo-100'
        }`}>
          <div className="shrink-0">
            <Avatar name={user?.name} size={8} />
          </div>
          <div className="hidden md:block">
            <p className={`text-xs font-semibold leading-none ${dark ? 'text-white' : 'text-gray-800'}`}>
              {user?.name?.split(' ')[0]}
            </p>
            <p className={`text-[10px] mt-0.5 capitalize ${dark ? 'text-[#c9a84c]/60' : 'text-gray-400'}`}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
