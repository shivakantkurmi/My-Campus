import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle } from 'lucide-react';

const LOCK_KEY = 'mc_attendance_lock';

function isLocked() {
  const lock = localStorage.getItem(LOCK_KEY);
  if (!lock) return false;
  const { until } = JSON.parse(lock);
  return Date.now() < until;
}

function setLock() {
  localStorage.setItem(LOCK_KEY, JSON.stringify({ until: Date.now() + 20 * 60 * 1000 }));
}

function getLockMinutes() {
  const lock = localStorage.getItem(LOCK_KEY);
  if (!lock) return 0;
  const { until } = JSON.parse(lock);
  return Math.ceil((until - Date.now()) / 60000);
}

export default function StudentAttendance() {
  const [regNo, setRegNo] = useState('');
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState(null); // 'success'|'error'|null
  const [msg, setMsg] = useState('');
  const [locked, setLocked] = useState(isLocked());
  const [lockMins, setLockMins] = useState(getLockMinutes());
  const scannerRef = useRef(null);
  const qrRef = useRef(null);

  // Update lock countdown every 30s
  useEffect(() => {
    const t = setInterval(() => {
      const l = isLocked();
      setLocked(l);
      setLockMins(getLockMinutes());
    }, 30000);
    return () => clearInterval(t);
  }, []);

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
    try {
      const payload = JSON.parse(decodedText);
      await api.post('/attendance/mark', {
        token: payload.token,
        regNo: regNo.trim(),
        deviceId: getDeviceId(),
      });
      setLock();
      setLocked(true);
      setLockMins(20);
      setStatus('success');
      setMsg('Attendance marked successfully! ✅');
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  // Stable device fingerprint from localStorage
  function getDeviceId() {
    let id = localStorage.getItem('mc_device_id');
    if (!id) {
      id = `${navigator.userAgent}_${Date.now()}_${Math.random()}`;
      localStorage.setItem('mc_device_id', id);
    }
    return id;
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Camera size={18} /> Scan Attendance QR
        </h3>

        {locked ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <XCircle size={40} className="text-red-400" />
            <p className="font-medium text-red-400">Device Locked</p>
            <p className="text-sm text-gray-400">Your attendance has been recorded. This device is locked for {lockMins} more minute(s) to prevent proxy.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Registration Number</label>
              <input
                value={regNo}
                onChange={e => setRegNo(e.target.value)}
                placeholder="e.g. 22BCE0001"
                disabled={scanning}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none dark:text-white"
              />
            </div>

            {/* QR Scanner area */}
            <div id="qr-reader" className={`w-full rounded-xl overflow-hidden ${!scanning ? 'hidden' : ''}`} style={{ minHeight: 240 }} />

            <div className="flex gap-3">
              {!scanning ? (
                <button onClick={startScan} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm">
                  <Camera size={16} /> Open Camera & Scan
                </button>
              ) : (
                <button onClick={stopScan} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm">
                  Stop Scanning
                </button>
              )}
            </div>
          </>
        )}

        {/* Status message */}
        {msg && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
            status === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-700'
            : status === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-700'
            : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {status === 'success' ? <CheckCircle size={16}/> : status === 'error' ? <XCircle size={16}/> : null}
            {msg}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
        <p className="font-semibold">Anti-Proxy Rules:</p>
        <p>• QR refreshes every 10 seconds — share is futile.</p>
        <p>• Each device can only mark attendance once per 20 minutes.</p>
        <p>• Enter your own registration number accurately.</p>
      </div>
    </div>
  );
}
