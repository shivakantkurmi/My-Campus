import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, DoorOpen, CalendarCheck,
  Calculator, ShieldCheck, User, LogOut, X,
  Megaphone, GraduationCap, Settings, ArrowLeftRight
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
];

/* =========================================
   LIGHT THEME: FLOATING PILL SIDEBAR
   ========================================= */
function LightSidebar({ user, onClose, handleLogout, filtered }) {
  return (
    <aside className="w-[100px] h-full py-6 pl-6 lg:flex flex-col hidden z-30 transition-all">
      <div className="bg-white/85 backdrop-blur-[40px] border border-white rounded-[2rem] w-[80px] h-full flex flex-col items-center py-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] shadow-indigo-500/10 relative">
        
        {/* Top Logo */}
        <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-10 shadow-lg">
          <GraduationCap size={20} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 items-center w-full">
          {filtered.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 group relative
                ${isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100/50'
                }`
              }
            >
              <Icon size={20} className="transition-transform group-hover:scale-110" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile */}
        <div className="mt-auto flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer" onClick={handleLogout} title="Logout">
            <Avatar name={user?.name || "User"} size={40} />
          </div>
        </div>
      </div>
    </aside>
  );
}


/* =========================================
   DARK THEME: MAKE THINGS SIMPLE SIDEBAR
   ========================================= */
function DarkSidebar({ user, onClose, handleLogout, filtered }) {
  return (
    <aside className="w-64 h-full bg-[#08080f]/95 backdrop-blur-xl border-r border-[#c9a84c]/10 flex flex-col lg:flex hidden z-30 transition-all shadow-[4px_0_32px_rgba(0,0,0,0.6)]">
      
      {/* Top Logo */}
      <div className="flex items-center gap-3 px-8 py-10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8a6020] text-[#07070f] flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.4)]">
          <GraduationCap size={18} />
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">
          <span className="mc-gold-shimmer">My-Campus</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-4 gap-2 mt-4">
        {filtered.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group
              ${isActive
                ? 'bg-gradient-to-r from-[#c9a84c]/20 to-transparent text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#c9a84c] rounded-r-full shadow-[0_0_10px_rgba(201,168,76,0.8)]" />
                )}
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] text-[#07070f] shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'bg-transparent group-hover:text-gray-200'}`}>
                  <Icon size={16} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="px-4 py-8 flex flex-col gap-2 mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-gray-500 hover:text-[#c9a84c] hover:bg-[#c9a84c]/5 rounded-2xl transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5"><ArrowLeftRight size={16} /></div>
          Log out
        </button>
      </div>
    </aside>
  );
}


/* =========================================
   MOBILE SIDEBAR (Unified for both themes)
   ========================================= */
function MobileSidebar({ user, open, onClose, handleLogout, filtered, dark }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 lg:hidden ${
        dark ? 'bg-[#08080f] border-r border-[#c9a84c]/10' : 'bg-white border-r border-gray-200'
      }`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-[#c9a84c]/10' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dark ? 'bg-[#c9a84c] text-[#07070f]' : 'bg-gray-900 text-white'}`}>
              <GraduationCap size={16} />
            </div>
            <h1 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>My-Campus</h1>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${dark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filtered.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all
                ${isActive
                  ? dark ? 'bg-[#c9a84c]/20 text-white' : 'bg-gray-100 text-gray-900'
                  : dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={`px-4 py-6 border-t ${dark ? 'border-[#c9a84c]/10' : 'border-gray-100'}`}>
           <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-bold ${dark ? 'text-rose-400 hover:bg-white/5' : 'text-red-500 hover:bg-red-50'}`}>
             <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>
    </>
  );
}


export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const { dark } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter((n) => n.roles.includes(user?.role));

  return (
    <>
      {/* Mobile Drawer */}
      <MobileSidebar user={user} open={open} onClose={onClose} handleLogout={handleLogout} filtered={filtered} dark={dark} />
      
      {/* Desktop sidebars */}
      {dark ? (
        <DarkSidebar user={user} onClose={onClose} handleLogout={handleLogout} filtered={filtered} />
      ) : (
        <LightSidebar user={user} onClose={onClose} handleLogout={handleLogout} filtered={filtered} />
      )}
    </>
  );
}
