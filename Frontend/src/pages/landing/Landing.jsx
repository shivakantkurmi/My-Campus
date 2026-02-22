import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  BookOpen, QrCode, DoorOpen, Calculator,
  ShieldCheck, Moon, Sun, ArrowRight, GraduationCap,
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const features = [
  {
    icon: BookOpen,
    title: 'Notes Sharing',
    desc: 'Upload and browse notes from peers across departments. Download in one tap.',
    color: 'bg-indigo-500/10 text-indigo-500',
  },
  {
    icon: QrCode,
    title: 'QR Attendance',
    desc: 'Faculty generate a time-limited QR; students scan to mark themselves present — no proxies.',
    color: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: DoorOpen,
    title: 'Faculty Cabin Finder',
    desc: 'Check which professors are in their cabin right now before making the trip.',
    color: 'bg-sky-500/10 text-sky-500',
  },
  {
    icon: Calculator,
    title: 'CGPA Calculator',
    desc: 'Enter your semester grades and get a pinpoint GPA/CGPA calculation instantly.',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Dashboard',
    desc: 'One admin manages the entire platform — user moderation, notes oversight, complaints.',
    color: 'bg-rose-500/10 text-rose-500',
  },
  {
    icon: GraduationCap,
    title: 'Built for VIT',
    desc: 'Designed specifically for VIT Bhopal students and faculty. Log in with your campus credentials.',
    color: 'bg-amber-500/10 text-amber-500',
  },
];

export default function Landing() {
  const { dark, toggleTheme, initTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    initTheme();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Get Started
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* background blobs */}
        <div className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-600/8 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/8 dark:bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center relative">
          {/* badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            VIT Bhopal Campus Platform
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Everything your campus
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              life needs.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Notes sharing, anti-proxy QR attendance, faculty cabin finder,
            CGPA calculator — all in one place, built for VITians.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
            >
              Join My-Campus
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>

          {/* stat bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            {[
              { val: '5+', label: 'Core Features' },
              { val: '3', label: 'User Roles' },
              { val: '1', label: 'Campus Admin' },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{val}</div>
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
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Everything you need to navigate campus life, in one clean dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-base font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-10 sm:p-14 text-center">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Ready to get started?
            </h2>
            <p className="text-indigo-200 mb-8 text-lg">
              Create your account in under a minute.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 shadow-xl transition-all hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <GraduationCap size={13} className="text-white" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">My-Campus</span>
          </div>
          <p>© 2026 My-Campus · VIT Bhopal</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
