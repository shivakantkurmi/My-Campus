import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';
import { Search, UserX, UserCheck, Trash2, MessageSquare, BarChart2, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, n, c, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/notes'),
        api.get('/admin/complaints'),
        api.get('/stats'),
      ]);
      setUsers(u.data);
      setNotes(n.data);
      setComplaints(c.data);
      setStats(s.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id, blocked) => {
    await api.patch(`/admin/users/${id}/block`, { isBlocked: !blocked });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: !blocked } : u));
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete note?')) return;
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
  };

  const resolveComplaint = async (id) => {
    await api.patch(`/admin/complaints/${id}/resolve`);
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'resolved' } : c));
  };

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notes', label: 'Notes', icon: BarChart2 },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: stats.users ?? 0, color: 'text-blue-500' },
          { label: 'Notes', value: stats.notes ?? 0, color: 'text-green-500' },
          { label: 'Cabins', value: stats.cabins ?? 0, color: 'text-purple-500' },
          { label: 'Complaints', value: complaints.filter(c => c.status !== 'resolved').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400'}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400 py-6">Loading…</p>}

      {/* Users */}
      {tab === 'users' && !loading && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none dark:text-white" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['User', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} photo={u.profilePhoto} size={8} />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200 text-xs">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-xs text-gray-600 dark:text-gray-300">{u.role}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{u.department}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleBlock(u._id, u.isBlocked)}
                          className={`flex items-center gap-1 text-xs font-medium ${u.isBlocked ? 'text-green-500 hover:text-green-700' : 'text-red-400 hover:text-red-600'}`}>
                          {u.isBlocked ? <><UserCheck size={13}/>Unblock</> : <><UserX size={13}/>Block</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {tab === 'notes' && !loading && (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 dark:text-white text-sm">{note.title}</p>
                <p className="text-xs text-gray-400">{note.subject} · By {note.uploadedBy?.name}</p>
              </div>
              <button onClick={() => deleteNote(note._id)} className="p-2 hover:bg-red-50 rounded-lg">
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Complaints */}
      {tab === 'complaints' && !loading && (
        <div className="space-y-3">
          {complaints.length === 0 && <p className="text-center py-8 text-gray-400">No complaints yet.</p>}
          {complaints.map(c => (
            <div key={c._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'unblock_appeal' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {c.type?.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs ${c.status === 'resolved' ? 'text-green-500' : 'text-orange-400'}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{c.message}</p>
              <p className="text-xs text-gray-400">By: {c.userId?.name ?? 'Unknown'} ({c.userId?.email})</p>
              {c.status !== 'resolved' && (
                <button onClick={() => resolveComplaint(c._id)}
                  className="text-xs text-green-500 hover:text-green-700 font-medium">
                  Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
