import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
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
  const { dark } = useThemeStore();
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
    if (priority !== 'all') list = list.filter((item) => item.priority === priority);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority])
            return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name-asc': return a.title?.localeCompare(b.title || '') || 0;
        case 'name-desc': return b.title?.localeCompare(a.title || '') || 0;
        case 'created-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [announcements, priority, search, sortBy]);

  const handleDelete = async (id) => {
    if (!window.confirm('Discard this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    await fetchAnnouncements();
  };

  const canManage = user?.role === 'admin';

  /* ── Liquid Glass / Dark Premium Theme Classes ── */
  const glassCard = dark 
    ? 'bg-[#121220] rounded-[2rem] border border-[#232336]' 
    : 'bg-white/80 backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)]';
  
  const glassInput = dark
    ? 'bg-[#1c1c2e] border-[#2a2a40] text-white placeholder-gray-500 focus:border-[#c9a84c]'
    : 'bg-white/60 border-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-400 backdrop-blur-md shadow-sm';

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── Header ── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-bold mb-4 ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`}>
            <Sparkles size={14} /> Campus Updates
          </div>
          <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 ${dark ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400' : ''}`}>
            Announcement Board
          </h1>
        </div>

        {canManage && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className={`px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-1 ${
              dark ? 'bg-gradient-to-r from-[#c9a84c] to-[#8a6020] text-[#07070f] shadow-[#c9a84c]/20' : 'bg-gray-900 text-white'
            }`}
          >
            <Plus size={16} className="inline mr-2" /> New Announcement
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcement name or description…"
            className={`w-full rounded-[1.5rem] border px-10 py-3 text-sm outline-none transition-all ${glassInput}`}
          />
        </div>
        <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-full appearance-none rounded-[1.5rem] border px-10 py-3 text-sm outline-none transition-all ${glassInput}`}
            >
              {priorityOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All priorities' : option}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <ArrowDownAZ size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full appearance-none rounded-[1.5rem] border px-10 py-3 text-sm outline-none transition-all ${glassInput}`}
            >
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse font-bold">Loading updates...</div>
      ) : visibleAnnouncements.length === 0 ? (
        <div className={`py-16 text-center ${glassCard}`}>
          <ShieldCheck size={48} className={`mx-auto mb-4 ${dark ? 'text-[#c9a84c]' : 'text-indigo-300'}`} />
          <h3 className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>All Caught Up</h3>
          <p className={dark ? 'text-gray-400' : 'text-gray-500'}>There are no matching announcements at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visibleAnnouncements.map((item) => (
            <div key={item._id} className={`p-6 lg:p-8 flex flex-col relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${glassCard}`}>
              
              {/* Top Row: Tag & Actions */}
              <div className="flex items-start justify-between mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.priority === 'high' 
                    ? dark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-100'
                    : item.priority === 'medium'
                      ? dark ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      : dark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                  {item.priority} PRIORITY
                </span>

                {canManage && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className={`text-xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap mb-8 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>

              {/* Footer info */}
              <div className={`mt-auto pt-4 border-t flex flex-wrap gap-4 text-[10px] font-bold uppercase ${dark ? 'border-[#2a2a40] text-gray-500' : 'border-gray-200/60 text-gray-400'}`}>
                <div>
                  <div className="mb-1">Created:</div>
                  <div className={dark ? 'text-gray-300' : 'text-gray-600'}>{formatDateTime(item.createdAt)}</div>
                </div>
                {item.validUntil && (
                  <div>
                    <div className="mb-1 flex items-center gap-1">Delete after: {isPast(item.validUntil) && <span className="text-red-500">(Past)</span>}</div>
                    <div className={dark ? 'text-gray-300' : 'text-gray-600'}>{formatDateTime(item.validUntil)}</div>
                  </div>
                )}
                <div className="w-full mt-2">Posted by {item.postedBy?.name || 'Admin'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AnnouncementForm
          announcement={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { fetchAnnouncements(); setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}