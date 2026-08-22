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
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 ${dark ? 'text-white' : 'text-gray-900'}`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-bold mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>Home / Dashboard /</span> <span className={dark ? 'text-[#c9a84c]' : 'text-indigo-600'}>{dateStr} ▾</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 ${dark ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400' : ''}`}>
            {greeting}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className={`text-sm font-medium max-w-md leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Access all your campus tools and manage your academic life in one unified platform.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={user?.name} size={48} />
          <div className="flex flex-col">
            <span className="font-bold text-sm">{user?.name}</span>
            <span className={`text-xs font-bold capitalize ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ── Main Quick Access Cards ── */}
        <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {visible.map((c, i) => (
            <Link
              key={c.to}
              to={c.to}
              className={`group relative overflow-hidden flex flex-col p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1 ${
                dark 
                  ? 'bg-[#121220] rounded-[2rem] border border-[#232336] hover:border-[#c9a84c]/40' 
                  : 'bg-white/80 backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)] hover:shadow-[0_30px_80px_-15px_rgba(99,102,241,0.25)]'
              }`}
            >
              {/* Glowing Aura Effect (Dark Theme) */}
              {dark && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#c9a84c]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
              
              {/* Top Row: Tag & More Icon */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`flex items-center gap-2 text-xs font-bold ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`}>
                  <div className={`w-2 h-2 rounded-full border-2 ${dark ? 'border-[#c9a84c]' : 'border-indigo-600'}`} /> Portal Link
                </div>
                <div className={`p-2 rounded-full ${dark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-indigo-50 text-gray-400'}`}>
                  <c.icon size={16}/>
                </div>
              </div>
              
              {/* Content */}
              <div className="mb-8 relative z-10">
                <h3 className={`text-xl lg:text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>{c.label}</h3>
                <p className={`text-xs leading-relaxed max-w-[90%] ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {c.desc}
                </p>
              </div>
              
              {/* Bottom Action */}
              <div className="mt-auto flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? 'bg-[#c9a84c]/10 text-[#c9a84c]' : 'bg-indigo-50 text-indigo-600'}`}>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className={`text-xs font-bold ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Open</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Right Sidebar: Stats & Widgets ── */}
        <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-8">
          
          {/* Stats Widget */}
          <div className={`p-6 lg:p-8 flex flex-col items-center text-center ${
            dark 
              ? 'bg-[#121220] rounded-[2rem] border border-[#232336]'
              : 'bg-white/80 backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)]'
          }`}>
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Platform Usage</h3>
              <button className={`p-2 rounded-full ${dark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}><MoreHorizontal size={14}/></button>
            </div>
            
            {/* Stats Chart Area */}
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
               <div className={`flex flex-col items-center justify-center py-6 rounded-2xl ${dark ? 'bg-[#1c1c2e] border border-[#2a2a40]' : 'bg-indigo-50/50 border border-indigo-100'}`}>
                 <FileText size={20} className={dark ? 'text-[#c9a84c] mb-2' : 'text-indigo-500 mb-2'} />
                 <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{stats.notes || 0}</span>
                 <span className={`text-[10px] font-bold uppercase mt-1 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Notes</span>
               </div>
               <div className={`flex flex-col items-center justify-center py-6 rounded-2xl ${dark ? 'bg-[#1c1c2e] border border-[#2a2a40]' : 'bg-indigo-50/50 border border-indigo-100'}`}>
                 <Users size={20} className={dark ? 'text-[#c9a84c] mb-2' : 'text-indigo-500 mb-2'} />
                 <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{stats.users || 0}</span>
                 <span className={`text-[10px] font-bold uppercase mt-1 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Users</span>
               </div>
            </div>
            
            <div className="w-full flex justify-between items-center mt-auto pt-4 border-t border-dashed" style={{ borderColor: dark ? '#2a2a40' : '#e5e7eb' }}>
              <span className={`text-[10px] font-bold ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Latest metrics</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
