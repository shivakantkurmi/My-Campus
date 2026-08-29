import { useEffect, useState } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import useCabinsStore from '../../store/cabinsStore';
import { Search, Plus, Pencil, Trash2, DoorOpen, MessageSquarePlus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';

const PAGE_SIZE = 30;

export default function FacultyCabins() {
  const { user } = useAuthStore();
  const { cabins, loading, fetchCabins, refresh } = useCabinsStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | {} | cabin-obj
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [fbType, setFbType] = useState('missing_faculty');
  const [fbMsg, setFbMsg] = useState('');
  const [fbSent, setFbSent] = useState(false);
  const [isSendingFb, setIsSendingFb] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Load once; subsequent visits reuse cache
  useEffect(() => { fetchCabins(); }, []);

  // Search across ALL cabins, then paginate the results
  const filtered = cabins.filter(c =>
    !search || c.facultyName.toLowerCase().includes(search.toLowerCase()) ||
    (c.cabinNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Reset to page 1 whenever search changes or total shrinks
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const handleSave = async () => {
    if (!form.facultyName || !form.cabinNumber) return;
    try {
      setIsSaving(true);
      if (form._id) await api.put(`/cabins/${form._id}`, form);
      else await api.post('/cabins', form);
      setForm(null);
      refresh(); // invalidate cache and re-fetch
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this cabin?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/cabins/${id}`);
      refresh(); // invalidate cache and re-fetch
    } finally {
      setDeletingId(null);
    }
  };

  const sendFeedback = async () => {
    if (!fbMsg.trim()) return;
    try {
      setIsSendingFb(true);
      await api.post('/feedback', { type: fbType, message: fbMsg });
      setFbSent(true); setFbMsg(''); setFeedback('');
    } finally {
      setIsSendingFb(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-white/40 dark:bg-[#1c1c2e] backdrop-blur-md border border-white/60 dark:border-[#2a2a40] rounded-lg text-sm focus:outline-none dark:text-white';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search faculty or cabin number…"
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-[#c9a84c] text-gray-900 dark:text-white shadow-sm transition-colors" />
        </div>
        {isAdmin && (
          <button onClick={() => setForm({})} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white dark:bg-[#c9a84c] dark:text-[#07070f] rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-[#a87c30] transition-colors shadow-sm">
            <Plus size={16} /> Add Cabin
          </button>
        )}
        <button onClick={() => setFeedback('open')} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm">
          <MessageSquarePlus size={16} /> Report Issue
        </button>
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 animate-pulse p-4 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 pt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Cabin cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && paginated.map((c) => (
          <div key={c._id}
            className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#232336] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200 dark:hover:border-[#c9a84c]/30 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{c.facultyName}</h3>
                {c.department && <p className="text-xs text-indigo-600 dark:text-[#c9a84c] mt-0.5 font-medium">{c.department}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => setForm(c)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Pencil size={14} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg disabled:opacity-50 transition-colors"
                    title="Delete cabin"
                  >
                    {deletingId === c._id ? (
                      <Loader2 size={14} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={14} className="text-red-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <DoorOpen size={14} className="text-slate-400" /> Cabin: <span className="font-semibold text-slate-800 dark:text-slate-100">{c.cabinNumber}</span>
              </p>
              {c.contact && <p className="text-gray-500 dark:text-gray-400 text-xs">📞 {c.contact}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ChevronLeft size={16} />
          </button>

          {/* Page number pills */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 2)
            .reduce((acc, n, idx, arr) => {
              if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
              acc.push(n);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition ${
                    safePage === item
                      ? 'bg-indigo-600 text-white dark:bg-[#c9a84c] dark:text-[#07070f]'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ChevronRight size={16} />
          </button>

          <span className="text-xs text-gray-400 ml-1">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </div>
      )}

      {/* Add/Edit Modal – portaled to <body> to escape layout stacking context */}
      {form !== null && (
        <Modal onClose={() => setForm(null)}>
          <div className="bg-white dark:bg-[#121220] rounded-2xl border border-slate-200 dark:border-[#2a2a40] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">{form._id ? 'Edit Cabin' : 'Add Cabin'}</h2>
              <button onClick={() => setForm(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[72vh] p-6 space-y-4">
              {[
                { key: 'facultyName', label: 'Faculty Name' },
                { key: 'cabinNumber', label: 'Cabin Number' },
                { key: 'contact', label: 'Contact' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setForm(null)} className="flex-1 py-2 border border-white/60 dark:border-[#2a2a40] rounded-lg text-sm text-gray-600 dark:text-gray-300">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#c9a84c] dark:hover:bg-[#a87c30] dark:text-[#07070f] rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Modal – portaled to <body> */}
      {feedback === 'open' && (
        <Modal onClose={() => setFeedback('')}>
          <div className="bg-white dark:bg-[#121220] rounded-2xl border border-slate-200 dark:border-[#2a2a40] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Report an Issue</h2>
              <button onClick={() => setFeedback('')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[72vh] p-6 space-y-4">
              {fbSent ? (
                <p className="text-green-500 py-4 text-center">Feedback sent to admin! ✓</p>
              ) : (
                <>
                  <select value={fbType} onChange={e => setFbType(e.target.value)} className={inputCls}>
                    <option value="missing_faculty">Missing Faculty</option>
                    <option value="wrong_cabin">Wrong Cabin Info</option>
                    <option value="complaint">General Complaint</option>
                  </select>
                  <textarea value={fbMsg} onChange={e => setFbMsg(e.target.value)} rows={4} placeholder="Describe the issue…" className={`${inputCls} resize-none`} />
                  <div className="flex gap-3">
                    <button onClick={() => setFeedback('')} className="flex-1 py-2 border border-white/60 dark:border-[#2a2a40] rounded-lg text-sm text-gray-600 dark:text-gray-300">Cancel</button>
                    <button
                      onClick={sendFeedback}
                      disabled={isSendingFb}
                      className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSendingFb ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Submitting…</span>
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
