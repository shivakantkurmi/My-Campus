import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';

const SUBJECTS = ['CN', 'OOPS', 'Operating Systems', 'CPP', 'DBMS', 'Maths', 'Physics', 'Other'];

const schema = yup.object({
  title: yup.string().required('Title required'),
  driveURL: yup.string().url('Must be a valid URL').required('Drive URL required'),
  subject: yup.string().required('Subject required'),
  courseCode: yup.string(),
  faculty: yup.string(),
  slot: yup.string(),
  module: yup.number().typeError('Must be a number').min(1).max(10),
  description: yup.string(),
});

export default function NoteForm({ editing, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: editing || { subject: 'CN' },
  });

  useEffect(() => {
    if (editing) reset(editing);
  }, [editing]);

  const onSubmit = async (data) => {
    if (editing) await api.put(`/notes/${editing._id}`, data);
    else await api.post('/notes', data);
    onSaved();
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">{editing ? 'Edit Note' : 'Add Note'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {[
            { name: 'title', label: 'Title', placeholder: 'Note title' },
            { name: 'driveURL', label: 'Drive URL', placeholder: 'https://drive.google.com/...' },
            { name: 'courseCode', label: 'Course Code', placeholder: 'CS301' },
            { name: 'faculty', label: 'Faculty Name', placeholder: 'Dr. Sunita Sharma' },
            { name: 'slot', label: 'Slot (optional)', placeholder: 'A1' },
            { name: 'description', label: 'Description', placeholder: 'Brief about content…' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
              {name === 'description' ? (
                <textarea {...register(name)} placeholder={placeholder} rows={3} className={`${inputCls} resize-none`} />
              ) : (
                <input {...register(name)} placeholder={placeholder} className={inputCls} />
              )}
              {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name].message}</p>}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subject</label>
              <select {...register('subject')} className={inputCls}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Module No.</label>
              <input {...register('module')} type="number" min={1} max={10} placeholder="1" className={inputCls} />
              {errors.module && <p className="mt-1 text-xs text-red-400">{errors.module.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
