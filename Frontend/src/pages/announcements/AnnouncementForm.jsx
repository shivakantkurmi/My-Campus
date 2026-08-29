import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';

const schema = yup.object({
  title: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required(),
  deadline: yup.string().nullable(),
});

const toInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AnnouncementForm({ editing, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title ?? '',
        description: editing.description ?? '',
        priority: editing.priority ?? 'medium',
        deadline: toInputValue(editing.deadline),
      });
    } else {
      reset({ title: '', description: '', priority: 'medium', deadline: '' });
    }
  }, [editing, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      deadline: data.deadline || null,
    };

    if (editing) await api.put(`/announcements/${editing._id}`, payload);
    else await api.post('/announcements', payload);
    onSaved();
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white';

  return (
    <Modal onClose={onClose}>
      <div className="bg-white dark:bg-[#121220] border border-slate-200 dark:border-[#2a2a40] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">{editing ? 'Edit Announcement' : 'Create Announcement'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Announcement Name</label>
            <input {...register('title')} placeholder="Semester registration update" className={inputCls} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
            <textarea {...register('description')} placeholder="What students and teachers need to know…" rows={5} className={`${inputCls} resize-none`} />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
              <select {...register('priority')} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Delete After (optional)</label>
              <input {...register('deadline')} type="datetime-local" className={inputCls} />
              <p className="mt-1 text-[11px] text-gray-400">The announcement will be removed automatically after this time.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}