import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';
import useAdminStore from '../../store/adminStore';
import {
  Search, UserX, UserCheck, Trash2, MessageSquare,
  FileText, Users, GraduationCap, BookOpen, ShieldCheck,
} from 'lucide-react';

const ROLE_FILTERS = ['all', 'student', 'faculty'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { users, notes, complaints, stats, loading, fetchAll, refresh } = useAdminStore();

  // Fetch once per session; subsequent visits use cached data
  useEffect(() => { fetchAll(); }, []);

  const toggleBlock = async (id, blocked) => {
    try {
      await api.patch(`/admin/users/${id}/block`, { isBlocked: !blocked });
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note permanently?')) return;
    await api.delete(`/notes/${id}`);
    await refresh();
  };

  const resolveComplaint = async (id) => {
    await api.patch(`/admin/complaints/${id}/resolve`);
    await refresh();
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false; // admin never shows in managed list
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !userSearch
      || u.name.toLowerCase().includes(userSearch.toLowerCase())
      || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

  const statCards = [
    {
      label: 'Students',
      value: stats.students ?? 0,
      icon: GraduationCap,
      color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      ring: 'border-indigo-100 dark:border-indigo-800',
    },
    {
      label: 'Faculty',
      value: stats.faculty ?? 0,
      icon: BookOpen,
      color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
      ring: 'border-violet-100 dark:border-violet-800',
    },
    {
      label: 'Admin',
      value: stats.admins ?? 1,
      icon: ShieldCheck,
      color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
      ring: 'border-rose-100 dark:border-rose-800',
    },
    {
      label: 'Notes',
      value: stats.notes ?? 0,
      icon: FileText,
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      ring: 'border-emerald-100 dark:border-emerald-800',
    },
    {
      label: 'Open Complaints',
      value: openComplaints,
      icon: MessageSquare,
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      ring: 'border-amber-100 dark:border-amber-800',
    },
  ];

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, ring }, i) => (
          <div key={label}
            className={`mc-fade-up bg-white dark:bg-gray-800 rounded-xl p-4 border ${ring} dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all`}
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${color}`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="overflow-x-auto flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <Icon size={15} />{label}
            {id === 'complaints' && openComplaints > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-semibold">
                {openComplaints}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Users Tab ── */}
      {tab === 'users' && !loading && (
        <div className="space-y-4">
          {/* Search + role filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white placeholder-gray-400" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {ROLE_FILTERS.map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                    roleFilter === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
                  }`}>
                  {r === 'all' ? `All (${users.filter(u => u.role !== 'admin').length})` : `${r === 'student' ? '🎓' : '👨‍🏫'} ${r}`}
                </button>
              ))}
            </div>
          </div>

          {/* User count summary */}
          <p className="text-xs text-gray-400">
            Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            {roleFilter !== 'all' ? ` · ${roleFilter}s` : ''}
            {userSearch ? ` matching "${userSearch}"` : ''}
          </p>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/60">
                  {['User', 'Role', 'Department', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                      No users found.
                    </td>
                  </tr>
                )}
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={8} />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        u.role === 'faculty'
                          ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400'
                          : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                      {u.department}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.isBlocked
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                          u.isBlocked
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                        }`}>
                        {u.isBlocked
                          ? <><UserCheck size={13} /> Unblock</>
                          : <><UserX size={13} /> Block</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Notes Tab ── */}
      {tab === 'notes' && !loading && (
        <div className="space-y-3">
          {notes.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No notes uploaded yet.</p>}
          {notes.map((note, i) => (
            <div key={note._id}
              className="mc-fade-up bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-4 hover:shadow-sm transition-all"
              style={{ animationDelay: `${i * 40}ms` }}>
              <div className="min-w-0">
                <p className="font-medium text-gray-700 dark:text-white text-sm truncate">{note.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{note.subject} · By {note.uploadedBy?.name ?? 'Unknown'}</p>
              </div>
              <button onClick={() => deleteNote(note._id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Complaints Tab ── */}
      {tab === 'complaints' && !loading && (
        <div className="space-y-3">
          {complaints.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No complaints yet.</p>}
          {complaints.map((c, i) => (
            <div key={c._id}
              className={`mc-fade-up bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 px-4 py-4 space-y-2 hover:shadow-sm transition-all ${
                c.status === 'resolved' ? 'border-gray-100 opacity-60' : 'border-amber-100 dark:border-amber-900/30'
              }`}
              style={{ animationDelay: `${i * 45}ms` }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                  c.type === 'unblock_appeal'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  {c.type?.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-medium ${c.status === 'resolved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{c.message}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">By: {c.userId?.name ?? 'Unknown'} · {c.userId?.email}</p>
                {c.status !== 'resolved' && (
                  <button onClick={() => resolveComplaint(c._id)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
