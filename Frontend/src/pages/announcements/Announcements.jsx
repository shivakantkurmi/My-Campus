import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import AnnouncementForm from './AnnouncementForm';
import { ArrowDownAZ, CalendarClock, Filter, Plus, Search, ShieldCheck, Sparkles, Trash2, Pencil } from 'lucide-react';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const sortOptions = [
  { value: 'created-desc', label: 'Newest first' },
  { value: 'created-asc', label: 'Oldest first' },
  { value: 'priority', label: 'Priority' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
];

const priorityOptions = ['all', 'high', 'medium', 'low'];

const formatDateTime = (value) => {
  if (!value) return 'No deadline';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No deadline';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const isPast = (value) => value && new Date(value).getTime() < Date.now();

export default function Announcements() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('created-desc');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const visibleAnnouncements = useMemo(() => {
    let list = [...announcements];

    if (priority !== 'all') {
      list = list.filter((item) => item.priority === priority);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((item) =>
        item.title?.toLowerCase().includes(query)
        || item.description?.toLowerCase().includes(query)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === 'name-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'name-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'created-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [announcements, priority, search, sortBy]);

  const removeAnnouncement = async (id) => {
    if (!window.confirm('Discard this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    await fetchAnnouncements();
  };

  const canManage = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles size={12} /> Campus updates
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Announcement Board</h1>
          </div>
          {canManage && (
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
            >
              <Plus size={16} /> New Announcement
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcement name or description…"
            className="w-full rounded-xl border border-gray-200 bg-white px-9 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-9 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {priorityOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All priorities' : option}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <ArrowDownAZ size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-9 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <p>
          Showing {visibleAnnouncements.length} announcement{visibleAnnouncements.length !== 1 ? 's' : ''}
          {priority !== 'all' ? ` · ${priority} priority` : ''}
          {search ? ` matching "${search}"` : ''}
        </p>
        <p className="inline-flex items-center gap-1">
          <CalendarClock size={13} /> All announcements are shown here
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="mc-skeleton h-56 rounded-2xl" style={{ animationDelay: `${index * 80}ms` }} />
          ))}
        </div>
      ) : visibleAnnouncements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No announcements match the current filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleAnnouncements.map((announcement, index) => (
            <article
              key={announcement._id}
              className="mc-flip-up mc-card-hover flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    announcement.priority === 'high'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : announcement.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  }`}>
                    {announcement.priority} priority
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h2>
                </div>
                {canManage && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => { setEditing(announcement); setShowForm(true); }}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700"
                      title="Edit announcement"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => removeAnnouncement(announcement._id)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      title="Discard announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{announcement.description}</p>

              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-700/50 dark:text-gray-300">
                <div className="flex items-center justify-between gap-4">
                  <span>Created: {formatDateTime(announcement.createdAt)}</span>
                  <span className={isPast(announcement.deadline) ? 'text-red-500 dark:text-red-400' : ''}>
                    {announcement.deadline ? `Delete after: ${formatDateTime(announcement.deadline)}` : 'No deadline'}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                  Posted by {announcement.createdBy?.name ?? 'Unknown'}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && canManage && (
        <AnnouncementForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchAnnouncements(); }}
        />
      )}
    </div>
  );
}