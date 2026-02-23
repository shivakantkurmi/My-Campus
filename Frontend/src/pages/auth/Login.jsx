import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required('Password required'),
});

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverErr, setServerErr] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setServerErr('');
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">

      {/* ── Left panel — branding ── */}
      <div className="mc-fade-right hidden lg:flex lg:w-[45%] bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="mc-blob absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="mc-blob absolute bottom-24 right-0 w-96 h-96 rounded-full bg-violet-500/20 translate-x-1/2" style={{ animationDelay: '3s' }} />
        <div className="mc-blob absolute top-1/3 -left-8 w-40 h-40 rounded-full bg-indigo-400/20" style={{ animationDelay: '5s' }} />
        <div className="mc-drift absolute top-16 right-16 w-2 h-2 rounded-full bg-white/30 pointer-events-none" style={{ animationDuration: '9s' }} />
        <div className="mc-drift absolute bottom-32 left-24 w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="mc-float w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center" style={{ animationDuration: '3.5s' }}>
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">My-Campus</span>
          </div>
          <h2 className="mc-bounce-drop text-4xl font-extrabold text-white leading-tight mb-4">
            Welcome back<br />to campus life.
          </h2>
          <p className="mc-fade-up mc-stagger-3 text-indigo-200 text-lg leading-relaxed max-w-sm">
            Access your notes, attendance, faculty finder and CGPA calculator — all in one place.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '📚', text: 'Share & discover notes across departments' },
            { icon: '📱', text: 'Scan QR codes to mark attendance instantly' },
            { icon: '🎓', text: 'Track your CGPA in real time' },
          ].map(({ icon, text }, i) => (
            <div key={text} className="mc-slide-bounce flex items-center gap-3" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="mc-float text-xl" style={{ animationDuration: `${3 + i * 0.5}s`, animationDelay: `${i * 0.4}s` }}>{icon}</span>
              <span className="text-indigo-100 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="mc-fade-left flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12">
        {/* mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">My-Campus</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="mc-rubber-in text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Sign in</h1>
            <p className="mc-fade-up mc-stagger-2 text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Register</Link>
            </p>
          </div>

          {serverErr && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <span className="mt-0.5">⚠️</span>
              <span>{serverErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@vitbhopal.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mc-btn w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 mc-glow-border hover:-translate-y-0.5 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} className="mc-nudge" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link to="/" className="text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
