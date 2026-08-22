import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';
import useAdminStore from '../../store/adminStore';
import useThemeStore from '../../store/themeStore';
import {
  Search, UserX, UserCheck, Trash2, MessageSquare,
  FileText, Users, GraduationCap, BookOpen, ShieldCheck,
} from 'lucide-react';

const ROLE_FILTERS = ['all', 'student', 'faculty'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { dark } = useThemeStore();

  const { users, notes, complaints, stats, loading, fetchAll, refresh } = useAdminStore();
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
    if (u.role === 'admin') return false;
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !userSearch
      || u.name.toLowerCase().includes(userSearch.toLowerCase())
      || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

  const statCards = [
    { label: 'Students',       value: stats.students ?? 0, icon: GraduationCap, lightCls: 'bg-indigo-50 text-indigo-600',  darkCls: 'bg-[#c9a84c]/10 text-[#c9a84c]' },
    { label: 'Faculty',        value: stats.faculty  ?? 0, icon: BookOpen,       lightCls: 'bg-violet-50 text-violet-600',  darkCls: 'bg-violet-500/12 text-violet-400' },
    { label: 'Admin',          value: stats.admins   ?? 1, icon: ShieldCheck,    lightCls: 'bg-rose-50 text-rose-600',      darkCls: 'bg-rose-500/12 text-rose-400' },
    { label: 'Notes',          value: stats.notes    ?? 0, icon: FileText,       lightCls: 'bg-emerald-50 text-emerald-600',darkCls: 'bg-emerald-500/12 text-emerald-400' },
    { label: 'Open Complaints',value: openComplaints,       icon: MessageSquare,  lightCls: 'bg-amber-50 text-amber-600',    darkCls: 'bg-amber-500/12 text-amber-400' },
  ];

  const tabs = [
    { id: 'users',      label: 'Users',      icon: Users },
    { id: 'notes',      label: 'Notes',      icon: FileText },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  ];

  /* ── Shared styles ── */
  const cardBase = dark
    ? 'dk-card rounded-xl p-4'
    : 'glass-card rounded-xl p-4 border-white/70';

  const inputBase = `w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all ${
    dark
      ? 'bg-[#1a1a2e]/80 border border-[#c9a84c]/18 text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-2 focus:ring-[#c9a84c]/18'
      : 'bg-white/80 border border-indigo-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-sm'
  }`;

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map(({ label, value, icon: Icon, lightCls, darkCls }, i) => (
          <div
            key={label}
            className={`mc-fade-up mc-liquid-hover ${cardBase} hover:-translate-y-1 transition-all cursor-default`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${dark ? darkCls : lightCls}`}>
              <Icon size={17} />
            </div>
            <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className={`flex gap-1 border-b overflow-x-auto ${dark ? 'border-[#c9a84c]/12' : 'border-gray-200'}`}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
              tab === id
                ? dark
                  ? 'border-[#c9a84c] text-[#c9a84c]'
                  : 'border-indigo-500 text-indigo-600'
                : dark
                  ? 'border-transparent text-gray-500 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />{label}
            {id === 'complaints' && openComplaints > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-semibold ${
                dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>
                {openComplaints}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <span className={`w-6 h-6 border-2 rounded-full animate-spin ${
            dark ? 'border-[#c9a84c]/30 border-t-[#c9a84c]' : 'border-indigo-200 border-t-indigo-600'
          }`} />
        </div>
      )}

      {/* ── Users Tab ── */}
      {tab === 'users' && !loading && (
        <div className="space-y-4">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email…"
                className={inputBase}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {ROLE_FILTERS.map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    roleFilter === r
                      ? dark
                        ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : dark
                        ? 'bg-[#1a1a2e]/60 border border-[#c9a84c]/15 text-gray-400 hover:border-[#c9a84c]/30'
                        : 'bg-white/80 border border-indigo-100 text-gray-600 hover:border-indigo-300 backdrop-blur-sm'
                  }`}
                >
                  {r === 'all' ? `All (${users.filter(u => u.role !== 'admin').length})` : `${r === 'student' ? '🎓' : '👨‍🏫'} ${r}`}
                </button>
              ))}
            </div>
          </div>

          <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
            Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            {roleFilter !== 'all' ? ` · ${roleFilter}s` : ''}
            {userSearch ? ` matching "${userSearch}"` : ''}
          </p>

          {/* Table */}
          <div className={`rounded-2xl border overflow-x-auto ${
            dark ? 'bg-[#0f0f1e]/80 border-[#c9a84c]/10 backdrop-blur-xl' : 'glass-card border-white/70'
          }`}>
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className={dark ? 'border-b border-[#c9a84c]/10' : 'border-b border-gray-100'}>
                  {['User', 'Role', 'Department', 'Status', 'Action'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                      dark ? 'text-[#c9a84c]/50' : 'text-gray-400'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-[#c9a84c]/8' : 'divide-gray-100'}`}>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`text-center py-10 text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                      No users found.
                    </td>
                  </tr>
                )}
                {filteredUsers.map(u => (
                  <tr key={u._id} className={`transition-colors ${dark ? 'hover:bg-[#c9a84c]/4' : 'hover:bg-indigo-50/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={8} />
                        <div>
                          <p className={`font-medium text-sm ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{u.name}</p>
                          <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        u.role === 'faculty'
                          ? dark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-50 text-violet-700'
                          : dark ? 'bg-[#c9a84c]/12 text-[#c9a84c]/80' : 'bg-indigo-50 text-indigo-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs max-w-[160px] truncate ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {u.department}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.isBlocked
                          ? dark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
                          : dark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          u.isBlocked
                            ? dark ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : dark ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-red-50 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        {u.isBlocked ? <><UserCheck size={13} /> Unblock</> : <><UserX size={13} /> Block</>}
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
          {notes.length === 0 && (
            <p className={`text-center py-10 text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>No notes uploaded yet.</p>
          )}
          {notes.map((note, i) => (
            <div
              key={note._id}
              className={`mc-fade-up flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all hover:-translate-y-0.5 ${
                dark ? 'dk-card' : 'glass-card border-white/70'
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="min-w-0">
                <p className={`font-medium text-sm truncate ${dark ? 'text-gray-200' : 'text-gray-700'}`}>{note.title}</p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {note.subject} · By {note.uploadedBy?.name ?? 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note._id)}
                className={`p-2 rounded-lg transition shrink-0 ${
                  dark ? 'text-gray-600 hover:bg-red-500/15 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Complaints Tab ── */}
      {tab === 'complaints' && !loading && (
        <div className="space-y-3">
          {complaints.length === 0 && (
            <p className={`text-center py-10 text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>No complaints yet.</p>
          )}
          {complaints.map((c, i) => (
            <div
              key={c._id}
              className={`mc-fade-up rounded-xl border px-4 py-4 space-y-2 transition-all ${
                dark
                  ? `${c.status === 'resolved' ? 'dk-card opacity-50' : 'dk-card border-amber-500/20'}`
                  : `glass-card ${c.status === 'resolved' ? 'opacity-60 border-gray-100' : 'border-amber-100'}`
              }`}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                  c.type === 'unblock_appeal'
                    ? dark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                    : dark ? 'bg-indigo-50 dark:bg-[#c9a84c]/100/15 text-indigo-500 dark:text-[#e8c76b]' : 'bg-indigo-50 dark:bg-[#c9a84c]/10 text-indigo-800 dark:text-[#a87c30]'
                }`}>
                  {c.type?.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-medium ${c.status === 'resolved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {c.status}
                </span>
              </div>
              <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{c.message}</p>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                  By: {c.userId?.name ?? 'Unknown'} · {c.userId?.email}
                </p>
                {c.status !== 'resolved' && (
                  <button
                    onClick={() => resolveComplaint(c._id)}
                    className={`text-xs font-semibold hover:underline ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  >
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
