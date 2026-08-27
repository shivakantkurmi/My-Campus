import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, GraduationCap, User, Building2, BookOpen, QrCode, DoorOpen, Calculator, Sun, Moon } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import useAdminStore from '../../store/adminStore';
import useThemeStore from '../../store/themeStore';

const loginSchema = yup.object({
  email:    yup.string().email('Invalid email').max(100, 'Max 100 characters').required('Email required'),
  password: yup.string().min(4, 'Min 4 characters').max(16, 'Max 16 characters').required('Password required'),
});

const registerSchema = yup.object({
  name:       yup.string().min(2, 'Min 2 chars').max(60, 'Max 60 chars').required('Name required'),
  email:      yup.string().email('Invalid email').max(100, 'Max 100 characters').required('Email required'),
  password:   yup.string().min(4, 'Min 4 characters').max(16, 'Max 16 characters').required('Password required'),
  role:       yup.string().oneOf(['student', 'faculty']).required('Role required'),
  department: yup.string().required('Department required'),
});

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Information Technology',
  'Electrical Engineering', 'Chemical Engineering', 'Biotechnology', 'MBA', 'Other',
];

const FEATURES = [
  { icon: BookOpen,   label: 'Notes Sharing',  color: 'text-indigo-400' },
  { icon: QrCode,     label: 'QR Attendance',  color: 'text-violet-400' },
  { icon: DoorOpen,   label: 'Faculty Finder', color: 'text-cyan-400'   },
  { icon: Calculator, label: 'CGPA Calc',      color: 'text-pink-400'   },
];

/* ─────────────────────────────────────────────────────────────────
   Stable form components defined OUTSIDE AuthPage so their
   reference never changes between renders → autofill works correctly
───────────────────────────────────────────────────────────────── */
function LoginFormFields({ onSubmit, register, errors, isSubmitting, showPass, setShowPass, inputBase, lightInputStyle, dark, btnStyle }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <div>
        <div className="relative">
          <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            {...register('email')}
            type="email"
            maxLength={100}
            autoComplete="email"
            placeholder="you@vitbhopal.ac.in"
            className={`${inputBase} pl-12`}
            style={lightInputStyle}
          />
        </div>
        {errors.email && <p className="mt-1.5 pl-4 text-xs text-red-500 font-medium">{errors.email.message}</p>}
      </div>
      <div>
        <div className="relative">
          <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            {...register('password')}
            type={showPass ? 'text' : 'password'}
            minLength={4}
            maxLength={16}
            autoComplete="current-password"
            placeholder="Password (4-16 chars)"
            className={`${inputBase} pl-12 pr-12`}
            style={lightInputStyle}
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 pl-4 text-xs text-red-500 font-medium">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="mc-btn w-full py-4 rounded-full text-base font-bold disabled:opacity-60 mt-4 shadow-xl" style={btnStyle}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

function RegisterFormFields({ onSubmit, register, errors, isSubmitting, showPass, setShowPass, inputBase, lightInputStyle, dark, btnStyle }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 text-left">
      <div>
        <div className="flex gap-3">
          <div className="relative flex-1 min-w-0">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              {...register('name')}
              type="text"
              maxLength={60}
              autoComplete="name"
              placeholder="Full name"
              className={`${inputBase} pl-10 py-3`}
              style={lightInputStyle}
            />
          </div>
          <div className="flex bg-[#07070f]/20 rounded-full p-1 shrink-0" style={lightInputStyle}>
            {['student', 'faculty'].map((r) => (
              <label key={r} className="relative cursor-pointer">
                <input {...register('role')} type="radio" value={r} className="sr-only peer" />
                <div className={`px-3 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                  dark ? 'text-gray-500 peer-checked:bg-[#c9a84c]/20 peer-checked:text-[#c9a84c]'
                       : 'text-gray-500 peer-checked:bg-indigo-100 peer-checked:text-indigo-700'
                }`}>{r}</div>
              </label>
            ))}
          </div>
        </div>
        {errors.name && <p className="mt-1 pl-4 text-[11px] text-red-500 font-medium">{errors.name.message}</p>}
        {errors.role && <p className="mt-1 pl-4 text-[11px] text-red-500 font-medium">{errors.role.message}</p>}
      </div>

      <div>
        <div className="relative">
          <Mail size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            {...register('email')}
            type="email"
            maxLength={100}
            autoComplete="email"
            placeholder="you@vitbhopal.ac.in"
            className={`${inputBase} pl-12 py-3`}
            style={lightInputStyle}
          />
        </div>
        {errors.email && <p className="mt-1 pl-4 text-[11px] text-red-500 font-medium">{errors.email.message}</p>}
      </div>

      <div>
        <div className="relative">
          <Lock size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            {...register('password')}
            type={showPass ? 'text' : 'password'}
            minLength={4}
            maxLength={16}
            autoComplete="new-password"
            placeholder="Password (4-16 chars)"
            className={`${inputBase} pl-12 py-3 pr-12`}
            style={lightInputStyle}
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 pl-4 text-[11px] text-red-500 font-medium">{errors.password.message}</p>}
      </div>

      <div>
        <div className="relative">
          <Building2 size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            {...register('department')}
            autoComplete="organization"
            className={`${inputBase} pl-12 py-3 appearance-none`}
            style={lightInputStyle}
          >
            <option value="">Select Department...</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
        </div>
        {errors.department && <p className="mt-1 pl-4 text-[11px] text-red-500 font-medium">{errors.department.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="mc-btn w-full py-3.5 rounded-full text-base font-bold disabled:opacity-60 mt-2 shadow-xl" style={btnStyle}>
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </button>
      <p className={`text-[11px] text-center pt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
        By registering, you agree to our{' '}
        <Link to="/privacy-policy" className={`underline font-semibold ${dark ? 'text-[#c9a84c] hover:text-[#e8c76b]' : 'text-indigo-600 hover:text-indigo-800'}`}>
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main AuthPage
───────────────────────────────────────────────────────────────── */
export default function AuthPage({ initialView = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { dark, initTheme, toggleTheme } = useThemeStore();
  const [isFlipped, setIsFlipped] = useState(initialView === 'register');
  const [showPass, setShowPass]     = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  const [loginErr, setLoginErr] = useState('');
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrs, isSubmitting: isLoginSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const [regErr, setRegErr] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const {
    register: regSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: regErrs, isSubmitting: isRegSubmitting },
  } = useForm({ resolver: yupResolver(registerSchema), defaultValues: { role: 'student' } });

  useEffect(() => { initTheme(); }, []);
  useEffect(() => { setIsFlipped(location.pathname === '/register'); }, [location.pathname]);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleView = (view) => navigate(view === 'login' ? '/login' : '/register');

  const onLogin = async (data) => {
    try {
      setLoginErr('');
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setLoginErr(err.response?.data?.message || 'Login failed.');
    }
  };

  const onRegister = async (data) => {
    try {
      setRegErr('');
      await api.post('/auth/register', data);
      useAdminStore.getState().invalidate();
      setRegSuccess(true);
      setTimeout(() => toggleView('login'), 1800);
    } catch (err) {
      setRegErr(err.response?.data?.message || 'Registration failed.');
    }
  };

  const inputBase = `w-full py-3.5 rounded-full text-sm transition-all outline-none ${
    dark
      ? 'bg-[#1c1c2e]/70 border border-[#c9a84c]/20 text-white placeholder-gray-600 focus:border-[#c9a84c]/55 focus:ring-2 focus:ring-[#c9a84c]/18 focus:bg-[#202038]'
      : 'border text-gray-800 placeholder-gray-400 focus:ring-2'
  }`;

  const lightInputStyle = !dark ? {
    background: 'rgba(255,255,255,0.68)',
    backdropFilter: 'blur(16px)',
    border: '1.5px solid rgba(180,190,255,0.55)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 8px rgba(99,102,241,0.06)',
  } : {};

  const loginBtnStyle  = dark
    ? { background: 'linear-gradient(135deg,#c9a84c,#a87c30)', color: '#07070f', boxShadow: '0 10px 25px rgba(201,168,76,0.3)' }
    : { background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white',   boxShadow: '0 10px 25px rgba(99,102,241,0.3)' };

  const bgImg = dark ? '/Images/VIT2.png' : '/Images/VIT1.jpg';

  /* Shared props bundles — avoids repeating prop lists */
  const loginProps = {
    onSubmit: handleLoginSubmit(onLogin),
    register: regLogin,
    errors: loginErrs,
    isSubmitting: isLoginSubmitting,
    showPass,
    setShowPass,
    inputBase,
    lightInputStyle,
    dark,
    btnStyle: loginBtnStyle,
  };

  const registerProps = {
    onSubmit: handleSignupSubmit(onRegister),
    register: regSignup,
    errors: regErrs,
    isSubmitting: isRegSubmitting,
    showPass: showRegPass,
    setShowPass: setShowRegPass,
    inputBase,
    lightInputStyle,
    dark,
    btnStyle: loginBtnStyle,
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: dark ? '#07070f' : '#f8faff' }}>

      {/* ── Background ── */}
      <div className="absolute inset-0 z-0">
        <img key={bgImg} src={bgImg} alt="Campus Background" className="w-full h-full object-cover mc-fade-in" />
        <div className="absolute inset-0" style={{
          background: dark
            ? 'linear-gradient(to right, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.75) 100%)'
            : 'linear-gradient(to right, rgba(255,255,255,0.65) 0%, rgba(238,242,255,0.4) 100%)',
          backdropFilter: 'blur(8px)',
        }} />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
        <button onClick={toggleTheme} className={`p-3 rounded-full border transition-all ${
          dark
            ? 'border-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/10 bg-[#07070f]/80'
            : 'border-indigo-200 text-indigo-500 hover:bg-indigo-50 bg-white/80 shadow-lg'
        }`}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE / TABLET  (< lg)  — Flat card layout
      ══════════════════════════════════════════════════════ */}
      {!isDesktop && (
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl ${
            dark ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020]' : 'bg-gradient-to-br from-indigo-500 to-violet-600'
          }`}>
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className={`text-xl font-bold ${dark ? '' : 'text-gray-900'}`}>
            {dark ? <span className="mc-gold-shimmer">My-Campus</span> : 'My-Campus'}
          </span>
        </div>

        {/* Card */}
        <div className={`w-full max-w-sm mx-auto rounded-[2rem] shadow-2xl overflow-hidden ${
          dark
            ? 'bg-[#0d0d1e]/95 border border-[#c9a84c]/15 backdrop-blur-xl'
            : 'bg-white/92 border border-white/80 backdrop-blur-[40px] shadow-[0_20px_80px_rgba(99,102,241,0.15)]'
        }`}>

          {/* Tab bar */}
          <div className={`flex p-1.5 m-4 rounded-2xl ${dark ? 'bg-white/5' : 'bg-indigo-50/80'}`}>
            {[['login', 'Sign In'], ['register', 'Register']].map(([view, label]) => (
              <button key={view} type="button" onClick={() => toggleView(view)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  (view === 'login' && !isFlipped) || (view === 'register' && isFlipped)
                    ? dark ? 'bg-[#c9a84c]/20 text-[#c9a84c] shadow-sm' : 'bg-white text-indigo-700 shadow-md'
                    : dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Form area — BOTH panels always mounted, toggled via CSS */}
          <div className="px-5 sm:px-7 pb-7">

            {/* Login panel */}
            <div className={!isFlipped ? 'block' : 'hidden'}>
              <h1 className={`text-2xl font-black mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Welcome back</h1>
              <p className={`text-sm mb-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your campus account</p>
              {loginErr && (
                <div className={`mb-4 p-3 rounded-2xl text-sm border font-medium ${dark ? 'bg-red-900/30 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {loginErr}
                </div>
              )}
              <LoginFormFields {...loginProps} />
              <div className="mt-5 text-center">
                <Link to="/" className={`text-sm font-medium transition-colors ${dark ? 'text-gray-500 hover:text-[#c9a84c]' : 'text-gray-400 hover:text-indigo-600'}`}>
                  ← Return to home
                </Link>
              </div>
            </div>

            {/* Register panel */}
            <div className={isFlipped ? 'block' : 'hidden'}>
              <h1 className={`text-2xl font-black mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Create account</h1>
              <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Join the VIT Bhopal campus platform</p>
              {regSuccess && <div className="mb-3 p-3 rounded-2xl text-sm border font-medium bg-emerald-500/20 border-emerald-500/40 text-emerald-500">Account created! Redirecting…</div>}
              {regErr && <div className="mb-3 p-3 rounded-2xl text-sm border font-medium bg-red-500/20 border-red-500/40 text-red-500">{regErr}</div>}
              <RegisterFormFields {...registerProps} />
            </div>

          </div>
        </div>
      </div>
      )}

      {/* ══════════════════════════════════════════════════════
          DESKTOP  (lg+)  — Original 3D circle layout
      ══════════════════════════════════════════════════════ */}
      {isDesktop && (
      <div className="relative z-10 w-full max-w-[1200px] flex flex-row items-center justify-center gap-12 p-12">

        {/* Left info panel */}
        <div className={`flex flex-col w-[380px] h-[600px] rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl ${dark ? 'dk-card border border-[#c9a84c]/20' : 'glass-card border-[1.5px] border-indigo-200/60'}`}>
          <div className="flex items-center gap-3 mb-10">
            <div className={`mc-glass-float w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl ${
              dark ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020]' : 'bg-gradient-to-br from-indigo-500 to-violet-600'
            }`} style={{ boxShadow: dark ? '0 8px 30px rgba(201,168,76,0.3)' : '0 8px 30px rgba(99,102,241,0.4)' }}>
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className={`text-2xl font-bold drop-shadow-lg ${dark ? '' : 'text-gray-900'}`}>
              {dark ? <span className="mc-gold-shimmer">My-Campus</span> : 'My-Campus'}
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className={`mc-fade-up text-4xl font-extrabold leading-[1.15] mb-4 tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
              {isFlipped
                ? <><span>Join your</span><br /><span className={dark ? 'mc-gold-shimmer' : 'mc-gradient-text'}>campus.</span></>
                : <><span>Welcome</span><br /><span className={dark ? 'mc-gold-shimmer' : 'mc-gradient-text'}>back.</span></>}
            </h2>
            <p className={`mc-fade-up mc-stagger-2 text-base leading-relaxed mb-8 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isFlipped
                ? 'Everything a VITian needs, unified in one premium platform.'
                : 'Notes, attendance, faculty cabin finder and CGPA calculator — all in one place.'}
            </p>
            <div className="flex flex-col gap-3">
              {FEATURES.map(({ icon: Icon, label, color }, i) => (
                <div key={label}
                  className={`mc-slide-bounce flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group border ${dark ? 'border-[#c9a84c]/10 bg-[#121220]/50 hover:bg-[#c9a84c]/5' : 'border-indigo-100/50 bg-white/40 hover:bg-white/80'}`}
                  style={{ animationDelay: `${i * 75}ms` }}>
                  <Icon size={18} className={`${color} group-hover:scale-110 transition-transform shrink-0`} />
                  <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — 3D rotating circle */}
        <div className="relative w-[640px] h-[640px] flex items-center justify-center" style={{ perspective: '2000px' }}>
          <div className="w-[640px] h-[640px] origin-center">
            <div className="w-full h-full relative" style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 1.4s cubic-bezier(0.68, -0.05, 0.27, 1.05)',
              transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            }}>

              {/* FRONT — Login */}
              <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center p-16"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
                <div className={`absolute inset-0 rounded-full overflow-hidden pointer-events-none ${dark ? 'dk-card border-2 border-[#c9a84c]/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)]' : 'bg-white/90 backdrop-blur-[40px] border-[2px] border-white/80 shadow-[0_30px_100px_rgba(255,255,255,0.7)]'}`} />
                <div className="absolute inset-4 rounded-full border border-dashed pointer-events-none opacity-30" style={{ borderColor: dark ? '#c9a84c' : '#6366f1' }} />
                <div className="w-[340px] text-center relative z-10">
                  <div className="mb-10">
                    <h1 className={`text-4xl font-black mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Sign in</h1>
                    <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      New here?{' '}
                      <button type="button" onClick={() => toggleView('register')} className={`font-semibold hover:underline transition-colors ${dark ? 'text-[#c9a84c] hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}>
                        Create an account
                      </button>
                    </p>
                  </div>
                  {loginErr && (
                    <div className={`mb-6 p-4 rounded-2xl text-sm border font-medium ${dark ? 'bg-red-900/30 border-red-800/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {loginErr}
                    </div>
                  )}
                  <LoginFormFields {...loginProps} />
                  <div className="mt-10">
                    <Link to="/" className={`text-sm font-medium transition-colors ${dark ? 'text-gray-500 hover:text-[#c9a84c]' : 'text-gray-400 hover:text-indigo-600'}`}>← Return to home</Link>
                  </div>
                </div>
              </div>

              {/* BACK — Register */}
              <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center p-16"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className={`absolute inset-0 rounded-full overflow-hidden pointer-events-none ${dark ? 'dk-card border-2 border-[#c9a84c]/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)]' : 'bg-white/90 backdrop-blur-[40px] border-[2px] border-white/80 shadow-[0_30px_100px_rgba(255,255,255,0.7)]'}`} />
                <div className="absolute inset-4 rounded-full border border-dashed pointer-events-none opacity-30" style={{ borderColor: dark ? '#c9a84c' : '#6366f1' }} />
                <div className="w-[380px] text-center relative z-10">
                  <div className="mb-6">
                    <h1 className={`text-3xl font-black mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
                    <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Already have one?{' '}
                      <button type="button" onClick={() => toggleView('login')} className={`font-semibold hover:underline transition-colors ${dark ? 'text-[#c9a84c] hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}>
                        Sign in
                      </button>
                    </p>
                  </div>
                  {regSuccess && <div className="mb-4 p-3 rounded-2xl text-sm border font-medium bg-emerald-500/20 border-emerald-500/40 text-emerald-500">Account created successfully!</div>}
                  {regErr && <div className="mb-4 p-3 rounded-2xl text-sm border font-medium bg-red-500/20 border-red-500/40 text-red-500">{regErr}</div>}
                  <RegisterFormFields {...registerProps} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
