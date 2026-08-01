import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import {
  Save, User, Building2, Lock, ShieldCheck,
  Mail, GraduationCap, BadgeCheck, KeyRound,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Information Technology',
  'Electrical Engineering', 'Chemical Engineering', 'Biotechnology', 'MBA', 'Other',
];

const ROLE_META = {
  student: { label: 'Student',     icon: GraduationCap, color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' },
  faculty: { label: 'Faculty',     icon: BadgeCheck,    color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' },
  admin:   { label: 'Admin',       icon: ShieldCheck,   color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700' },
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [success, setSuccess] = useState('');
  const [err, setErr]         = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name:            user?.name        || '',
      department:      user?.department  || '',
      currentPassword: '',
      newPassword:     '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setErr(''); setSuccess('');
      const res = await api.put('/auth/profile', data);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setErr(e.response?.data?.message || 'Update failed');
    }
  };

  const roleMeta  = ROLE_META[user?.role] || ROLE_META.student;
  const RoleIcon  = roleMeta.icon;

  const inputCls  = 'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all text-sm';

  return (
    /* Full-width two-column grid — no more wasted right side */
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

      {/* ═══════════════════════════════════════
          LEFT COLUMN — Identity card
      ═══════════════════════════════════════ */}
      <div className="space-y-4">

        {/* Profile card */}
        <div className="mc-fade-down relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">

          {/* Decorative banner */}
          <div className="h-24 bg-linear-to-br from-indigo-600 via-violet-600 to-sky-500 relative">
            <div className="mc-blob absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="mc-blob absolute -bottom-3 left-10 w-16 h-16 rounded-full bg-white/8" style={{ animationDelay: '2s' }} />
          </div>

          {/* Avatar — overlapping the banner */}
          <div className="px-6 pb-6">
            <div className="mc-float -mt-10 mb-4 w-fit" style={{ animationDuration: '4s' }}>
              <div className="ring-4 ring-white dark:ring-gray-900 rounded-full shadow-xl">
                <Avatar name={user?.name} size={20} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
              <Mail size={13} className="shrink-0" />
              {user?.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleMeta.color}`}>
                <RoleIcon size={12} />
                {roleMeta.label}
              </span>
            </div>

            {user?.department && (
              <p className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Building2 size={14} className="text-indigo-500 shrink-0" />
                {user.department}
              </p>
            )}
          </div>
        </div>

        {/* Account info card */}
        <div className="mc-fade-up mc-stagger-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Account Info</h3>
          {[
            { icon: User,       label: 'Name',       value: user?.name       },
            { icon: Mail,       label: 'Email',      value: user?.email      },
            { icon: Building2,  label: 'Department', value: user?.department },
            { icon: ShieldCheck,label: 'Role',       value: user?.role       },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate capitalize">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT COLUMN — Edit form
      ═══════════════════════════════════════ */}
      <div className="space-y-5">

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
            ✅ {success}
          </div>
        )}
        {err && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            <span>⚠️</span><span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Section: Personal Info ── */}
          <div className="mc-fade-up bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <User size={15} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Update your name and department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Department</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    {...register('department')}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Read-only info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email <span className="text-gray-400 font-normal">(read-only)</span></label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Role <span className="text-gray-400 font-normal">(read-only)</span></label>
                <div className="relative">
                  <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed capitalize"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section: Change Password ── */}
          <div className="mc-fade-up mc-stagger-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <KeyRound size={15} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Leave blank to keep your current password</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('currentPassword')}
                    type="password"
                    placeholder="Current password"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    {...register('newPassword')}
                    type="password"
                    placeholder="Min 6 characters"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Save button ── */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mc-btn inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 mc-glow-border hover:-translate-y-0.5 transition-all active:scale-95 text-sm"
            >
              {isSubmitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
