import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  BookOpen, QrCode, DoorOpen, Calculator,
  ShieldCheck, Moon, Sun, ArrowRight, GraduationCap, Sparkles, MapPin,
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { useAuroraCanvas } from '../../components/common/AuroraCanvas';

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

/* ── Campus image cards (like the circular cards in reference) ── */
const CAMPUS_CARDS = [
  { img: '/Images/VIT2.png',    label: 'VIT Bhopal',       sub: 'Main Campus — Night',    delay: '0s' },
  { img: '/Images/VIT1.jpg',    label: 'Academic Block',   sub: 'VIT Bhopal Campus',      delay: '0.3s' },
  { img: '/Images/images.jpg',  label: 'VIT Gate',         sub: 'VIT Bhopal University',  delay: '0.6s' },
];

const features = [
  { icon: BookOpen,      title: 'Notes Sharing',       desc: 'Upload and browse notes from peers across departments.',          color: 'from-indigo-500 to-blue-600' },
  { icon: QrCode,        title: 'QR Attendance',        desc: 'Anti-proxy QR scan with time limit — no more proxy attendance.', color: 'from-violet-500 to-purple-600' },
  { icon: DoorOpen,      title: 'Faculty Cabin Finder', desc: 'Check which professors are in their cabin right now.',           color: 'from-sky-400 to-cyan-600' },
  { icon: Calculator,    title: 'CGPA Calculator',      desc: 'Enter semester grades and get GPA/CGPA instantly.',              color: 'from-emerald-500 to-teal-600' },
  { icon: ShieldCheck,   title: 'Admin Dashboard',      desc: 'Full platform moderation — users, notes, complaints.',          color: 'from-rose-500 to-red-600' },
  { icon: GraduationCap, title: 'Built for VIT',        desc: 'Designed specifically for VIT Bhopal students and faculty.',    color: 'from-amber-500 to-orange-600' },
];

const typeWords = ['campus life.', 'your grades.', 'your attendance.', 'your notes.'];
const HERO_LINES = ['MY', 'CAMPUS'];

/* ─────────────────────────────────────────────────
   Particle Canvas Hook
───────────────────────────────────────────────── */
export function useParticleCanvas(canvasRef, isDark, lines) {
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
    const clr = isDark ? { r: 201, g: 168, b: 76 } : { r: 99, g: 102, b: 241 };

    class Particle {
      constructor(x, y) {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.targetX = x; this.targetY = y;
        this.size = Math.random() * 1.6 + 0.7;
        this.density = Math.random() * 20 + 5;
        this.alpha = Math.random() * 0.35 + 0.65;
      }
      update() {
        if (mouse.x !== null) {
          const dx = mouse.x - this.x, dy = mouse.y - this.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_RADIUS) {
            const d = Math.sqrt(d2) || 1, f = (MOUSE_RADIUS - d2) / MOUSE_RADIUS;
            this.x -= (dx / d) * f * this.density; this.y -= (dy / d) * f * this.density; return;
          }
        }
        this.x += (this.targetX - this.x) * EASE; this.y += (this.targetY - this.y) * EASE;
      }
      draw() {
        ctx.fillStyle = `rgba(${clr.r},${clr.g},${clr.b},${this.alpha.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const buildParticles = (W, H) => {
      particles = [];
      const fontSize = W < 480 ? W * 0.17 : W < 768 ? W * 0.14 : W * 0.115;
      const lineHeight = fontSize * 1.1;
      const totalH = lines.length * lineHeight;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = `rgba(${clr.r},${clr.g},${clr.b},1)`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `900 ${fontSize}px 'Inter', system-ui, sans-serif`;
      const startY = (H - totalH) / 2 + lineHeight / 2;
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, startY + i * lineHeight));
      const img = ctx.getImageData(0, 0, W, H); ctx.clearRect(0, 0, W, H);
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

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = Math.round(width); canvas.height = Math.round(height);
          document.fonts.ready.then(() => buildParticles(canvas.width, canvas.height));
        }
      }
    });
    ro.observe(canvas);
    animate();

    return () => {
      cancelAnimationFrame(animId); ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, isDark, linesKey]);
}

/* ─────────────────────────────────────────────────
   Landing Page
───────────────────────────────────────────────── */
export default function Landing() {
  const { dark, toggleTheme, initTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const typed      = useTypewriter(typeWords);
  const canvasRef  = useRef(null);
  const bgCanvasRef = useRef(null);

  useParticleCanvas(canvasRef, dark, HERO_LINES);
  useAuroraCanvas(bgCanvasRef, dark, { density: 14000, maxAlpha: 0.25 });

  useEffect(() => {
    initTheme();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    setTimeout(() => setImgLoaded(true), 100);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Hero background image state ── */
  const defaultBg = dark ? '/Images/VIT2.png' : '/Images/VIT1.jpg';
  const [heroBg, setHeroBg] = useState(defaultBg);
  
  // Reset when theme changes if they haven't explicitly picked one, or just keep it simple
  useEffect(() => {
    setHeroBg(dark ? '/Images/VIT2.png' : '/Images/VIT1.jpg');
  }, [dark]);

  return (
    <div className={`min-h-screen text-gray-900 dark:text-white overflow-hidden`}
      style={{ background: dark ? '#07070f' : '#eef2ff' }}>

      {/* Aurora canvas — fixed bg layer */}
      <canvas
        ref={bgCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0, opacity: dark ? 0.8 : 0.5 }}
      />

      {/* ════════════════════════════════════════════
          HERO — Full-bleed image background
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <img
            key={heroBg} // Force re-render for transition
            src={heroBg}
            alt="VIT Bhopal Campus"
            className={`hero-img w-full h-full object-cover transition-opacity duration-1000 opacity-100`}
          />
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0" style={{
            background: dark
              ? 'linear-gradient(135deg, rgba(7,7,15,0.88) 0%, rgba(7,7,15,0.60) 40%, rgba(7,7,15,0.30) 70%, rgba(7,7,15,0.50) 100%)'
              : 'linear-gradient(135deg, rgba(238,242,255,0.92) 0%, rgba(220,225,255,0.70) 40%, rgba(200,210,255,0.30) 65%, rgba(220,230,255,0.55) 100%)',
          }} />
        </div>

        {/* ── Sticky Navbar ── */}
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? dark
              ? 'bg-[#07070f]/80 backdrop-blur-xl border-b border-[#c9a84c]/12 shadow-xl shadow-black/40'
              : 'bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-lg shadow-indigo-500/10'
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className={`mc-glass-float w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                dark
                  ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] shadow-[#c9a84c]/40'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/40'
              }`}>
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className={`text-lg font-bold tracking-tight drop-shadow-lg ${
                dark ? 'text-[#c9a84c]' : 'text-white'
              }`}>My-Campus</span>
            </div>

            {/* Nav right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all active:scale-90 backdrop-blur-sm ${
                  dark
                    ? 'text-[#c9a84c] hover:bg-[#c9a84c]/15 border border-[#c9a84c]/25'
                    : 'text-white hover:bg-white/20 border border-white/30'
                }`}>
                {dark ? <Sun size={18} className="mc-heartbeat" /> : <Moon size={18} />}
              </button>

              <Link to="/login" className={`hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border backdrop-blur-sm transition-all ${
                dark
                  ? 'text-[#c9a84c]/80 border-[#c9a84c]/25 hover:bg-[#c9a84c]/10 hover:text-[#c9a84c]'
                  : 'text-white border-white/35 hover:bg-white/20'
              }`}>Sign In</Link>

              <Link to="/register" className={`mc-btn inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl backdrop-blur-sm transition-all shadow-lg ${
                dark
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] shadow-[#c9a84c]/30'
                  : 'bg-white/25 border border-white/50 text-white hover:bg-white/35 shadow-white/20'
              }`}>
                Get Started <ArrowRight size={14} className="mc-nudge" />
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero Content — Two Column Layout ── */}
        <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between py-12 lg:py-0 gap-12 lg:gap-0" style={{ minHeight: 'calc(100vh - 64px)' }}>

          {/* LEFT — Text + Particle canvas + CTAs */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">

            {/* Badge */}
            <div className={`mc-bounce-drop inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border w-fit mb-6 backdrop-blur-sm ${
              dark
                ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30 text-[#c9a84c]'
                : 'bg-white/25 border-white/40 text-white'
            }`}>
              <Sparkles size={10} className="mc-heartbeat" />
              VIT Bhopal University · Campus Platform
            </div>

            {/* Particle canvas — "MY CAMPUS" text */}
            <div className="relative w-full mb-4" style={{ height: '220px' }}>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" style={{ cursor: 'none' }} />
            </div>

            {/* Typewriter subtitle */}
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-lg ${dark ? 'text-white' : 'text-white'}`}>
              Everything for your{' '}
              <span className={dark ? 'mc-gold-shimmer' : ''} style={!dark ? {
                background: 'linear-gradient(90deg,#ffffff,#c7d2fe,#a5b4fc,#ffffff)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 3s linear infinite',
              } : {}}>{typed}<span className="mc-caret" /></span>
            </h1>

            <p className={`text-base sm:text-lg leading-relaxed mb-8 max-w-md drop-shadow ${
              dark ? 'text-gray-300' : 'text-white/85'
            }`}>
              Notes sharing, anti-proxy QR attendance, faculty cabin finder,
              CGPA calculator — all in one place, built for VITians.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className={`mc-btn mc-liquid-hover inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold rounded-2xl shadow-2xl transition-all hover:-translate-y-1 ${
                dark
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] shadow-[#c9a84c]/35 mc-glow-gold'
                  : 'bg-white text-indigo-700 shadow-white/30 hover:shadow-white/50'
              }`}>
                Join My-Campus <ArrowRight size={18} className="mc-nudge" />
              </Link>

              <Link to="/login" className={`mc-btn inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-2xl backdrop-blur-md border transition-all hover:-translate-y-0.5 ${
                dark
                  ? 'border-[#c9a84c]/30 text-[#c9a84c]/90 hover:bg-[#c9a84c]/8 hover:border-[#c9a84c]/50'
                  : 'border-white/40 text-white hover:bg-white/20'
              }`}>
                Sign In
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-10 flex gap-6 sm:gap-10">
              {[{ val: '5+', label: 'Features' }, { val: '3', label: 'User Roles' }, { val: '1', label: 'Campus Admin' }].map(({ val, label }) => (
                <div key={label} className="group">
                  <div className={`text-2xl font-bold drop-shadow ${dark ? 'text-[#c9a84c]' : 'text-white'}`}>{val}</div>
                  <div className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-white/70'}`}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Floating campus image cards (like reference circular cards) */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 relative hidden lg:flex flex-col gap-4 items-end pr-4">
            {CAMPUS_CARDS.map(({ img, label, sub, delay }, i) => (
              <div
                key={label}
                onClick={() => setHeroBg(img)}
                className={`mc-glass-float group relative overflow-hidden cursor-pointer w-full transition-transform active:scale-95`}
                style={{
                  animationDelay: delay,
                  animationDuration: `${4 + i * 1.5}s`,
                  borderRadius: i === 1 ? '50%' : '20px',
                  width: i === 1 ? '200px' : i === 0 ? '340px' : '280px',
                  height: i === 1 ? '200px' : '160px',
                  alignSelf: i === 0 ? 'flex-end' : i === 1 ? 'center' : 'flex-start',
                  border: dark ? '2px solid rgba(201,168,76,0.35)' : '2px solid rgba(255,255,255,0.50)',
                  boxShadow: dark
                    ? `0 20px 60px rgba(0,0,0,0.70), 0 0 30px rgba(201,168,76,0.15), inset 0 1px 0 rgba(255,255,255,0.06)`
                    : `0 20px 60px rgba(99,102,241,0.25), 0 0 30px rgba(255,255,255,0.20), inset 0 1px 0 rgba(255,255,255,0.60)`,
                }}
              >
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Glass label overlay */}
                <div className="absolute inset-x-0 bottom-0 px-3 py-2"
                  style={{
                    background: dark
                      ? 'linear-gradient(to top, rgba(7,7,15,0.88) 0%, transparent 100%)'
                      : 'linear-gradient(to top, rgba(30,40,100,0.70) 0%, transparent 100%)',
                  }}>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={10} className={dark ? 'text-[#c9a84c]' : 'text-white'} />
                    <p className={`text-xs font-bold ${dark ? 'text-[#c9a84c]' : 'text-white'}`}>{label}</p>
                  </div>
                  <p className={`text-[10px] ${dark ? 'text-gray-400' : 'text-white/70'}`}>{sub}</p>
                </div>

                {/* Glass shimmer overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: dark
                    ? 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.30) 0%, transparent 60%)',
                }} />
              </div>
            ))}

            {/* Decorative floating dot */}
            <div className="mc-drift absolute -top-6 -left-4 w-3 h-3 rounded-full"
              style={{ background: dark ? 'rgba(201,168,76,0.50)' : 'rgba(255,255,255,0.60)', animationDuration: '7s' }} />
            <div className="mc-drift absolute bottom-8 -right-2 w-2 h-2 rounded-full"
              style={{ background: dark ? 'rgba(201,168,76,0.35)' : 'rgba(200,210,255,0.70)', animationDuration: '9s', animationDelay: '2s' }} />
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{
          background: dark
            ? 'linear-gradient(to bottom, transparent, rgba(7,7,15,0.9))'
            : 'linear-gradient(to bottom, transparent, rgba(238,242,255,0.9))',
        }} />
      </section>

      {/* ── Footer ── */}
      <footer className={`absolute bottom-0 w-full z-10 border-t py-6 px-6 backdrop-blur-md ${dark ? 'border-[#c9a84c]/20 bg-[#07070f]/80' : 'border-indigo-200/40 bg-white/60'}`}>
        <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              dark ? 'bg-gradient-to-br from-[#c9a84c] to-[#a87c30]' : 'bg-indigo-600'
            }`}>
              <GraduationCap size={12} className="text-white" />
            </div>
            <span className={`font-semibold ${dark ? 'text-[#c9a84c]' : 'text-gray-800'}`}>My-Campus</span>
          </div>
          <p>© Shivakant Kurmi 2026 · VIT Bhopal</p>
          <div className="flex gap-4">
            <Link to="/login"    className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>Sign In</Link>
            <Link to="/register" className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
