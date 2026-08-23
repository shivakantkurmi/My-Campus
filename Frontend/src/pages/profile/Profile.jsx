import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
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
  student: { label: 'Student', icon: GraduationCap, lightColor: 'bg-indigo-100 text-indigo-700 border-indigo-200', darkColor: 'bg-[#c9a84c]/12 text-[#c9a84c] border-[#c9a84c]/30' },
  faculty: { label: 'Faculty', icon: BadgeCheck,    lightColor: 'bg-emerald-100 text-emerald-700 border-emerald-200', darkColor: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/30' },
  admin:   { label: 'Admin',   icon: ShieldCheck,   lightColor: 'bg-rose-100 text-rose-700 border-rose-200', darkColor: 'bg-rose-500/12 text-rose-400 border-rose-500/30' },
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { dark } = useThemeStore();
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

  const roleMeta = ROLE_META[user?.role] || ROLE_META.student;
  const RoleIcon = roleMeta.icon;
  const roleColorCls = dark ? roleMeta.darkColor : roleMeta.lightColor;

  /* ── Liquid Glass / Dark Premium Theme Classes ── */
  const glassCard = dark 
    ? 'bg-[#121220] rounded-[2.5rem] border border-[#232336]' 
    : 'bg-white/80 backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)]';
  
  const glassInput = dark
    ? 'bg-[#1c1c2e] border-[#2a2a40] text-white placeholder-gray-500 focus:border-[#c9a84c]'
    : 'bg-white/50 border-white/60 text-gray-900 placeholder-gray-400 focus:border-indigo-400 backdrop-blur-md shadow-sm';

  const inputCls = `w-full pl-10 pr-4 py-3 rounded-[1.5rem] text-sm outline-none transition-all border ${glassInput}`;

  const readonlyCls = `w-full pl-10 pr-4 py-3 rounded-[1.5rem] text-sm cursor-not-allowed ${
    dark ? 'bg-[#12121e]/60 border border-[#2a2a40] text-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-400'
  }`;

  const labelCls = `block text-xs font-bold mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr] gap-5 lg:gap-6 items-start pb-10">

      {/* ═══════════════════════════════════════
          LEFT — Identity card
      ═══════════════════════════════════════ */}
      <div className="space-y-4">

        {/* Profile card */}
        <div className={`mc-fade-down relative overflow-hidden transition-all ${glassCard}`}>

          {/* Decorative banner */}
          <div className={`h-32 relative overflow-hidden ${
            dark
              ? 'bg-gradient-to-br from-[#1c1408] via-[#241a08] to-[#100e04]'
              : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500'
          }`}>
            <div className="mc-blob absolute -top-6 -right-6 w-32 h-32 rounded-full"
              style={{ background: dark ? 'rgba(201,168,76,0.10)' : 'rgba(255,255,255,0.10)' }} />
            <div className="mc-blob absolute -bottom-3 left-10 w-24 h-24 rounded-full"
              style={{ animationDelay: '2s', background: dark ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Avatar */}
          <div className="px-6 pb-6">
            <div className="mc-float -mt-10 mb-4 w-fit" style={{ animationDuration: '4s' }}>
              <div className={`ring-4 rounded-full shadow-xl ${
                dark ? 'ring-[#08080f]' : 'ring-white'
              }`}>
                <Avatar name={user?.name} size={20} />
              </div>
            </div>

            <h2 className={`text-xl font-bold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              {user?.name}
            </h2>
            <p className={`text-sm mt-0.5 flex items-center gap-1.5 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
              <Mail size={13} className="shrink-0" />
              {user?.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColorCls}`}>
                <RoleIcon size={12} />
                {roleMeta.label}
              </span>
            </div>

            {user?.department && (
              <p className={`mt-3 flex items-center gap-2 text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>
                <Building2 size={14} className={dark ? 'text-[#c9a84c]/60 shrink-0' : 'text-indigo-500 shrink-0'} />
                {user.department}
              </p>
            )}
          </div>
        </div>

        {/* Account info card */}
        <div className={`mc-fade-up mc-stagger-2 p-6 space-y-2 overflow-hidden transition-all ${glassCard}`}>
          <h3 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${
            dark ? 'text-[#c9a84c]/60' : 'text-gray-400'
          }`}>Account Info</h3>
          {[
            { icon: User,        label: 'Name',       value: user?.name       },
            { icon: Mail,        label: 'Email',      value: user?.email      },
            { icon: Building2,   label: 'Department', value: user?.department },
            { icon: ShieldCheck, label: 'Role',       value: user?.role       },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className={`flex items-start gap-3 py-2.5 border-b last:border-0 ${
              dark ? 'border-[#c9a84c]/8' : 'border-gray-100'
            }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                dark ? 'bg-[#c9a84c]/10' : 'bg-indigo-50'
              }`}>
                <Icon size={13} className={dark ? 'text-[#c9a84c]/70' : 'text-indigo-600'} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{label}</p>
                <p className={`text-sm font-medium truncate capitalize ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {value || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT — Edit form
      ═══════════════════════════════════════ */}
      <div className="space-y-5">

        {/* Alerts */}
        {success && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
            dark ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>✅ {success}</div>
        )}
        {err && (
          <div className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
            dark ? 'bg-red-900/20 border-red-800/40 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
          }`}><span>⚠️</span><span>{err}</span></div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Personal Info ── */}
          <div className={`mc-fade-up p-5 md:p-6 lg:p-8 ${glassCard}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                dark ? 'bg-[#c9a84c]/12' : 'bg-indigo-100'
              }`}>
                <User size={15} className={dark ? 'text-[#c9a84c]/80' : 'text-indigo-600'} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>Update your name and department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input {...register('name')} type="text" placeholder="Your full name" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select {...register('department')} className={`${inputCls} appearance-none`}>
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email <span className="text-gray-400 font-normal">(read-only)</span></label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="email" value={user?.email || ''} readOnly className={readonlyCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Role <span className="text-gray-400 font-normal">(read-only)</span></label>
                <div className="relative">
                  <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : ''}
                    readOnly
                    className={`${readonlyCls} capitalize`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Change Password ── */}
          <div className={`mc-fade-up mc-stagger-2 p-5 md:p-6 lg:p-8 ${glassCard}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                dark ? 'bg-violet-500/12' : 'bg-violet-100'
              }`}>
                <KeyRound size={15} className={dark ? 'text-violet-400/80' : 'text-violet-600'} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Change Password</h3>
                <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>Leave blank to keep your current password</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input {...register('currentPassword')} type="password" placeholder="Current password" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input {...register('newPassword')} type="password" placeholder="Min 6 characters" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Save button ── */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`mc-btn inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all active:scale-95 text-sm ${
                dark
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] shadow-[#c9a84c]/25 mc-glow-gold'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25 mc-glow-border'
              }`}
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
