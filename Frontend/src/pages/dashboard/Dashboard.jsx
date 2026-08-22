import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, DoorOpen, CalendarCheck, Calculator, ShieldCheck, Megaphone, TrendingUp, Users, FileText } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';

const cards = [
  { to: '/announcements',   icon: Megaphone,      label: 'Announcements',  lightGrad: 'from-indigo-500 to-indigo-700',     darkGrad: 'from-indigo-900/50 to-indigo-800/40',  roles: ['student','faculty','admin'], glow: 'rgba(99,102,241,0.35)' },
  { to: '/notes',           icon: BookOpen,        label: 'Notes Sharing',  lightGrad: 'from-blue-500 to-blue-700',         darkGrad: 'from-blue-900/50 to-blue-800/40',      roles: ['student','faculty','admin'], glow: 'rgba(59,130,246,0.35)' },
  { to: '/faculty-cabins',  icon: DoorOpen,        label: 'Faculty Cabins', lightGrad: 'from-emerald-500 to-emerald-700',   darkGrad: 'from-emerald-900/50 to-emerald-800/40',roles: ['student','faculty','admin'], glow: 'rgba(16,185,129,0.35)' },
  { to: '/attendance',      icon: CalendarCheck,   label: 'Attendance',     lightGrad: 'from-violet-500 to-violet-700',     darkGrad: 'from-violet-900/50 to-violet-800/40',  roles: ['student','faculty'],         glow: 'rgba(139,92,246,0.35)' },
  { to: '/cgpa-calculator', icon: Calculator,      label: 'CGPA Calculator',lightGrad: 'from-amber-500 to-orange-600',      darkGrad: 'from-amber-900/50 to-orange-900/40',   roles: ['student','faculty','admin'], glow: 'rgba(245,158,11,0.35)' },
  { to: '/admin',           icon: ShieldCheck,     label: 'Admin Panel',    lightGrad: 'from-rose-500 to-rose-700',         darkGrad: 'from-rose-900/50 to-rose-800/40',      roles: ['admin'],                     glow: 'rgba(244,63,94,0.35)' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { dark } = useThemeStore();
  const [stats, setStats] = useState({ notes: 0, users: 0, cabins: 0 });

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const visible = cards.filter(c => c.roles.includes(user?.role));

  /* Greeting by time of day */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className={`mc-bounce-drop relative overflow-hidden rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
        dark
          ? 'bg-gradient-to-r from-[#1a1208] via-[#1c1408] to-[#120e04] border border-[#c9a84c]/20'
          : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-700'
      }`}
      style={{ boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.60), 0 0 24px rgba(201,168,76,0.08)' : '0 8px 32px rgba(99,102,241,0.30)' }}
      >
        {/* Floating decorative orbs */}
        <div className="mc-drift absolute top-3 right-10 w-3 h-3 rounded-full pointer-events-none" style={{ animationDuration: '8s', background: dark ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.20)' }} />
        <div className="mc-drift absolute bottom-4 right-24 w-2 h-2 rounded-full pointer-events-none" style={{ animationDuration: '11s', animationDelay: '2s', background: dark ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.15)' }} />
        <div className="mc-drift absolute top-5 left-1/2 w-1.5 h-1.5 rounded-full pointer-events-none" style={{ animationDuration: '9s', animationDelay: '1s', background: dark ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.12)' }} />

        <div className="mc-pulse-glow rounded-full shrink-0">
          <Avatar name={user?.name} size={16} />
        </div>

        <div className="relative flex-1">
          <p className={`text-sm font-medium mb-0.5 ${dark ? 'text-[#c9a84c]/60' : 'text-blue-200'}`}>
            {greeting} 👋
          </p>
          <h2 className={`text-2xl font-bold ${dark ? 'text-[#c9a84c]' : 'text-white'}`}>
            {user?.name?.split(' ')[0]}!
          </h2>
          <p className={`capitalize text-sm mt-0.5 ${dark ? 'text-[#c9a84c]/50' : 'text-blue-200'}`}>
            {user?.role} · {user?.department}
          </p>
        </div>

        {/* Quick stat pills on banner */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Features',  val: '5+' },
            { label: 'My Role',   val: user?.role?.slice(0,3)?.toUpperCase() },
          ].map(({ label, val }) => (
            <div key={label} className={`flex flex-col items-center px-4 py-2 rounded-xl border ${
              dark
                ? 'bg-[#c9a84c]/8 border-[#c9a84c]/20 text-[#c9a84c]'
                : 'bg-white/12 border-white/20 text-white'
            }`}>
              <span className="text-lg font-bold leading-none">{val}</span>
              <span className={`text-[10px] mt-0.5 ${dark ? 'text-[#c9a84c]/60' : 'text-blue-100'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Notes Available',   value: stats.notes, icon: FileText,   lightColor: 'text-blue-600',   darkColor: 'text-[#c9a84c]',   lightBg: 'bg-blue-50',   darkBg: 'bg-[#c9a84c]/8' },
          { label: 'Faculty Cabins',    value: stats.cabins, icon: DoorOpen,  lightColor: 'text-emerald-600',darkColor: 'text-emerald-400', lightBg: 'bg-emerald-50',darkBg: 'bg-emerald-500/8' },
          { label: 'Registered Users',  value: stats.users, icon: Users,      lightColor: 'text-violet-600', darkColor: 'text-violet-400',  lightBg: 'bg-violet-50', darkBg: 'bg-violet-500/8' },
        ].map((s, i) => {
          const StatIcon = s.icon;
          return (
            <div
              key={s.label}
              className={`mc-flip-up mc-liquid-hover relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 ${
                dark
                  ? `dk-card`
                  : `glass-card border-white/70 hover:border-indigo-200/80`
              }`}
              style={{ animationDelay: `${60 + i * 70}ms`, boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.50)' : undefined }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${dark ? s.darkBg : s.lightBg}`}>
                <StatIcon size={20} className={dark ? s.darkColor : s.lightColor} />
              </div>
              <p className={`text-3xl font-bold ${dark ? s.darkColor : s.lightColor}`}>{s.value}</p>
              <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
              <TrendingUp size={14} className={`absolute bottom-4 right-4 ${dark ? 'text-[#c9a84c]/20' : 'text-indigo-200'}`} />
            </div>
          );
        })}
      </div>

      {/* ── Quick Access Grid ── */}
      <div>
        <h3 className={`mc-fade-right text-lg font-semibold mb-3 ${dark ? 'text-[#c9a84c]/80' : 'text-gray-700'}`}>
          Quick Access
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visible.map(({ to, icon: Icon, label, lightGrad, darkGrad, glow }, i) => (
            <Link
              key={to}
              to={to}
              className={`mc-fade-up mc-liquid-hover group relative overflow-hidden rounded-3xl p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                dark ? 'dk-card border border-[#c9a84c]/15 hover:border-[#c9a84c]/30 hover:shadow-[0_12px_40px_-8px_rgba(201,168,76,0.3)]' : 'glass-card border-[1.5px] border-indigo-200/60 hover:border-indigo-300 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.25)]'
              }`}
              style={{ animationDelay: `${180 + i * 70}ms` }}
            >
              {/* Icon orb */}
              <div className={`w-12 h-12 p-3 rounded-2xl bg-gradient-to-br ${lightGrad} shadow-lg group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}
                style={{ boxShadow: `0 8px 20px -6px ${glow}` }}>
                <Icon size={24} className="text-white" />
              </div>

              <span className={`text-sm font-semibold text-center transition-colors ${
                dark
                  ? 'text-gray-400 group-hover:text-[#c9a84c]'
                  : 'text-gray-600 group-hover:text-indigo-600'
              }`}>{label}</span>

              {/* Corner arrow */}
              <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? 'text-[#c9a84c]/60' : 'text-indigo-400'}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
