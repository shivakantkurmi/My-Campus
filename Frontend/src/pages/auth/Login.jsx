import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, BookOpen, QrCode, DoorOpen, Calculator } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

const schema = yup.object({
  email:    yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required('Password required'),
});

const FEATURES = [
  { icon: BookOpen,   label: 'Notes Sharing',  color: 'text-indigo-500 dark:text-indigo-400' },
  { icon: QrCode,     label: 'QR Attendance',  color: 'text-violet-500 dark:text-violet-400' },
  { icon: DoorOpen,   label: 'Faculty Finder', color: 'text-cyan-500 dark:text-cyan-400'     },
  { icon: Calculator, label: 'CGPA Calc',      color: 'text-pink-500 dark:text-pink-400'     },
];

/* ─────────────────────────────────────────────────────────────────
   Aurora Constellation — exported so Landing.jsx can also use it
   isDark  → brightness of particles flips for light vs dark panels
   density → particle count (higher = fewer particles)
   maxAlpha→ cap for particle alpha (use <0.4 for bg-only mode)
──────────────────────────────────────────────────────────────── */
export function useAuroraCanvas(canvasRef, isDark, { density = 6500, maxAlpha = 0.78 } = {}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, t = 0;
    const mouse = { x: -9999, y: -9999 };
    let particles = [];

    /* Particle lightness depends on whether the panel is dark or light */
    const litRange  = isDark ? [55, 76] : [22, 45];   // dark bg→bright; light bg→dark
    const satRange  = isDark ? [70, 92] : [78, 98];
    const aRange    = isDark ? [0.28, 0.52] : [0.30, 0.55];

    const HUE_PALETTE = [240, 258, 275, 295, 312, 195, 210]; // indigo→violet→pink→cyan

    const makeParticles = (W, H) => {
      const count = Math.min(Math.floor((W * H) / density), 100);
      particles = Array.from({ length: count }, () => {
        const hue = HUE_PALETTE[Math.floor(Math.random() * HUE_PALETTE.length)]
                  + (Math.random() - 0.5) * 18;
        const p = {
          bx: Math.random() * W, by: Math.random() * H,
          x: 0, y: 0,
          vx: (Math.random() - 0.5) * 0.30,
          vy: (Math.random() - 0.5) * 0.30,
          size:   Math.random() * 2.0 + 0.6,
          hue,
          sat:  Math.random() * (satRange[1] - satRange[0]) + satRange[0],
          lit:  Math.random() * (litRange[1] - litRange[0]) + litRange[0],
          alpha: Math.min(maxAlpha, Math.random() * (aRange[1] - aRange[0]) + aRange[0]),
          phase:  Math.random() * Math.PI * 2,
          orbitR: Math.random() * 22 + 8,
          spd:    Math.random() * 0.009 + 0.004,
        };
        p.x = p.bx; p.y = p.by;
        return p;
      });
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;

      const rect = canvas.getBoundingClientRect();
      const lx = mouse.x - rect.left;
      const ly = mouse.y - rect.top;

      /* Update */
      particles.forEach(p => {
        p.x = p.bx + Math.cos(p.phase + t * p.spd) * p.orbitR;
        p.y = p.by + Math.sin(p.phase * 1.37 + t * p.spd * 0.78) * p.orbitR * 0.52;
        p.bx += p.vx; p.by += p.vy;
        if (p.bx < -70) p.bx = W + 70; if (p.bx > W + 70) p.bx = -70;
        if (p.by < -70) p.by = H + 70; if (p.by > H + 70) p.by = -70;
        const mdx = lx - p.x, mdy = ly - p.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 12000) {
          const md = Math.sqrt(md2) || 1;
          const f  = (12000 - md2) / 12000 * 3.8;
          p.bx -= (mdx / md) * f; p.by -= (mdy / md) * f;
        }
      });

      /* Connections */
      const CONN = 120;
      const lineAlpha = isDark ? 0.20 : 0.18;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN) {
            const a = (1 - d / CONN) * lineAlpha;
            const hMid = (particles[i].hue + particles[j].hue) / 2;
            ctx.strokeStyle = `hsla(${hMid},80%,${isDark ? 68 : 38}%,${a.toFixed(3)})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      /* Particles */
      particles.forEach(({ x, y, size, hue, sat, lit, alpha }) => {
        const base = `hsla(${hue},${sat}%,${lit}%,`;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
        grd.addColorStop(0,   `${base}${(alpha * 0.65).toFixed(3)})`);
        grd.addColorStop(0.5, `${base}${(alpha * 0.18).toFixed(3)})`);
        grd.addColorStop(1,   `${base}0)`);
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, size * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `${base}${Math.min(1, alpha + 0.40).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width  = Math.round(width);
          canvas.height = Math.round(height);
          makeParticles(canvas.width, canvas.height);
        }
      }
    });
    ro.observe(canvas);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
    };
  }, [canvasRef, isDark, density, maxAlpha]);
}

/* ─────────────────────────────────────────────────────────────────
   Login Page
──────────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverErr, setServerErr] = useState('');
  const [showPass,  setShowPass]  = useState(false);

  const { dark, initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  const canvasRef = useRef(null);
  /* Re-runs automatically when `dark` changes → particles re-tint */
  useAuroraCanvas(canvasRef, dark);

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

  /* ── Derived panel classes (theme-aware) ── */
  const panelBg     = dark ? 'bg-gray-950'  : 'bg-white';
  const panelBorder = dark ? 'border-white/8' : 'border-black/8';
  const headingCls  = dark ? 'text-white'    : 'text-gray-900';
  const subCls      = dark ? 'text-gray-400' : 'text-gray-500';
  const chipBg      = dark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-black/4 border-black/8 hover:bg-black/7 hover:border-black/14';
  const chipText    = dark ? 'text-gray-300'  : 'text-gray-700';
  const dotGrid     = dark
    ? 'radial-gradient(circle, rgba(165,180,252,0.12) 1px, transparent 1px)'
    : 'radial-gradient(circle, rgba(99,102,241,0.16) 1px, transparent 1px)';
  const vignette    = dark
    ? 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 20%, rgba(3,7,18,0.55) 100%)'
    : 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 20%, rgba(255,255,255,0.52) 100%)';
  const badgeBg     = dark ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300' : 'bg-indigo-100 border-indigo-300/60 text-indigo-700';
  const pingColor   = dark ? 'bg-indigo-400'  : 'bg-indigo-600';
  const statLbl     = dark ? 'text-gray-500'  : 'text-gray-400';
  const statVal     = dark ? 'text-indigo-400' : 'text-indigo-600';
  const logoText    = dark ? 'text-white' : 'text-gray-900';
  const logoBg      = 'bg-indigo-600';
  const bottomBorder = dark ? 'border-white/8' : 'border-black/8';

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">

      {/* ════════════════════════════════════════════
          LEFT PANEL — theme-reactive aurora branding
      ════════════════════════════════════════════ */}
      <div className={`hidden lg:flex lg:w-[48%] flex-col relative overflow-hidden transition-colors duration-500 ${panelBg}`}>

        {/* Aurora canvas — absolute bg */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ display: 'block' }} />

        {/* Radial vignette softens canvas at edges */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: vignette }} />

        {/* Dot grid accent */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: dotGrid,
          backgroundSize: '30px 30px',
        }} />

        {/* Right-edge fade into form panel */}
        <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{
          background: dark
            ? 'linear-gradient(to right, transparent, rgba(3,7,18,0.45))'
            : 'linear-gradient(to right, transparent, rgba(255,255,255,0.50))',
        }} />

        {/* ── All content above canvas layers ── */}
        <div className="relative z-10 flex flex-col h-full p-12">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`mc-float w-10 h-10 rounded-xl ${logoBg} flex items-center justify-center shadow-lg shadow-indigo-500/40`} style={{ animationDuration: '3.5s' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${logoText}`}>My-Campus</span>
          </div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center">

            {/* Live badge */}
            <div className={`mc-bounce-drop inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold w-fit mb-8 select-none ${badgeBg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${pingColor}`} />
              </span>
              VIT Bhopal · Campus Platform
            </div>

            <h2 className={`mc-fade-up text-4xl xl:text-[2.75rem] font-extrabold leading-[1.15] mb-5 tracking-tight ${headingCls}`}>
              Welcome back<br />
              <span className="mc-gradient-text">to campus life.</span>
            </h2>

            <p className={`mc-fade-up mc-stagger-2 text-base leading-relaxed mb-10 max-w-[320px] ${subCls}`}>
              Notes, attendance, faculty cabin finder and CGPA calculator — all in one place.
            </p>

            {/* Feature chips */}
            <div className="grid grid-cols-2 gap-2.5">
              {FEATURES.map(({ icon: Icon, label, color }, i) => (
                <div key={label}
                  className={`mc-flip-up flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-default group ${chipBg}`}
                  style={{ animationDelay: `${i * 75}ms` }}>
                  <Icon size={15} className={`${color} group-hover:scale-110 transition-transform shrink-0`} />
                  <span className={`text-sm font-medium ${chipText}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bottom bar */}
          <div className={`flex items-center gap-8 pt-8 border-t ${bottomBorder}`}>
            {[{ val: '5+', label: 'Features' }, { val: '3', label: 'Roles' }, { val: '1', label: 'Campus' }].map(({ val, label }) => (
              <div key={label}>
                <div className={`text-lg font-bold ${statVal}`}>{val}</div>
                <div className={`text-xs mt-0.5 ${statLbl}`}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT PANEL — Sign in form
      ════════════════════════════════════════════ */}
      <div className="mc-fade-left flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white dark:bg-gray-950">

        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">My-Campus</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="mc-rubber-in text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Sign in</h1>
            <p className="mc-fade-up mc-stagger-2 text-sm text-gray-500 dark:text-gray-400">
              New here?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Create an account</Link>
            </p>
          </div>

          {serverErr && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <span>⚠️</span><span>{serverErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('email')} type="email" placeholder="you@vitbhopal.ac.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all" />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="mc-btn w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 mc-glow-border hover:-translate-y-0.5 transition-all active:scale-95">
              {isSubmitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight size={16} className="mc-nudge" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link to="/" className="text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
