import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import { Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [success, setSuccess] = useState('');
  const [err, setErr] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name,
      department: user?.department,
      currentPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setErr(''); setSuccess('');
      const res = await api.put('/auth/profile', data);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
    } catch (e) {
      setErr(e.response?.data?.message || 'Update failed');
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white';

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="mc-fade-down bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center gap-4">
        <Avatar name={user?.name} size={20} />
        <div className="text-center">
          <p className="font-semibold text-gray-800 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="inline-block mt-1 text-xs capitalize px-3 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="mc-fade-up mc-stagger-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">Edit Profile</h3>

        {success && <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-400">{success}</div>}
        {err && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">{err}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'department', label: 'Department', type: 'text' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
              <input {...register(name)} type={type} className={inputCls} />
            </div>
          ))}

          <hr className="border-gray-200 dark:border-gray-700" />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Change Password (leave blank to keep current)</p>

          {[
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword', label: 'New Password' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
              <input {...register(name)} type="password" className={inputCls} />
            </div>
          ))}

          <button type="submit" disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm">
            <Save size={16} /> {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
