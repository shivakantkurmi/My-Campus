import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, DoorOpen, CalendarCheck, Calculator, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';

const cards = [
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
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-6 flex items-center gap-4 shadow">
        <Avatar name={user?.name} photo={user?.profilePhoto} size={16} />
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-blue-200 capitalize">{user?.role} · {user?.department}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Notes Available', value: stats.notes },
          { label: 'Faculty Cabins', value: stats.cabins },
          { label: 'Registered Users', value: stats.users },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-3xl font-bold text-blue-600">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visible.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center gap-3 hover:shadow-md transition group"
            >
              <div className={`${color} p-3 rounded-xl group-hover:scale-110 transition`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
