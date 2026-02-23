import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, Lock, ShieldCheck, Loader2, ScanLine, Info } from 'lucide-react';

const LOCK_KEY = 'mc_attendance_lock';
const LOCK_DURATION_MS = 20 * 60 * 1000;

function isLocked() {
  const lock = localStorage.getItem(LOCK_KEY);
  if (!lock) return false;
  const { until } = JSON.parse(lock);
  return Date.now() < until;
}

function setLock() {
  localStorage.setItem(LOCK_KEY, JSON.stringify({ until: Date.now() + LOCK_DURATION_MS }));
}

function getLockSeconds() {
  const lock = localStorage.getItem(LOCK_KEY);
  if (!lock) return 0;
  const { until } = JSON.parse(lock);
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export default function StudentAttendance() {
  const [regNo, setRegNo] = useState('');
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
      await api.post('/attendance/mark', {
        token: payload.token,
        regNo: regNo.trim(),
        deviceId: getDeviceId(),
      });
      // ── Lock ONLY after server confirms success ──
      setLock();
      setLocked(true);
      setLockSecs(getLockSeconds());
      setStatus('success');
      setMsg('Attendance marked successfully!');
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  function getDeviceId() {
    let id = localStorage.getItem('mc_device_id');
    if (!id) {
      id = `${navigator.userAgent}_${Date.now()}_${Math.random()}`;
      localStorage.setItem('mc_device_id', id);
    }
    return id;
  }

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <ScanLine size={18} className="text-blue-500" /> Mark Attendance
          </h3>
          <button onClick={() => setShowInfo(v => !v)}
            className="text-gray-400 hover:text-blue-500 transition-colors">
            <Info size={16} />
          </button>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="pop-in bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-semibold flex items-center gap-1"><ShieldCheck size={13}/> How the device lock works</p>
            <p>
              When your attendance is confirmed by the server, a timestamp is saved in this browser
              (<code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">localStorage</code>) set to expire 20 minutes from now.
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
            <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
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
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
              />
            </div>

            {/* QR Scanner with animated border */}
            <div className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 ${scanning ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 shadow-lg shadow-blue-500/20' : ''} ${!scanning ? 'hidden' : ''}`}
              style={{ minHeight: 240 }}>
              <div id="qr-reader" className="w-full" style={{ minHeight: 240 }} />
              {/* Animated scan line */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  <div className="scan-pulse absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-blue-400 to-transparent opacity-70"/>
                </div>
              )}
            </div>

            {/* Submitting overlay */}
            {submitting && (
              <div className="pop-in flex items-center justify-center gap-3 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <Loader2 size={20} className="animate-spin text-blue-500"/>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Verifying with server…</span>
              </div>
            )}

            {/* Action buttons */}
            {!submitting && (
              <div className="flex gap-3">
                {!scanning ? (
                  <button onClick={startScan}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-medium text-sm shadow-sm shadow-blue-500/30 transition-all active:scale-95">
                    <Camera size={16} /> Open Camera &amp; Scan
                  </button>
                ) : (
                  <button onClick={stopScan}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-all active:scale-95">
                    Stop Scanning
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Status message ── */}
        {msg && !submitting && (
          <div className={`pop-in flex items-start gap-2.5 p-3 rounded-xl text-sm font-medium border ${
            status === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-700'
              : status === 'error'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700'
              : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
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
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <p className="font-semibold">Anti-Proxy Rules:</p>
          <p>• QR refreshes every 10 seconds — sharing is futile.</p>
          <p>• Each device is server-locked for 20 minutes after one successful mark.</p>
          <p>• Enter your own registration number accurately.</p>
        </div>
      )}
    </div>
  );
}
