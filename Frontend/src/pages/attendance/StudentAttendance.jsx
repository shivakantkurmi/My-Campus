import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, Lock, ShieldCheck, Loader2, ScanLine, Info } from 'lucide-react';

const LOCK_KEY = 'mc_attendance_lock';
const LOCK_DURATION_MS = 20 * 60 * 1000;

// ── Cookie helpers (survive localStorage clears) ──────────────
function setCookie(name, value, ms) {
  const expires = new Date(Date.now() + ms).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Strict`;
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// ── Lock: read/write both localStorage AND cookie ─────────────
function isLocked() {
  const ls = localStorage.getItem(LOCK_KEY);
  if (ls) { try { if (Date.now() < JSON.parse(ls).until) return true; } catch {} }
  const ck = getCookie(LOCK_KEY);
  if (ck && Date.now() < parseInt(ck, 10)) return true;
  return false;
}
function setLock() {
  const until = Date.now() + LOCK_DURATION_MS;
  localStorage.setItem(LOCK_KEY, JSON.stringify({ until }));
  setCookie(LOCK_KEY, String(until), LOCK_DURATION_MS);
}
function getLockSeconds() {
  let until = 0;
  const ls = localStorage.getItem(LOCK_KEY);
  if (ls) { try { until = Math.max(until, JSON.parse(ls).until); } catch {} }
  const ck = getCookie(LOCK_KEY);
  if (ck) until = Math.max(until, parseInt(ck, 10));
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

// ── Hardware Device ID ────────────────────────────────────────
// Built from GPU renderer + canvas pixels + screen metrics.
// These come from the physical hardware and CANNOT be changed
// by clearing cookies, localStorage, or any browser storage.
// A different physical device will always produce a different hash.
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++)
    h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0');
}

function getHardwareDeviceId() {
  // 1. WebGL GPU renderer — unique to the physical graphics chip
  let gpu = 'no-webgl';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      const vendor   = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR);
      gpu = `${renderer}|${vendor}`;
    }
  } catch {}

  // 2. Canvas pixel fingerprint — GPU driver produces subtly unique output
  let canvasHash = '00000000';
  try {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 40;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 40);
    ctx.fillStyle = '#069';
    ctx.font = '14px Arial';
    ctx.fillText('MyCampus🎓', 2, 22);
    ctx.fillStyle = 'rgba(102,204,0,0.8)';
    ctx.font = '13px Georgia';
    ctx.fillText('attendance2026', 4, 36);
    canvasHash = djb2(c.toDataURL().slice(-128));
  } catch {}

  // 3. Screen + CPU — differ between different physical machines
  const screen$ = [
    screen.width, screen.height, screen.colorDepth,
    window.devicePixelRatio,
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
    navigator.platform || '',
    new Date().getTimezoneOffset(),
  ].join('|');

  return `${djb2(gpu)}-${canvasHash}-${djb2(screen$)}`;
}

export default function StudentAttendance() {
  const [regNo, setRegNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success'|'error'|null
  const [msg, setMsg] = useState('');
  const [locked, setLocked] = useState(isLocked());
  const [lockSecs, setLockSecs] = useState(getLockSeconds());
  const [showInfo, setShowInfo] = useState(false);
  const qrRef = useRef(null);

  // Live second countdown while locked
  useEffect(() => {
    const t = setInterval(() => {
      const l = isLocked();
      setLocked(l);
      setLockSecs(getLockSeconds());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const lockMins = Math.floor(lockSecs / 60);
  const lockSecsRem = lockSecs % 60;
  // SVG ring: r=52 cx=cy=60 circumference≈326.7
  const CIRC = 326.7;
  const ringOffset = CIRC * (1 - lockSecs / (LOCK_DURATION_MS / 1000));

  const startScan = async () => {
    if (!regNo.trim()) return setMsg('Enter your registration number first.');
    if (locked) return;
    setScanning(true);
    setStatus(null);
    setMsg('');

    try {
      const html5Qr = new Html5Qrcode('qr-reader');
      qrRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 5, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await html5Qr.stop().catch(() => {});
          setScanning(false);
          await markAttendance(decodedText);
        },
        () => {}
      );
    } catch (e) {
      setScanning(false);
      setMsg('Camera access denied or not available.');
    }
  };

  const stopScan = async () => {
    if (qrRef.current) await qrRef.current.stop().catch(() => {});
    setScanning(false);
  };

  const markAttendance = async (decodedText) => {
    if (submitting) return;
    setSubmitting(true);
    setMsg('Submitting attendance…');
    setStatus(null);
    try {
      const payload = JSON.parse(decodedText);
      const res = await api.post('/attendance/mark', {
        token: payload.token,
        regNo: regNo.trim().toUpperCase(),
        deviceId: getHardwareDeviceId(),   // hardware-derived, storage-independent
      });
      // ── Lock ONLY after server confirms success ──
      setLock();
      setLocked(true);
      setLockSecs(getLockSeconds());
      setStatus('success');
      const name = res.data?.studentName;
      setStudentName(name || '');
      setMsg(name
        ? `Attendance marked present for ${name}!`
        : 'Attendance marked successfully!');
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 animate-[fadeSlideUp_0.4s_ease_both]"
      style={{ '--tw-enter-translate-y': '16px' }}>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7); }
          70%  { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes scanLine {
          0%   { top: 0%; }
          50%  { top: 90%; }
          100% { top: 0%; }
        }
        .pop-in  { animation: popIn 0.45s cubic-bezier(.36,.07,.19,.97) both; }
        .scan-pulse { animation: scanLine 2s linear infinite; }
      `}</style>

      {/* ── Main Card ── */}
      <div className="bg-white/80 dark:bg-[#121220] backdrop-blur-[40px] rounded-[2.5rem] border-[2px] border-white/90 dark:border-[#c9a84c]/20 shadow-[0_30px_80px_-15px_rgba(255,255,255,0.6)] dark:shadow-none transition-all  p-6 space-y-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ScanLine size={18} className="text-indigo-600 dark:text-[#c9a84c]" /> Mark Attendance
          </h3>
          <button onClick={() => setShowInfo(v => !v)}
            className="text-gray-400 hover:text-indigo-600 dark:text-[#c9a84c] transition-colors">
            <Info size={16} />
          </button>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="pop-in bg-indigo-50 dark:bg-[#c9a84c]/10 dark:bg-[#c9a84c]/10 border border-indigo-200 dark:border-[#c9a84c]/30 dark:border-indigo-700 dark:border-[#8a6020]  p-3 text-xs text-indigo-800 dark:text-[#a87c30] dark:text-indigo-400 dark:text-[#e8c76b] space-y-1">
            <p className="font-semibold flex items-center gap-1"><ShieldCheck size={13}/> How the device lock works</p>
            <p>
              When your attendance is confirmed by the server, a timestamp is saved in this browser
              (<code className="bg-indigo-100 dark:bg-[#c9a84c]/20 dark:bg-[#c9a84c]/20 px-1 rounded">localStorage</code>) set to expire 20 minutes from now.
              The scan UI is hidden until that timer expires.
            </p>
            <p>
              Even if you clear the browser storage, the <strong>server independently checks</strong> your
              device fingerprint against every attendance record from the last 20 minutes. Any attempt
              to re-submit returns HTTP 429 — the lock cannot be bypassed.
            </p>
          </div>
        )}

        {/* ── LOCKED STATE ── */}
        {locked ? (
          <div className="flex flex-col items-center gap-4 py-4">
            {/* SVG countdown ring */}
            <div className="relative flex items-center justify-center">
              <svg width="120" height="120" className="-rotate-90">
                {/* Track */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor"
                  className="text-gray-100 dark:text-gray-700" strokeWidth="7"/>
                {/* Progress */}
                <circle cx="60" cy="60" r="52" fill="none"
                  stroke="url(#lockGrad)" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}/>
                <defs>
                  <linearGradient id="lockGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f87171"/>
                    <stop offset="100%" stopColor="#fb923c"/>
                  </linearGradient>
                </defs>
              </svg>
              {/* Center icon */}
              <div className="absolute flex flex-col items-center gap-0.5">
                <Lock size={22} className="text-red-400 animate-pulse"/>
                <span className="text-xs font-bold text-red-400">
                  {lockMins}:{lockSecsRem.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold text-red-400 text-sm">Device Locked</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Attendance recorded. Your device is locked for{' '}
                <span className="font-medium text-red-400">{lockMins}m {lockSecsRem}s</span> to prevent proxy marking.
              </p>
            </div>

            {/* Anti-proxy explanation */}
            <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700  p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1"><ShieldCheck size={12}/> Why can't I bypass this?</p>
              <p>Even if you open Incognito or clear storage, the <strong>server stores your device fingerprint</strong> in MongoDB. Every scan attempt is checked against it for 20 minutes.</p>
            </div>
          </div>
        ) : (
          /* ── ACTIVE SCAN STATE ── */
          <div className="space-y-4">
            {/* Registration Number Input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Registration Number
              </label>
              <input
                value={regNo}
                onChange={e => setRegNo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startScan()}
                placeholder="e.g. 22BCE0001"
                disabled={scanning || submitting}
                className="w-full px-3 py-2.5 bg-white/40 dark:bg-[#1c1c2e] backdrop-blur-md border border-white/60 dark:border-[#2a2a40]  text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:ring-[#c9a84c]/40 focus:border-indigo-400 dark:border-[#c9a84c]/50 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
              />
            </div>

            {/* QR Scanner with animated border */}
            <div className={`relative w-full  overflow-hidden transition-all duration-300 ${scanning ? 'ring-2 ring-indigo-500 dark:ring-[#c9a84c] ring-offset-2 dark:ring-offset-gray-800 shadow-lg shadow-indigo-500/20 dark:shadow-[#c9a84c]/20' : ''} ${!scanning ? 'hidden' : ''}`}
              style={{ minHeight: 240 }}>
              <div id="qr-reader" className="w-full" style={{ minHeight: 240 }} />
              {/* Animated scan line */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden ">
                  <div className="scan-pulse absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-indigo-400 to-transparent opacity-70"/>
                </div>
              )}
            </div>

            {/* Submitting overlay */}
            {submitting && (
              <div className="pop-in flex items-center justify-center gap-3 py-4 bg-indigo-50 dark:bg-[#c9a84c]/10 dark:bg-[#c9a84c]/10  border border-indigo-200 dark:border-[#c9a84c]/30 dark:border-indigo-700 dark:border-[#8a6020]">
                <Loader2 size={20} className="animate-spin text-indigo-600 dark:text-[#c9a84c]"/>
                <span className="text-sm font-medium text-indigo-700 dark:text-[#c9a84c] dark:text-indigo-500 dark:text-[#e8c76b]">Verifying with server…</span>
              </div>
            )}

            {/* Action buttons */}
            {!submitting && (
              <div className="flex gap-3">
                {!scanning ? (
                  <button onClick={startScan}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white  font-medium text-sm shadow-sm shadow-indigo-500/30 dark:shadow-[#c9a84c]/30 transition-all active:scale-95">
                    <Camera size={16} /> Open Camera &amp; Scan
                  </button>
                ) : (
                  <button onClick={stopScan}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white  font-medium text-sm transition-all active:scale-95">
                    Stop Scanning
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Status message ── */}
        {msg && !submitting && (
          <div className={`pop-in flex items-start gap-2.5 p-3  text-sm font-medium border ${
            status === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-700'
              : status === 'error'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700'
              : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-white/60 dark:border-[#2a2a40]'
          }`}>
            {status === 'success'
              ? <CheckCircle size={17} className="mt-0.5 shrink-0"/>
              : status === 'error'
              ? <XCircle size={17} className="mt-0.5 shrink-0"/>
              : null}
            <span>{msg}</span>
          </div>
        )}
      </div>

      {/* ── Anti-Proxy Rules ── */}
      {!locked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20  p-4 border border-yellow-200 dark:border-yellow-700 text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <p className="font-semibold">Anti-Proxy Rules:</p>
          <p>• QR refreshes every 10 seconds — sharing is futile.</p>
          <p>• Each device is server-locked for 20 minutes after one successful mark.</p>
          <p>• Enter your own registration number accurately.</p>
        </div>
      )}
    </div>
  );
}
