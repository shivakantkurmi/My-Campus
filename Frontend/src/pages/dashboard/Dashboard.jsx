import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, DoorOpen, CalendarCheck, Calculator, ShieldCheck, Megaphone } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';

const cards = [
  { to: '/announcements', icon: Megaphone, label: 'Announcements', color: 'bg-indigo-600', roles: ['student','faculty','admin'] },
  { to: '/notes', icon: BookOpen, label: 'Notes Sharing', color: 'bg-blue-600', roles: ['student','faculty','admin'] },
  { to: '/faculty-cabins', icon: DoorOpen, label: 'Faculty Cabins', color: 'bg-green-600', roles: ['student','faculty','admin'] },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance', color: 'bg-purple-600', roles: ['student','faculty'] },
  { to: '/cgpa-calculator', icon: Calculator, label: 'CGPA Calculator', color: 'bg-yellow-600', roles: ['student','faculty','admin'] },
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel', color: 'bg-red-600', roles: ['admin'] },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ notes: 0, users: 0, cabins: 0 });

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const visible = cards.filter(c => c.roles.includes(user?.role));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="mc-bounce-drop relative overflow-hidden bg-linear-to-r from-blue-700 to-indigo-700 rounded-2xl p-6 flex items-center gap-4 shadow-xl shadow-indigo-500/20 mc-glow-border">
        {/* floating particles in banner */}
        <div className="mc-drift absolute top-3 right-10 w-2 h-2 rounded-full bg-white/20 pointer-events-none" style={{ animationDuration: '8s' }} />
        <div className="mc-drift absolute bottom-4 right-24 w-1.5 h-1.5 rounded-full bg-white/15 pointer-events-none" style={{ animationDuration: '11s', animationDelay: '2s' }} />
        <div className="mc-drift absolute top-5 left-1/2 w-1 h-1 rounded-full bg-white/20 pointer-events-none" style={{ animationDuration: '9s', animationDelay: '1s' }} />
        <div className="mc-pulse-glow rounded-full">
          <Avatar name={user?.name} size={16} />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-blue-200 capitalize">{user?.role} · {user?.department}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Notes Available', value: stats.notes, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Faculty Cabins', value: stats.cabins, color: 'text-green-600 dark:text-green-400' },
          { label: 'Registered Users', value: stats.users, color: 'text-purple-600 dark:text-purple-400' },
        ].map((s, i) => (
          <div key={s.label}
            className="mc-flip-up mc-card-hover bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            style={{ animationDelay: `${60 + i * 70}ms` }}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="mc-fade-right text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visible.map(({ to, icon: Icon, label, color }, i) => (
            <Link
              key={to}
              to={to}
              className="mc-fade-up mc-card-hover bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-600 group"
              style={{ animationDelay: `${180 + i * 70}ms` }}
            >
              <div className={`mc-hover-spin ${color} p-3 rounded-xl group-hover:scale-115 group-hover:shadow-lg group-hover:shadow-black/20 transition-all duration-300`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
