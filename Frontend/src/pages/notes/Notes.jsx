import { useEffect, useState } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import NoteForm from './NoteForm';
import { Search, Plus, ExternalLink, Pencil, Trash2, BookOpen, Loader2 } from 'lucide-react';

const SUBJECTS = ['All', 'CN', 'OOPS', 'Operating Systems', 'CPP', 'DBMS', 'Maths', 'Physics', 'Other'];

export default function Notes() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes');
      setNotes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  useEffect(() => {
    let list = notes;
    if (subject !== 'All') list = list.filter(n => n.subject === subject);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        n.faculty?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [notes, search, subject]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/notes/${id}`);
      await fetchNotes();
    } finally {
      setDeletingId(null);
    }
  };

  const canEdit = (note) => note.uploadedBy?._id === user?._id;
  const canDelete = (note) => canEdit(note) || user?.role === 'admin';

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-[#121220] backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 dark:border-[#c9a84c]/20 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)] dark:shadow-none transition-all text-sm focus:outline-none focus:border-indigo-500 dark:border-[#c9a84c] dark:text-white"
          />
        </div>
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="px-3 py-2 bg-white/80 dark:bg-[#121220] backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 dark:border-[#c9a84c]/20 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)] dark:shadow-none transition-all text-sm dark:text-white"
        >
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#c9a84c] dark:hover:bg-[#a87c30] dark:text-[#07070f] rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add Note
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mc-skeleton  h-44" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mc-fade-up text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>No notes found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <div key={note._id}
              className="mc-flip-up mc-card-hover bg-white/80 dark:bg-[#121220] backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 dark:border-[#c9a84c]/20 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)] dark:shadow-none transition-all p-4 flex flex-col gap-2"
              style={{ animationDelay: `${i * 55}ms` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-indigo-600 dark:text-[#c9a84c] tracking-wide">{note.subject}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{note.title}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  {canEdit(note) && (
                    <button onClick={() => { setEditing(note); setShowForm(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Pencil size={14} className="text-gray-500" />
                    </button>
                  )}
                  {canDelete(note) && (
                    <button
                      onClick={() => handleDelete(note._id)}
                      disabled={deletingId === note._id}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                      title="Delete note"
                    >
                      {deletingId === note._id ? (
                        <Loader2 size={14} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={14} className="text-red-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{note.description}</p>
              <div className="text-xs text-gray-400 space-y-0.5 mt-auto">
                {note.courseCode && <p>Code: <span className="text-gray-600 dark:text-gray-300">{note.courseCode}</span></p>}
                {note.faculty && <p>Faculty: <span className="text-gray-600 dark:text-gray-300">{note.faculty}</span></p>}
                {note.module && <p>Module: {note.module}</p>}
                <p>By: <span className="text-gray-600 dark:text-gray-300">{note.uploadedBy?.name}</span></p>
              </div>
              <a
                href={note.driveURL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-[#c9a84c] hover:text-indigo-700 dark:hover:text-[#a87c30] font-medium mt-1"
              >
                <ExternalLink size={12} /> Open Drive Link
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <NoteForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchNotes(); }}
        />
      )}
    </div>
  );
}
