import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, DoorOpen, CalendarCheck,
  Calculator, ShieldCheck, User, LogOut, X,
  Megaphone,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'] },
  { to: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['student', 'faculty', 'admin'] },
  { to: '/notes', label: 'Notes', icon: BookOpen, roles: ['student', 'faculty', 'admin'] },
  { to: '/faculty-cabins', label: 'Faculty Cabins', icon: DoorOpen, roles: ['student', 'faculty', 'admin'] },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['student', 'faculty'] },
  { to: '/cgpa-calculator', label: 'CGPA Calculator', icon: Calculator, roles: ['student', 'faculty', 'admin'] },
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] },
  { to: '/profile', label: 'Profile', icon: User, roles: ['student', 'faculty', 'admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter((n) => n.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="mc-float w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs shadow-lg shadow-indigo-500/30" style={{ animationDuration: '3.5s' }}>🎓</span>
              <span className="mc-gradient-text">My-Campus</span>
            </h1>
            <p className="text-xs text-gray-400 capitalize mt-0.5 pl-9">{user?.role}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-white active:scale-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="mc-pop-in flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="mc-pulse-glow rounded-full">
            <Avatar name={user?.name} size={10} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {filtered.map(({ to, label, icon: Icon }, idx) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={{ animationDelay: `${idx * 55}ms` }}
              className={({ isActive }) =>
                `mc-slide-bounce flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/40 scale-[1.02] mc-glow-border'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-300 hover:translate-x-1 hover:shadow-sm'}`
              }
            >
              <Icon size={18} className="transition-transform group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="mc-btn flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 hover:translate-x-1 transition-all active:scale-95"
          >
            <LogOut size={18} className="mc-hover-spin" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
