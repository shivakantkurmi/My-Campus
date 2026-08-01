import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Building2, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import useAdminStore from '../../store/adminStore';
import useThemeStore from '../../store/themeStore';
import { useAuroraCanvas } from './Login';

const schema = yup.object({
  name:       yup.string().min(2, 'Min 2 chars').required('Name required'),
  email:      yup.string().email('Invalid email').required('Email required'),
  password:   yup.string().min(6, 'Min 6 chars').required('Password required'),
  role:       yup.string().oneOf(['student', 'faculty']).required('Role required'),
  department: yup.string().required('Department required'),
});

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Information Technology',
  'Electrical Engineering', 'Chemical Engineering', 'Biotechnology', 'MBA', 'Other',
];

const PERKS = [
  { title: 'Notes from seniors',    desc: 'Browse and download notes from your own department.' },
  { title: 'Anti-proxy attendance', desc: 'QR scan with time limit — proxies are impossible.'   },
  { title: 'Faculty availability',  desc: "Know who's in their cabin before making the trip."   },
  { title: 'Live CGPA tracking',    desc: 'Enter grades, calculate GPA/CGPA instantly.'         },
];

export default function Register() {
  const navigate = useNavigate();
  const [serverErr, setServerErr] = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [success,   setSuccess]   = useState(false);

  const { dark, initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  const canvasRef = useRef(null);
  /* Violet-dominant hue list by passing a different palette override via density */
  useAuroraCanvas(canvasRef, dark);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data) => {
    try {
      setServerErr('');
      await api.post('/auth/register', data);
      useAdminStore.getState().invalidate();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  /* ── Theme-reactive panel variables ── */
  const panelBg    = dark ? 'bg-gray-950'   : 'bg-white';
  const headingCls = dark ? 'text-white'    : 'text-gray-900';
  const subCls     = dark ? 'text-gray-400' : 'text-gray-500';
  const logoText   = dark ? 'text-white'    : 'text-gray-900';
  const perkTitle  = dark ? 'text-white'    : 'text-gray-900';
  const perkDesc   = dark ? 'text-gray-500' : 'text-gray-400';
  const perkIcon   = dark ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                          : 'bg-violet-100 border-violet-300/60 text-violet-600';
  const badgeBg    = dark ? 'bg-violet-500/15 border-violet-400/30 text-violet-300'
                          : 'bg-violet-100 border-violet-300/60 text-violet-700';
  const pingColor  = dark ? 'bg-violet-400' : 'bg-violet-600';
  const cardBg     = dark ? 'bg-white/5 border-white/10' : 'bg-black/4 border-black/8';
  const cardText   = dark ? 'text-gray-400' : 'text-gray-600';
  const cardBtn    = dark ? 'bg-white/8 hover:bg-white/14 text-white border-white/12'
                          : 'bg-black/6 hover:bg-black/10 text-gray-800 border-black/12';
  const dotGrid    = dark
    ? 'radial-gradient(circle, rgba(167,139,250,0.13) 1px, transparent 1px)'
    : 'radial-gradient(circle, rgba(139,92,246,0.16) 1px, transparent 1px)';
  const vignette   = dark
    ? 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 20%, rgba(3,7,18,0.55) 100%)'
    : 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 20%, rgba(255,255,255,0.52) 100%)';
  const edgeFade   = dark
    ? 'linear-gradient(to right, transparent, rgba(3,7,18,0.45))'
    : 'linear-gradient(to right, transparent, rgba(255,255,255,0.50))';
  const inputCls   = 'w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all';

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">

      {/* ════════════════════════════════════════════
          LEFT PANEL — theme-reactive aurora (violet)
      ════════════════════════════════════════════ */}
      <div className={`hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden transition-colors duration-500 ${panelBg}`}>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ display: 'block' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: vignette }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: dotGrid, backgroundSize: '30px 30px' }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{ background: edgeFade }} />

        <div className="relative z-10 flex flex-col h-full p-12">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="mc-float w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/40" style={{ animationDuration: '3.5s' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${logoText}`}>My-Campus</span>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <div className={`mc-bounce-drop inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold w-fit mb-8 select-none ${badgeBg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${pingColor}`} />
              </span>
              VIT Bhopal · Open to all students
            </div>

            <h2 className={`mc-fade-up text-4xl xl:text-[2.75rem] font-extrabold leading-[1.15] mb-5 tracking-tight ${headingCls}`}>
              Join your<br />
              <span style={{
                background: dark
                  ? 'linear-gradient(90deg,#a78bfa,#f0abfc,#67e8f9,#a78bfa)'
                  : 'linear-gradient(90deg,#7c3aed,#9333ea,#06b6d4,#7c3aed)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 3.5s linear infinite',
              }}>campus community.</span>
            </h2>

            <p className={`mc-fade-up mc-stagger-2 text-base leading-relaxed mb-10 max-w-[300px] ${subCls}`}>
              Everything a VITian needs, unified in one platform.
            </p>

            {/* Perks */}
            <div className="space-y-4">
              {PERKS.map(({ title, desc }, i) => (
                <div key={title} className="mc-slide-bounce flex items-start gap-3 group" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${perkIcon}`}>
                    <CheckCircle2 size={11} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-snug ${perkTitle}`}>{title}</p>
                    <p className={`text-xs leading-snug mt-0.5 ${perkDesc}`}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Already have account */}
          <div className={`p-4 rounded-2xl border backdrop-blur-sm ${cardBg}`}>
            <p className={`text-sm mb-3 ${cardText}`}>Already have an account?</p>
            <Link to="/login" className={`mc-btn inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all active:scale-95 ${cardBtn}`}>
              Sign In <ArrowRight size={13} className="mc-nudge" />
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT PANEL — Registration form
      ════════════════════════════════════════════ */}
      <div className="mc-fade-left flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12 overflow-y-auto bg-white dark:bg-gray-950">

        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">My-Campus</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-7">
            <h1 className="mc-rubber-in text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
            <p className="mc-fade-up mc-stagger-2 text-sm text-gray-500 dark:text-gray-400">
              Already have one?{' '}
              <Link to="/login" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {success && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
              ✅ Account created! Redirecting to login…
            </div>
          )}
          {serverErr && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <span>⚠️</span><span>{serverErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('name')} type="text" placeholder="Your full name" className={`${inputCls} pl-10 pr-4`} />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('email')} type="email" placeholder="you@vitbhopal.ac.in" className={`${inputCls} pl-10 pr-4`} />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" className={`${inputCls} pl-10 pr-11`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select {...register('department')} className={`${inputCls} pl-10 pr-4 appearance-none`}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {errors.department && <p className="mt-1.5 text-xs text-red-500">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'faculty'].map((r) => (
                  <label key={r} className="relative cursor-pointer">
                    <input {...register('role')} type="radio" value={r} className="sr-only peer" />
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 peer-checked:border-violet-500 peer-checked:bg-violet-50 dark:peer-checked:bg-violet-900/25 peer-checked:text-violet-700 dark:peer-checked:text-violet-300 transition-all">
                      {r === 'student' ? '🎓' : '👨‍🏫'}<span className="capitalize">{r}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && <p className="mt-1.5 text-xs text-red-500">{errors.role.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting || success}
              className="mc-btn w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:-translate-y-0.5 transition-all active:scale-95 mt-1">
              {isSubmitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                : <>Create Account <ArrowRight size={16} className="mc-nudge" /></>}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link to="/" className="text-sm text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
