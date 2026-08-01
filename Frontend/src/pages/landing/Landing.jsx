import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  BookOpen, QrCode, DoorOpen, Calculator,
  ShieldCheck, Moon, Sun, ArrowRight, GraduationCap, Sparkles,
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { useAuroraCanvas } from '../auth/Login';

/* ── Mini typewriter hook ── */
function useTypewriter(words, speed = 90, pause = 1600) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx]   = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur   = words[wordIdx];
    const delay = deleting ? speed / 2 : speed;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < cur.length) {
        setDisplayed(cur.slice(0, charIdx + 1)); setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === cur.length) {
        setTimeout(() => setDeleting(true), pause);
      } else if (deleting && charIdx > 0) {
        setDisplayed(cur.slice(0, charIdx - 1)); setCharIdx(c => c - 1);
      } else {
        setDeleting(false); setWordIdx(i => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return displayed;
}

const features = [
  { icon: BookOpen,     title: 'Notes Sharing',       desc: 'Upload and browse notes from peers across departments. Download in one tap.',                     color: 'bg-indigo-500/10 text-indigo-500' },
  { icon: QrCode,       title: 'QR Attendance',        desc: 'Faculty generate a time-limited QR; students scan to mark themselves present — no proxies.',     color: 'bg-violet-500/10 text-violet-500' },
  { icon: DoorOpen,     title: 'Faculty Cabin Finder', desc: 'Check which professors are in their cabin right now before making the trip.',                     color: 'bg-sky-500/10 text-sky-500' },
  { icon: Calculator,   title: 'CGPA Calculator',      desc: 'Enter your semester grades and get a pinpoint GPA/CGPA calculation instantly.',                  color: 'bg-emerald-500/10 text-emerald-500' },
  { icon: ShieldCheck,  title: 'Admin Dashboard',      desc: 'One admin manages the entire platform — user moderation, notes oversight, complaints.',          color: 'bg-rose-500/10 text-rose-500' },
  { icon: GraduationCap,title: 'Built for VIT',        desc: 'Designed specifically for VIT Bhopal students and faculty. Log in with your campus credentials.',color: 'bg-amber-500/10 text-amber-500' },
];

const typeWords = ['campus life.', 'your grades.', 'your attendance.', 'your notes.'];

/*
  ─────────────────────────────────────────────────
  KEY FIX: lines arrays live OUTSIDE the component
  so their reference is stable across re-renders.
  This prevents the useEffect from re-running on
  every typewriter tick (every 90 ms).
  ─────────────────────────────────────────────────
*/
const HERO_LINES = ['MY', 'CAMPUS'];

/* ─────────────────────────────────────────────────
   Shared Particle Text Convergence Hook
   • Uses ResizeObserver (works inside flex panels)
   • Waits for fonts.ready before sampling pixels
   • Stable cleanup on unmount
───────────────────────────────────────────────── */
export function useParticleCanvas(canvasRef, isDark, lines) {
  // Serialize lines so the dep array comparison is by VALUE, not reference
  const linesKey = lines.join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animId;
    let particles = [];
    const mouse = { x: null, y: null };

    const PARTICLE_GAP = 3;
    const EASE         = 0.055;
    const MOUSE_RADIUS = 5000;

    const clr = isDark
      ? { r: 165, g: 180, b: 252 }  // indigo-300
      : { r: 99,  g: 102, b: 241 }; // indigo-500

    class Particle {
      constructor(x, y) {
        this.x       = Math.random() * canvas.width;
        this.y       = Math.random() * canvas.height;
        this.targetX = x;
        this.targetY = y;
        this.size    = Math.random() * 1.6 + 0.7;
        this.density = Math.random() * 20 + 5;
        this.alpha   = Math.random() * 0.35 + 0.65;
      }
      update() {
        if (mouse.x !== null) {
          const dx = mouse.x - this.x, dy = mouse.y - this.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const f = (MOUSE_RADIUS - d2) / MOUSE_RADIUS;
            this.x -= (dx / d) * f * this.density;
            this.y -= (dy / d) * f * this.density;
            return;
          }
        }
        this.x += (this.targetX - this.x) * EASE;
        this.y += (this.targetY - this.y) * EASE;
      }
      draw() {
        ctx.fillStyle = `rgba(${clr.r},${clr.g},${clr.b},${this.alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const buildParticles = (W, H) => {
      particles = [];
      const fontSize   = W < 480 ? W * 0.17 : W < 768 ? W * 0.14 : W * 0.115;
      const lineHeight = fontSize * 1.1;
      const totalH     = lines.length * lineHeight;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle    = `rgba(${clr.r},${clr.g},${clr.b},1)`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = `900 ${fontSize}px 'Inter', system-ui, sans-serif`;

      const startY = (H - totalH) / 2 + lineHeight / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, startY + i * lineHeight));

      const img = ctx.getImageData(0, 0, W, H);
      ctx.clearRect(0, 0, W, H);

      for (let y = 0; y < img.height; y += PARTICLE_GAP)
        for (let x = 0; x < img.width; x += PARTICLE_GAP)
          if (img.data[(y * 4 * img.width) + (x * 4) + 3] > 128)
            particles.push(new Particle(x, y));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) { p.update(); p.draw(); }
      animId = requestAnimationFrame(animate);
    };

    const onMove  = (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = ()  => { mouse.x = null; mouse.y = null; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    // ResizeObserver fires with real layout size (unlike offsetWidth at mount time)
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width > 0 && height > 0) {
          canvas.width  = Math.round(width);
          canvas.height = Math.round(height);
          // Wait for Inter font to load before pixel-sampling the text
          document.fonts.ready.then(() => buildParticles(canvas.width, canvas.height));
        }
      }
    });
    ro.observe(canvas);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, isDark, linesKey]); // linesKey = serialized string, stable across renders
}

/* ─────────────────────────────────────────────────
   Landing Page
───────────────────────────────────────────────── */
export default function Landing() {
  const { dark, toggleTheme, initTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const typed      = useTypewriter(typeWords);
  const canvasRef  = useRef(null);
  const bgCanvasRef = useRef(null);

  // HERO_LINES is a module-level const → stable reference → no loop!
  useParticleCanvas(canvasRef, dark, HERO_LINES);

  // Full-page aurora background — sparse & very low alpha so content stays readable
  useAuroraCanvas(bgCanvasRef, dark, { density: 14000, maxAlpha: 0.30 });

  useEffect(() => {
    initTheme();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ── Full-page aurora constellation background ── */}
      <canvas
        ref={bgCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ display: 'block', zIndex: 0, opacity: dark ? 1 : 0.7 }}
      />

      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">My-Campus</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme">
              {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          HERO — three stacked zones, zero overlap
          Zone 1: Badge pill (own row, above canvas)
          Zone 2: Particle canvas 420px
          Zone 3: Typewriter + CTA + stats
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">

        {/* 1 – Badge — entirely above canvas zone */}
        <div className="flex justify-center pt-10 pb-4">
          <span className="mc-bounce-drop mc-stagger-1 inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Sparkles size={11} className="mc-heartbeat" />
            VIT Bhopal Campus Platform
          </span>
        </div>

        {/* 2 – Particle canvas zone — nothing else inside */}
        <div className="relative w-full" style={{ height: '420px' }}>
          <div className="mc-drift absolute top-4  left-[12%]  w-2   h-2   rounded-full bg-indigo-400/40 pointer-events-none" style={{ animationDuration: '7s' }} />
          <div className="mc-drift absolute top-10 right-[14%] w-1.5 h-1.5 rounded-full bg-violet-400/40 pointer-events-none" style={{ animationDuration: '9s',  animationDelay: '1.5s' }} />
          <div className="mc-drift absolute bottom-6 left-[30%] w-2  h-2   rounded-full bg-sky-400/30    pointer-events-none" style={{ animationDuration: '11s', animationDelay: '0.7s' }} />

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" style={{ cursor: 'none' }} />

          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{
            background: dark
              ? 'linear-gradient(to bottom, transparent, rgb(3,7,18))'
              : 'linear-gradient(to bottom, transparent, rgb(255,255,255))',
          }} />
        </div>

        {/* 3 – Content — sits below canvas, normal flow */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-24 text-center">
          <h1 className="mc-fade-up mc-stagger-2 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Everything your<br />
            <span className="mc-gradient-text">{typed}<span className="mc-caret" /></span>
          </h1>
          <p className="mc-fade-up mc-stagger-3 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Notes sharing, anti-proxy QR attendance, faculty cabin finder,
            CGPA calculator — all in one place, built for VITians.
          </p>
          <div className="mc-fade-up mc-stagger-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="mc-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 mc-glow-border hover:-translate-y-1 transition-all duration-200">
              Join My-Campus <ArrowRight size={18} className="mc-nudge" />
            </Link>
            <Link to="/login" className="mc-btn inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
          <div className="mc-fade-up mc-stagger-5 mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            {[{ val: '5+', label: 'Core Features' }, { val: '3', label: 'User Roles' }, { val: '1', label: 'Campus Admin' }].map(({ val, label }, i) => (
              <div key={label} className="group" style={{ animationDelay: `${i * 0.4}s` }}>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">{val}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">What's inside</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Everything you need to navigate campus life, in one clean dashboard.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={title} className="mc-flip-up group p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:-translate-y-2 mc-card-hover transition-all duration-300 cursor-pointer" style={{ animationDelay: `${80 + i * 90}ms` }}>
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${color} group-hover:scale-115 group-hover:-translate-y-1 transition-all duration-300`}>
                <Icon size={22} />
              </div>
              <h3 className="text-base font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="mc-scale-in relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 to-violet-700 p-10 sm:p-14 text-center">
          <div className="mc-blob absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="mc-blob absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" style={{ animationDelay: '3s' }} />
          <div className="relative">
            <h2 className="mc-rubber-in text-3xl sm:text-4xl font-bold text-white mb-3">Ready to get started?</h2>
            <p className="mc-fade-up mc-stagger-2 text-indigo-200 mb-8 text-lg">Create your account in under a minute.</p>
            <Link to="/register" className="mc-btn mc-pop-in mc-stagger-3 inline-flex items-center gap-2 px-8 py-3 text-base font-semibold bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Create Free Account <ArrowRight size={18} className="mc-nudge" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center"><GraduationCap size={13} className="text-white" /></div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">My-Campus</span>
          </div>
          <p>©Shivaknt Kurmi 2026 My-Campus · VIT Bhopal</p>
          <div className="flex gap-4">
            <Link to="/login"    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
