import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, Cookie, UserCheck, QrCode, FileText,
  Server, ArrowLeft, Sun, Moon, Sparkles, CheckCircle2,
  ExternalLink, Mail, Eye, KeyRound, Clock, Settings, Search, ChevronRight, GraduationCap
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import { useAuroraCanvas } from '../../components/common/AuroraCanvas';

export default function PrivacyPolicy() {
  const { dark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const bgCanvasRef = useRef(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useAuroraCanvas(bgCanvasRef, dark, { density: 12000, maxAlpha: dark ? 0.35 : 0.2 });

  const triggerCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('mc_open_cookie_preferences'));
  };

  const sections = [
    {
      id: 'overview',
      title: '1. Overview & Scope',
      icon: ShieldCheck,
      content: (
        <div className="space-y-4">
          <p>
            Welcome to <strong>My-Campus</strong>, the dedicated academic and campus utility platform engineered specifically for students, faculty, and administrative staff of <strong>VIT Bhopal University</strong>.
          </p>
          <p>
            This Privacy Policy explains transparently how we collect, process, safeguard, and retain your personal and academic information when you use our web portal, notes sharing hub, anti-proxy QR attendance system, faculty cabin status tracker, and CGPA calculator.
          </p>
          <div className={`p-4 rounded-2xl border ${dark ? 'bg-[#c9a84c]/10 border-[#c9a84c]/20 text-gray-200' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <Sparkles size={16} className={dark ? 'text-[#c9a84c]' : 'text-indigo-600'} />
              <span>Core Privacy Commitment</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              We never monetize or sell your personal data. All data collected is strictly utilized to facilitate internal academic operations, prevent proxy attendance, and foster peer-to-peer resource sharing within the university community.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'data-collection',
      title: '2. Information We Collect',
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          <p>To provide a personalized and secure experience, we collect the following categories of information:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className={`p-4 rounded-2xl border ${dark ? 'bg-black/30 border-white/10' : 'bg-white/70 border-indigo-100'}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2 text-indigo-400 dark:text-[#c9a84c]">
                <KeyRound size={16} /> Account Information
              </div>
              <ul className="text-xs sm:text-sm space-y-1.5 list-disc list-inside text-gray-400 dark:text-gray-300">
                <li>Full Name and institutional email address</li>
                <li>Hashed password (using bcrypt cryptographic salt)</li>
                <li>Role designation (Student, Faculty, Admin)</li>
                <li>Academic Department &amp; Specialization</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border ${dark ? 'bg-black/30 border-white/10' : 'bg-white/70 border-indigo-100'}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2 text-indigo-400 dark:text-[#c9a84c]">
                <FileText size={16} /> Academic &amp; Study Notes
              </div>
              <ul className="text-xs sm:text-sm space-y-1.5 list-disc list-inside text-gray-400 dark:text-gray-300">
                <li>Note title, course code, subject, and module number</li>
                <li>Associated Google Drive / cloud resource links</li>
                <li>Uploader metadata and peer bookmark records</li>
                <li>Semester GPA / CGPA computation inputs</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border ${dark ? 'bg-black/30 border-white/10' : 'bg-white/70 border-indigo-100'}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2 text-indigo-400 dark:text-[#c9a84c]">
                <QrCode size={16} /> Attendance &amp; Device Tokens
              </div>
              <ul className="text-xs sm:text-sm space-y-1.5 list-disc list-inside text-gray-400 dark:text-gray-300">
                <li>Cryptographic device fingerprint to enforce 1-device policy</li>
                <li>Exact attendance scan timestamps</li>
                <li>Session ID and corresponding faculty room/course code</li>
                <li>Proxy prevention violation audits</li>
              </ul>
            </div>

            <div className={`p-4 rounded-2xl border ${dark ? 'bg-black/30 border-white/10' : 'bg-white/70 border-indigo-100'}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2 text-indigo-400 dark:text-[#c9a84c]">
                <Clock size={16} /> Faculty Cabin &amp; Broadcasts
              </div>
              <ul className="text-xs sm:text-sm space-y-1.5 list-disc list-inside text-gray-400 dark:text-gray-300">
                <li>Faculty in-cabin real-time availability status</li>
                <li>Cabin block and room number mappings</li>
                <li>Departmental announcement notices</li>
                <li>Student feedback and moderation reports</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'qr-attendance-privacy',
      title: '3. QR Attendance & Anti-Proxy Security',
      icon: QrCode,
      content: (
        <div className="space-y-4">
          <p>
            The My-Campus dynamic QR code attendance system is designed with strict academic integrity checks:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`} />
              <span><strong>Hardware &amp; Device Identity:</strong> Each student account is bound to a single physical device during scanning to prevent remote check-ins on behalf of absent peers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`} />
              <span><strong>Time-Limited Rotating Codes:</strong> Attendance QR codes rotate dynamically every few seconds, invalidating static screenshots and external distribution.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`} />
              <span><strong>No Invasive GPS Tracking:</strong> We do not track your real-time continuous GPS location outside of the immediate classroom session context.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cookies-policy',
      title: '4. Cookies & Local Storage Policy',
      icon: Cookie,
      content: (
        <div className="space-y-4">
          <p>
            We utilize cookies and browser `localStorage` solely to maintain state, secure access, and optimize your visual preferences across devices.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className={`border-b ${dark ? 'border-white/10 text-gray-300' : 'border-indigo-100 text-gray-700'}`}>
                  <th className="py-2.5 pr-4 font-bold">Storage Item</th>
                  <th className="py-2.5 px-4 font-bold">Type</th>
                  <th className="py-2.5 px-4 font-bold">Purpose</th>
                  <th className="py-2.5 pl-4 font-bold">Duration</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-white/5 text-gray-400' : 'divide-gray-100 text-gray-600'}`}>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold text-indigo-400 dark:text-[#c9a84c]">mc_token</td>
                  <td className="py-2.5 px-4">Essential</td>
                  <td className="py-2.5 px-4">Stores JWT authorization token for authenticated API requests</td>
                  <td className="py-2.5 pl-4">7 Days / Session</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold text-indigo-400 dark:text-[#c9a84c]">mc_theme</td>
                  <td className="py-2.5 px-4">Functional</td>
                  <td className="py-2.5 px-4">Remembers your preferred Light / Dark visual theme</td>
                  <td className="py-2.5 pl-4">Persistent</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-mono font-semibold text-indigo-400 dark:text-[#c9a84c]">mc_cookie_consent</td>
                  <td className="py-2.5 px-4">Functional</td>
                  <td className="py-2.5 px-4">Stores your cookie preferences and consent timestamp</td>
                  <td className="py-2.5 pl-4">1 Year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <button
              onClick={triggerCookieSettings}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                dark
                  ? 'bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 border border-[#c9a84c]/40'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Settings size={16} /> Manage Cookie Settings Now
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'security-rate-limiting',
      title: '5. Security Architecture & Rate Limiting',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p>
            We implement industry-standard safeguards to protect student and faculty records against unauthorized access, modification, or DDoS attacks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className={`p-4 rounded-2xl border ${dark ? 'bg-black/20 border-white/10' : 'bg-white/60 border-indigo-100'}`}>
              <h4 className="font-bold mb-1 flex items-center gap-2 text-indigo-400 dark:text-[#c9a84c]">
                <Server size={16} /> API Rate Limiting
              </h4>
              <p className="text-gray-400 dark:text-gray-300">
                Express rate limiters restrict requests across authentication endpoints, defending against credential stuffing, automated bots, and brute force login attempts.
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${dark ? 'bg-black/20 border-white/10' : 'bg-white/60 border-indigo-100'}`}>
              <h4 className="font-bold mb-1 flex items-center gap-2 text-indigo-400 dark:text-[#c9a84c]">
                <Lock size={16} /> Strong Cryptography
              </h4>
              <p className="text-gray-400 dark:text-gray-300">
                All passwords are irreversibly salted and hashed via bcrypt. Session tokens are signed using cryptographic JWT keys and transmitted over encrypted HTTPS.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'user-rights',
      title: '6. User Rights & Data Control',
      icon: Eye,
      content: (
        <div className="space-y-3 text-xs sm:text-sm">
          <p>As a registered user of My-Campus, you possess full control over your profile and uploaded content:</p>
          <ul className="space-y-2 list-disc list-inside text-gray-400 dark:text-gray-300">
            <li><strong>Right to Access:</strong> View all your attendance logs, uploaded notes, and profile details anytime in your Dashboard.</li>
            <li><strong>Right to Rectify:</strong> Update your name, department, or password directly from your Profile settings.</li>
            <li><strong>Right to Delete:</strong> You can delete any notes or study materials you have previously uploaded.</li>
            <li><strong>Administrative Recourse:</strong> Request account deactivation or report compromised credentials to the campus administrator.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'contact',
      title: '7. Contact & Administration',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm">
            For privacy inquiries, security reports, or technical support regarding your My-Campus account, please contact our administrative team:
          </p>
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            dark ? 'bg-[#0f0f1c] border-[#c9a84c]/20' : 'bg-white/80 border-indigo-100'
          }`}>
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">My-Campus Technical Administration</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">VIT Bhopal University · Madhya Pradesh, India</div>
              <div className="text-xs text-indigo-500 dark:text-[#c9a84c] font-mono mt-1">support@mycampus.edu</div>
            </div>
            <Link
              to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                dark
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f]'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {user ? (user.role === 'admin' ? 'Open Admin Panel' : 'My Dashboard') : 'Sign In Portal'}
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = searchQuery
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  return (
    <div
      className={`min-h-screen text-gray-900 dark:text-white transition-colors duration-300 relative selection:bg-[#c9a84c]/30`}
      style={{ background: dark ? '#07070f' : '#eef2ff' }}
    >
      {/* Dynamic Aurora Canvas */}
      <canvas
        ref={bgCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: dark ? 0.85 : 0.45 }}
      />

      {/* ── Top Navigation Bar ── */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
          dark
            ? 'bg-[#07070f]/80 border-[#c9a84c]/15 shadow-xl shadow-black/40'
            : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full border transition-all ${
                dark
                  ? 'border-gray-700 text-gray-300 hover:text-white hover:border-[#c9a84c]'
                  : 'border-indigo-200 text-gray-700 hover:bg-white/60'
              }`}
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                  dark
                    ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] text-[#07070f]'
                    : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                }`}
              >
                <GraduationCap size={18} />
              </div>
              <span className={`text-lg font-bold tracking-tight ${dark ? 'text-[#c9a84c]' : 'text-gray-900'}`}>
                My-Campus
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 border ${
                dark
                  ? 'text-gray-300 hover:text-white hover:bg-[#c9a84c]/10 border-gray-700'
                  : 'text-gray-800 hover:bg-white/60 border-indigo-200/60'
              }`}
              title="Toggle Theme"
            >
              {dark ? <Sun size={16} className="text-[#c9a84c]" /> : <Moon size={16} className="text-indigo-600" />}
              <span className="hidden sm:inline">{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow ${
                  dark
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f]'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow ${
                  dark
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f]'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero Title Section */}
        <div className="max-w-3xl mb-10">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
              dark
                ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30 text-[#c9a84c]'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            <Sparkles size={12} /> Campus Privacy &amp; Data Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Privacy Policy &amp; Cookie Notice
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            How My-Campus protects and handles student credentials, notes repositories, anti-proxy attendance verification, and session preferences at VIT Bhopal University.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>Last Updated: August 2026</span>
            <span>•</span>
            <span>Effective Version: 2.1</span>
            <span>•</span>
            <button
              onClick={triggerCookieSettings}
              className={`underline font-semibold transition-colors ${
                dark ? 'text-[#c9a84c] hover:text-[#e8c76b]' : 'text-indigo-600 hover:text-indigo-800'
              }`}
            >
              Configure Cookies
            </button>
          </div>
        </div>

        {/* Search & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Table of Contents & Quick Search (Desktop) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search privacy topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm backdrop-blur-md border transition-all focus:outline-none ${
                  dark
                    ? 'bg-[#121222]/80 border-[#c9a84c]/20 text-white placeholder-gray-500 focus:border-[#c9a84c]'
                    : 'bg-white/80 border-indigo-100 text-gray-800 placeholder-gray-400 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Quick Navigation Card */}
            <div
              className={`p-4 rounded-3xl backdrop-blur-xl border ${
                dark
                  ? 'bg-[#10101c]/80 border-[#c9a84c]/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                  : 'bg-white/80 border-indigo-100 shadow-lg shadow-indigo-500/5'
              }`}
            >
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map(({ id, title, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setActiveSection(id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeSection === id
                        ? dark
                          ? 'bg-[#c9a84c]/20 text-[#c9a84c] shadow-sm'
                          : 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : dark
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="truncate">{title}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-60 flex-shrink-0" />
                  </a>
                ))}
              </nav>

              {/* Cookie Action Box */}
              <div className={`mt-5 p-3.5 rounded-2xl border text-center ${
                dark ? 'bg-black/30 border-[#c9a84c]/15' : 'bg-indigo-50/50 border-indigo-100'
              }`}>
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs mb-1">
                  <Cookie size={14} className={dark ? 'text-[#c9a84c]' : 'text-indigo-600'} />
                  <span>Your Cookie Choice</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  You can modify functional or analytics cookie preferences at any time.
                </p>
                <button
                  onClick={triggerCookieSettings}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow active:scale-95 ${
                    dark
                      ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f]'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Policy Content Cards */}
          <div className="lg:col-span-8 space-y-6">
            {filteredSections.map(({ id, title, icon: Icon, content }) => (
              <section
                key={id}
                id={id}
                className={`p-6 sm:p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 scroll-mt-24 ${
                  dark
                    ? 'bg-[#10101f]/85 border-[#c9a84c]/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:border-[#c9a84c]/30'
                    : 'bg-white/85 border-indigo-100 shadow-xl shadow-indigo-500/5 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-200/50 dark:border-white/10">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
                      dark
                        ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] text-[#07070f]'
                        : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {title}
                  </h2>
                </div>

                <div className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {content}
                </div>
              </section>
            ))}

            {filteredSections.length === 0 && (
              <div
                className={`p-12 text-center rounded-3xl border ${
                  dark ? 'bg-[#10101f]/60 border-gray-800 text-gray-400' : 'bg-white/60 border-indigo-100 text-gray-600'
                }`}
              >
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <h3 className="font-bold text-base mb-1">No matching topics found</h3>
                <p className="text-xs">Try adjusting your search keywords to browse policy items.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className={`relative z-10 border-t py-8 px-6 backdrop-blur-md mt-16 ${
          dark ? 'border-[#c9a84c]/15 bg-[#07070f]/90' : 'border-indigo-200/40 bg-white/80'
        }`}
      >
        <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm ${
          dark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center ${
                dark ? 'bg-gradient-to-br from-[#c9a84c] to-[#a87c30]' : 'bg-indigo-600'
              }`}
            >
              <GraduationCap size={12} className="text-white" />
            </div>
            <span className={`font-semibold ${dark ? 'text-[#c9a84c]' : 'text-gray-800'}`}>
              My-Campus Portal
            </span>
          </div>

          <p>© Shivakant Kurmi 2026 · VIT Bhopal University</p>

          <div className="flex items-center gap-4">
            <Link to="/" className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>
              Home
            </Link>
            {user ? (
              <Link to="/dashboard" className={`hover:underline font-semibold ${dark ? 'text-[#c9a84c]' : 'text-indigo-600'}`}>
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className={`hover:underline ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}>
                Sign In
              </Link>
            )}
            <button
              onClick={triggerCookieSettings}
              className={`hover:underline cursor-pointer ${dark ? 'hover:text-[#c9a84c]' : 'hover:text-indigo-600'}`}
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
