import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  BookOpen, QrCode, DoorOpen, Calculator,
  ShieldCheck, Moon, Sun, ArrowRight, GraduationCap, Sparkles, MapPin,
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import { useAuroraCanvas } from '../../components/common/AuroraCanvas';

/* ── Mini typewriter hook ── */
function useTypewriter(words, speed = 90, pause = 1600) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = words[wordIdx];
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
  { img: '/Images/VIT2.png', label: 'VIT Bhopal', sub: 'Main Campus — Night', delay: '0s' },
  { img: '/Images/VIT1.jpg', label: 'Academic Block', sub: 'VIT Bhopal Campus', delay: '0.3s' },
  { img: '/Images/images.jpg', label: 'VIT Gate', sub: 'VIT Bhopal University', delay: '0.6s' },
];

const features = [
  { icon: BookOpen, title: 'Notes Sharing', desc: 'Upload and browse notes from peers across departments.', color: 'from-indigo-500 to-indigo-600' },
  { icon: QrCode, title: 'QR Attendance', desc: 'Anti-proxy QR scan with time limit — no more proxy attendance.', color: 'from-violet-500 to-purple-600' },
  { icon: DoorOpen, title: 'Faculty Cabin Finder', desc: 'Check which professors are in their cabin right now.', color: 'from-sky-400 to-cyan-600' },
  { icon: Calculator, title: 'CGPA Calculator', desc: 'Enter semester grades and get GPA/CGPA instantly.', color: 'from-emerald-500 to-teal-600' },
  { icon: ShieldCheck, title: 'Admin Dashboard', desc: 'Full platform moderation — users, notes, complaints.', color: 'from-rose-500 to-red-600' },
  { icon: GraduationCap, title: 'Built for VIT', desc: 'Designed specifically for VIT Bhopal students and faculty.', color: 'from-amber-500 to-orange-600' },
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
    const EASE = 0.055;
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

    const onMove = (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = null; mouse.y = null; };
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
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const typed = useTypewriter(typeWords);
  const canvasRef = useRef(null);
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
    <div className={`min-h-screen text-gray-900 dark:text-white overflow-x-hidden`}
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
      <section className="relative h-screen flex flex-col overflow-hidden">

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
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? dark
            ? 'bg-[#07070f]/80 backdrop-blur-xl border-b border-[#c9a84c]/12 shadow-xl shadow-black/40'
            : 'bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-lg shadow-indigo-500/10'
          : 'bg-transparent'
          }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className={`mc-glass-float w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${dark
                ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] shadow-[#c9a84c]/40'
                : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/40'
                }`}>
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className={`text-xl font-bold tracking-tight drop-shadow-md transition-colors ${dark ? 'text-[#c9a84c]' : 'text-gray-900'
                }`}>My-Campus</span>
            </div>

            {/* Nav right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={toggleTheme}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${dark
                  ? 'text-gray-300 hover:text-white hover:bg-[#c9a84c]/10'
                  : 'text-gray-800 hover:bg-white/40 border border-indigo-200/50'
                  }`}>
                {dark ? <Sun size={18} className="mc-heartbeat" /> : <Moon size={18} />}
              </button>

              {user ? (
                <Link to="/dashboard" className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${dark
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]'
                  }`}>
                  Dashboard <ArrowRight size={14} className="mc-nudge" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className={`p-2 rounded-full border transition-all ${dark
                    ? 'text-gray-400 border-gray-700 hover:text-white hover:border-[#c9a84c]'
                    : 'text-gray-700 border-indigo-200 hover:bg-white/40'
                    }`}>Sign In</Link>

                  <Link to="/register" className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${dark
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                    : 'bg-white/60 border border-indigo-200 text-indigo-700 hover:bg-white shadow-[0_4px_16px_rgba(99,102,241,0.2)]'
                    }`}>
                    Get Started <ArrowRight size={14} className="mc-nudge" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero Content — Two Column Layout ── */}
        <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between py-12 lg:py-0 gap-12 lg:gap-0" style={{ minHeight: 'calc(100vh - 64px)' }}>

          {/* LEFT — Text + Particle canvas + CTAs */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">

            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6 border ${dark
              ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30 text-[#c9a84c]'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}>
              <Sparkles size={13} />
              VIT Bhopal University · Campus Platform
            </div>

            {/* Particle canvas — "MY CAMPUS" text */}
            <div className="relative w-full mb-4" style={{ height: 'clamp(140px, 28vw, 200px)' }}>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" style={{ cursor: 'none' }} />
            </div>

            {/* High-Conviction Headline (Issue 6) */}
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
              The Campus Operating System <br />
              <span className={dark ? 'text-[#c9a84c]' : 'text-indigo-600'}>for VIT Bhopal.</span>
            </h1>

            {/* Clear, Specific Subhead (Issue 6) */}
            <p className={`text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 drop-shadow-md ${dark ? 'text-gray-300' : 'text-gray-700 font-medium'
              }`}>
              Streamline your academic day with anti-proxy QR attendance, real-time cabin tracking for 371+ faculty members, instant VIT GPA calculation, and peer study notes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Link to="/dashboard" className={`inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-lg shadow-md transition-all duration-150 hover:-translate-y-0.5 ${dark
                  ? 'bg-[#c9a84c] text-[#07070f] hover:bg-[#a87c30]'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}>
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className={`inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-lg shadow-md transition-all duration-150 hover:-translate-y-0.5 ${dark
                    ? 'bg-[#c9a84c] text-[#07070f] hover:bg-[#a87c30]'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}>
                    Get Started with VIT Mail <ArrowRight size={16} />
                  </Link>

                  <Link to="/login" className={`inline-flex items-center justify-center px-7 py-3 rounded-lg text-sm font-semibold transition-all duration-150 border ${dark
                    ? 'border-gray-700 text-gray-200 hover:bg-white/5 hover:border-gray-500'
                    : 'border-slate-300 text-slate-800 hover:bg-white/70 hover:border-slate-400'
                    }`}>
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Operational Metrics Bar (Issue 6) */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/50 dark:border-white/10 max-w-lg">
              <div>
                <div className={`text-xl sm:text-2xl font-black drop-shadow ${dark ? 'text-[#c9a84c]' : 'text-indigo-700'}`}>371+</div>
                <div className={`text-xs mt-0.5 font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Faculty Cabins</div>
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-black drop-shadow ${dark ? 'text-[#c9a84c]' : 'text-indigo-700'}`}>10s</div>
                <div className={`text-xs mt-0.5 font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Anti-Proxy Token</div>
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-black drop-shadow ${dark ? 'text-[#c9a84c]' : 'text-indigo-700'}`}>100%</div>
                <div className={`text-xs mt-0.5 font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Native VIT Grade Scale</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Campus image cards */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 relative hidden lg:flex flex-col gap-4 items-end pr-4">
            {CAMPUS_CARDS.map(({ img, label, sub }, i) => (
              <div
                key={label}
                onClick={() => setHeroBg(img)}
                className="group relative overflow-hidden cursor-pointer w-full transition-all duration-150 hover:-translate-y-0.5 shadow-lg"
                style={{
                  borderRadius: '16px',
                  width: i === 0 ? '340px' : i === 1 ? '300px' : '260px',
                  height: '140px',
                  alignSelf: i === 0 ? 'flex-end' : i === 1 ? 'center' : 'flex-start',
                  border: dark ? '1px solid rgba(201,168,76,0.30)' : '1px solid rgba(255,255,255,0.70)',
                }}
              >
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 z-20">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin size={12} className={dark ? 'text-[#c9a84c]' : 'text-indigo-300'} />
                    <p className="text-xs font-bold text-white">{label}</p>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{
          background: dark
            ? 'linear-gradient(to bottom, transparent, rgba(7,7,15,0.9))'
            : 'linear-gradient(to bottom, transparent, rgba(238,242,255,0.9))',
        }} />
      </section>

      {/* ── Footer — appears only on scroll ── */}
      <footer className={`relative z-10 border-t py-6 px-6 backdrop-blur-md ${dark ? 'border-[#c9a84c]/20 bg-[#07070f]/90' : 'border-indigo-200/40 bg-white/70'}`}>
        <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${dark ? 'bg-gradient-to-br from-[#c9a84c] to-[#a87c30]' : 'bg-indigo-600'
              }`}>
              <GraduationCap size={12} className="text-white" />
            </div>
            <span className={`font-semibold ${dark ? 'text-[#c9a84c]' : 'text-gray-800'}`}>My-Campus</span>
          </div>
          <p>© Shivakant Kurmi 2026 · VIT Bhopal</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>Privacy Policy</Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('mc_open_cookie_preferences'))}
              className={`hover:underline cursor-pointer ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}
            >
              Cookie Settings
            </button>
            {user ? (
              <Link to="/dashboard" className={`hover:underline font-semibold ${dark ? 'hover:text-[#c9a84c] text-[#c9a84c]' : 'hover:text-indigo-600 text-indigo-600'}`}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>Sign In</Link>
                <Link to="/register" className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>Register</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
