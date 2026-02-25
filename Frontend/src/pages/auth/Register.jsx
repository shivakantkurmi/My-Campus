import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Building2 } from 'lucide-react';
import api from '../../api/axios';
import useAdminStore from '../../store/adminStore';

const schema = yup.object({
  name: yup.string().min(2, 'Min 2 chars').required('Name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required('Password required'),
  role: yup.string().oneOf(['student', 'faculty']).required('Role required'),
  department: yup.string().required('Department required'),
});

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'MBA',
  'Other',
];

export default function Register() {
  const navigate = useNavigate();
  const [serverErr, setServerErr] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data) => {
    try {
      setServerErr('');
      await api.post('/auth/register', data);
      // Mark admin store stale so the admin panel re-fetches the updated user list
      useAdminStore.getState().invalidate();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const inputCls = 'w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">

      {/* ── Left panel — branding ── */}
      <div className="mc-fade-right hidden lg:flex lg:w-[40%] bg-linear-to-br from-violet-600 via-indigo-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="mc-blob absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="mc-blob absolute bottom-16 -left-10 w-64 h-64 rounded-full bg-violet-400/15" style={{ animationDelay: '3s' }} />
        <div className="mc-drift absolute top-20 right-12 w-2 h-2 rounded-full bg-white/25 pointer-events-none" style={{ animationDuration: '9s' }} />
        <div className="mc-drift absolute bottom-40 left-16 w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none" style={{ animationDuration: '11s', animationDelay: '2s' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="mc-float w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center" style={{ animationDuration: '3.5s' }}>
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">My-Campus</span>
          </div>
          <h2 className="mc-bounce-drop text-4xl font-extrabold text-white leading-tight mb-4">
            Join your campus<br />community.
          </h2>
          <p className="mc-fade-up mc-stagger-3 text-indigo-200 text-lg leading-relaxed max-w-sm">
            Create your account and get instant access to notes, attendance tools, and more.
          </p>
        </div>

        <div className="relative">
          <div className="mc-scale-in p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
            <p className="text-white text-sm font-medium mb-3">Already a member?</p>
            <Link to="/login" className="mc-btn inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition active:scale-95">
              Sign In Instead <ArrowRight size={14} className="mc-nudge" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="mc-fade-left flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 overflow-y-auto">
        {/* mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">My-Campus</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-7">
            <h1 className="mc-rubber-in text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
            <p className="mc-fade-up mc-stagger-2 text-gray-500 dark:text-gray-400">
              Already have one?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
            </p>
          </div>

          {success && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
              ✅ Account created! Redirecting to login…
            </div>
          )}

          {serverErr && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <span className="mt-0.5">⚠️</span>
              <span>{serverErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('name')} type="text" placeholder="Shivakant Kurmi" className={`${inputCls} pl-10 pr-4`} />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('email')} type="email" placeholder="you@vitbhopal.ac.in" className={`${inputCls} pl-10 pr-4`} />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" className={`${inputCls} pl-10 pr-11`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select {...register('department')} className={`${inputCls} pl-10 pr-4 appearance-none`}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {errors.department && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.department.message}</p>}
            </div>

            {/* Role toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'faculty'].map((r) => (
                  <label key={r} className="relative cursor-pointer">
                    <input {...register('role')} type="radio" value={r} className="sr-only peer" />
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/30 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-300 transition-all">
                      {r === 'student' ? '🎓' : '👨‍🏫'}
                      <span className="capitalize">{r}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="mc-btn w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 mc-glow-border hover:-translate-y-0.5 transition-all active:scale-95 mt-1"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={16} className="mc-nudge" /></>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link to="/" className="text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
