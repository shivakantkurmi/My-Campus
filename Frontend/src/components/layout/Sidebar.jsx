import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, DoorOpen, CalendarCheck,
  Calculator, ShieldCheck, User, LogOut, X,
  Megaphone, GraduationCap,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import Avatar from '../common/Avatar';

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',      icon: LayoutDashboard, roles: ['student', 'faculty', 'admin'] },
  { to: '/announcements',   label: 'Announcements',  icon: Megaphone,       roles: ['student', 'faculty', 'admin'] },
  { to: '/notes',           label: 'Notes',          icon: BookOpen,        roles: ['student', 'faculty', 'admin'] },
  { to: '/faculty-cabins',  label: 'Faculty Cabins', icon: DoorOpen,        roles: ['student', 'faculty', 'admin'] },
  { to: '/attendance',      label: 'Attendance',     icon: CalendarCheck,   roles: ['student', 'faculty'] },
  { to: '/cgpa-calculator', label: 'CGPA Calculator',icon: Calculator,      roles: ['student', 'faculty', 'admin'] },
  { to: '/admin',           label: 'Admin Panel',    icon: ShieldCheck,     roles: ['admin'] },
  { to: '/profile',         label: 'Profile',        icon: User,            roles: ['student', 'faculty', 'admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const { dark } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter((n) => n.roles.includes(user?.role));

  /* ── Role color badge ── */
  const roleBadge = {
    student: dark ? 'bg-[#c9a84c]/12 text-[#c9a84c]/80 border-[#c9a84c]/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200',
    faculty: dark ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
    admin:   dark ? 'bg-rose-500/12 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200',
  }[user?.role] || '';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${dark
          ? 'bg-[#08080f]/95 border-r border-[#c9a84c]/10 backdrop-blur-xl'
          : 'bg-white/85 border-r border-indigo-100/60 backdrop-blur-xl'
        }
      `}
      style={{
        boxShadow: dark
          ? '4px 0 32px rgba(0,0,0,0.60), inset -1px 0 0 rgba(201,168,76,0.08)'
          : '4px 0 24px rgba(99,102,241,0.08)',
      }}
      >

        {/* ── Logo / Brand ── */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          dark ? 'border-[#c9a84c]/10' : 'border-indigo-100/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`mc-glass-float w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
              dark
                ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] shadow-[#c9a84c]/30'
                : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30'
            }`} style={{ animationDuration: '4s' }}>
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                {dark
                  ? <span className="mc-gold-shimmer">My-Campus</span>
                  : <span className="mc-gradient-text">My-Campus</span>
                }
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg transition-all active:scale-90 ${
              dark
                ? 'text-[#c9a84c]/60 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── User info card ── */}
        <div className={`mx-3 my-3 p-3 rounded-2xl border ${
          dark
            ? 'bg-[#c9a84c]/5 border-[#c9a84c]/12'
            : 'bg-indigo-50/60 border-indigo-100/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="mc-pulse-glow rounded-full shrink-0">
              <Avatar name={user?.name} size={9} />
            </div>
            <div className="overflow-hidden flex-1">
              <p className={`text-sm font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name}
              </p>
              <p className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleBadge}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {filtered.map(({ to, label, icon: Icon }, idx) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={{ animationDelay: `${idx * 45}ms` }}
              className={({ isActive }) =>
                `mc-slide-bounce flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? dark
                    ? 'bg-gradient-to-r from-[#c9a84c]/18 to-[#c9a84c]/8 border border-[#c9a84c]/35 text-[#c9a84c] shadow-sm'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                  : dark
                    ? 'text-gray-500 hover:bg-[#c9a84c]/6 hover:text-[#c9a84c]/80 hover:translate-x-1'
                    : 'text-gray-500 hover:bg-indigo-50/80 hover:text-indigo-600 hover:translate-x-1'
                }`
              }
            >
              <Icon size={17} className="shrink-0 transition-transform group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className={`px-3 py-4 border-t ${dark ? 'border-[#c9a84c]/10' : 'border-indigo-100/60'}`}>
          <button
            onClick={handleLogout}
            className={`mc-btn flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 group ${
              dark
                ? 'text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 hover:translate-x-1'
                : 'text-red-500 hover:bg-red-50 hover:text-red-600 hover:translate-x-1'
            }`}
          >
            <LogOut size={17} className="mc-hover-spin shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
