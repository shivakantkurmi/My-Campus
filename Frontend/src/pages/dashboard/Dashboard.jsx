import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, BookOpen, DoorOpen, CalendarCheck, Calculator, ShieldCheck, 
  ArrowRight, Users, FileText, Activity, MoreHorizontal, ArrowUpRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';

const cards = [
  { to: '/announcements',   icon: Megaphone,      label: 'Announcements',  desc: 'Latest updates and news from the campus administration.', roles: ['student','faculty','admin'] },
  { to: '/notes',           icon: BookOpen,        label: 'Notes Sharing',  desc: 'Upload and browse study materials across all departments.', roles: ['student','faculty','admin'] },
  { to: '/faculty-cabins',  icon: DoorOpen,        label: 'Faculty Cabins', desc: 'Locate faculty members and check their availability.', roles: ['student','faculty','admin'] },
  { to: '/attendance',      icon: CalendarCheck,   label: 'Attendance',     desc: 'Anti-proxy QR attendance system for your classes.', roles: ['student','faculty'] },
  { to: '/cgpa-calculator', icon: Calculator,      label: 'CGPA Calculator',desc: 'Instantly calculate your CGPA and plan your targets.', roles: ['student','faculty','admin'] },
  { to: '/admin',           icon: ShieldCheck,     label: 'Admin Panel',    desc: 'System administration and user management.', roles: ['admin'] },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { dark } = useThemeStore();
  const [stats, setStats] = useState({ notes: 0, users: 0, cabins: 0 });

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const visible = cards.filter(c => c.roles.includes(user?.role));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <div className="pb-10 min-h-screen">
      
      {/* ── Header ── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 ${dark ? 'text-white' : 'text-gray-900'}`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-bold mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>Home / Dashboard /</span> <span className={dark ? 'text-[#c9a84c]' : 'text-indigo-600'}>{dateStr} ▾</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight mb-2 ${dark ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400' : ''}`}>
            {greeting}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className={`text-sm font-medium max-w-md leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Access all your campus tools and manage your academic life in one unified platform.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Avatar name={user?.name} size={10} />
          <div className="flex flex-col">
            <span className="font-bold text-sm">{user?.name}</span>
            <span className={`text-xs font-bold capitalize ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ── Main Quick Access Cards ── */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
          {visible.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className={`group relative overflow-hidden flex flex-col p-5 lg:p-6 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                dark 
                  ? 'bg-[#121220] rounded-xl border border-[#232336] hover:border-[#c9a84c]/40' 
                  : 'bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-indigo-500/5'
              }`}
            >
              {/* Top Row: Category Badge & Icon */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md ${
                  dark ? 'bg-[#c9a84c]/10 text-[#c9a84c]' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {c.label.split(' ')[0]}
                </span>
                <div className={`p-2 rounded-lg transition-colors ${dark ? 'bg-white/5 text-gray-400 group-hover:text-white' : 'bg-slate-50 text-slate-500 group-hover:text-indigo-600'}`}>
                  <c.icon size={18} />
                </div>
              </div>
              
              {/* Content */}
              <div className="mb-6 relative z-10">
                <h3 className={`text-lg font-bold mb-1.5 ${dark ? 'text-white' : 'text-slate-900'}`}>{c.label}</h3>
                <p className={`text-xs leading-relaxed ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {c.desc}
                </p>
              </div>
              
              {/* Bottom Action */}
              <div className="mt-auto flex items-center justify-between relative z-10 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-[#c9a84c]">
                  <span>Open Tool</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Right Sidebar: Stats & Widgets ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Stats Widget */}
          <div className={`p-5 lg:p-6 flex flex-col ${
            dark 
              ? 'bg-[#121220] rounded-2xl border border-[#232336]'
              : 'bg-white rounded-2xl border border-slate-200 shadow-sm'
          }`}>
            <div className="w-full flex justify-between items-center mb-6">
              <h3 className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>Platform Overview</h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${dark ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>Live</span>
            </div>
            
            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-3 mb-4">
               <div className={`flex flex-col items-center justify-center py-4 rounded-xl ${dark ? 'bg-[#1c1c2e] border border-[#2a2a40]' : 'bg-slate-50 border border-slate-100'}`}>
                 <FileText size={18} className={dark ? 'text-[#c9a84c] mb-1.5' : 'text-indigo-600 mb-1.5'} />
                 <span className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{stats.notes || 0}</span>
                 <span className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Notes Indexed</span>
               </div>
               <div className={`flex flex-col items-center justify-center py-4 rounded-xl ${dark ? 'bg-[#1c1c2e] border border-[#2a2a40]' : 'bg-slate-50 border border-slate-100'}`}>
                 <Users size={18} className={dark ? 'text-[#c9a84c] mb-1.5' : 'text-indigo-600 mb-1.5'} />
                 <span className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{stats.users || 0}</span>
                 <span className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Registered Users</span>
               </div>
            </div>
            
            <div className="w-full flex justify-between items-center mt-auto pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400 dark:text-gray-500 font-medium">
              <span>VIT Bhopal Database</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1">● Online</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
