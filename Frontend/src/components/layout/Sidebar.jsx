import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, DoorOpen, CalendarCheck,
  Calculator, ShieldCheck, User, LogOut, X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'] },
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
              <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">🎓</span>
              My-Campus
            </h1>
            <p className="text-xs text-gray-400 capitalize mt-0.5 pl-9">{user?.role}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Avatar name={user?.name} photo={user?.profilePhoto} size={10} />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {filtered.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
