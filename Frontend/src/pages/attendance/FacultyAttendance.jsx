import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import * as XLSX from 'xlsx';
import { Upload, Users, QrCode, Download, RefreshCw, Check, X } from 'lucide-react';

export default function FacultyAttendance() {
  const [students, setStudents] = useState([]); // { regNo, name }
  const [newReg, setNewReg] = useState('');
  const [newName, setNewName] = useState('');
  const [session, setSession] = useState(null); // { _id, qrToken, expiresAt }
  const [qrUrl, setQrUrl] = useState('');
  const [attendance, setAttendance] = useState([]); // [{studentRegNo, status}]
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('setup'); // setup | live | history
  const [countdown, setCountdown] = useState(10);
  const intervalRef = useRef(null);
  const countRef = useRef(null);
  const inputCls = 'px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none dark:text-white';

  // ── Excel upload ──────────────────────────────────────────────
  const handleExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const parsed = rows.slice(1)
        .filter(r => r[0])
        .map(r => ({ regNo: String(r[0]).trim(), name: String(r[1] || '').trim() }));
      setStudents(parsed);
    };
    reader.readAsBinaryString(file);
  };

  // ── Manual add ───────────────────────────────────────────────
  const addManual = () => {
    if (!newReg.trim() || !newName.trim()) return;
    setStudents(prev => [...prev, { regNo: newReg.trim(), name: newName.trim() }]);
    setNewReg(''); setNewName('');
  };

  // ── Start session ─────────────────────────────────────────────
  const startSession = async () => {
    if (!students.length) return alert('Add at least one student first.');
    const res = await api.post('/attendance/session', { students });
    setSession(res.data.session);
    setAttendance(students.map(s => ({ ...s, present: false })));
    generateQR(res.data.session.qrToken);
    setTab('live');
    startQrRefresh(res.data.session._id);
  };

  // ── QR helpers ────────────────────────────────────────────────
  const generateQR = (token) => {
    // Build QR payload: sessionId + token
    const payload = JSON.stringify({ token });
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
    setQrUrl(url);
  };

  const startQrRefresh = (sessionId) => {
    clearInterval(intervalRef.current);
    clearInterval(countRef.current);
    setCountdown(10);

    countRef.current = setInterval(() => {
      setCountdown(c => (c <= 1 ? 10 : c - 1));
    }, 1000);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await api.post(`/attendance/session/${sessionId}/refresh`);
        generateQR(res.data.qrToken);
        // Refresh attendance list
        const att = await api.get(`/attendance/session/${sessionId}`);
        setAttendance(att.data);
      } catch { /* silent */ }
    }, 10000);
  };

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    clearInterval(countRef.current);
  }, []);

  // ── End session ───────────────────────────────────────────────
  const endSession = async () => {
    if (!session) return;
    clearInterval(intervalRef.current);
    clearInterval(countRef.current);
    await api.post(`/attendance/session/${session._id}/end`);
    setSession(null); setTab('history');
    fetchHistory();
  };

  // ── History ───────────────────────────────────────────────────
  const fetchHistory = async () => {
    const res = await api.get('/attendance/history');
    setHistory(res.data);
  };

  useEffect(() => { fetchHistory(); }, []);

  // ── Toggle manual ─────────────────────────────────────────────
  const togglePresent = async (regNo, current) => {
    if (!session) return;
    await api.patch(`/attendance/session/${session._id}/manual`, { regNo, present: !current });
    setAttendance(prev => prev.map(s => s.regNo === regNo ? { ...s, present: !current } : s));
  };

  // ── Download Excel ────────────────────────────────────────────
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      attendance.map(s => ({ 'Reg No': s.regNo, Name: s.name, Status: s.present ? 'Present' : 'Absent' }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const presentCount = attendance.filter(s => s.present).length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['setup', 'live', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 capitalize text-sm font-medium border-b-2 transition ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Setup */}
      {tab === 'setup' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><Upload size={16}/> Upload Student List (Excel)</h3>
            <p className="text-xs text-gray-400">Excel columns: Col A = Reg No, Col B = Name (row 1 = header)</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} className="text-sm text-gray-600 dark:text-gray-300" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><Users size={16}/> Manual Entry</h3>
            <div className="flex gap-2">
              <input value={newReg} onChange={e => setNewReg(e.target.value)} placeholder="Reg No" className={inputCls} />
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Student Name" className={inputCls + ' flex-1'} />
              <button onClick={addManual} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
            </div>

            {students.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {students.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-gray-600 dark:text-gray-300">{s.regNo} — {s.name}</span>
                    <button onClick={() => setStudents(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={startSession} disabled={!students.length}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
            <QrCode size={18}/> Start Attendance Session
          </button>
        </div>
      )}

      {/* Live */}
      {tab === 'live' && session && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* QR Code */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3">
              <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><QrCode size={16}/> Live QR Code</h3>
              {qrUrl && <img src={qrUrl} alt="QR" className="w-48 h-48 rounded-lg" />}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw size={14} className="animate-spin" />
                Refreshes in {countdown}s
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-white">Live Stats</h3>
              <p className="text-4xl font-bold text-green-500">{presentCount} <span className="text-lg text-gray-400">/ {attendance.length}</span></p>
              <p className="text-sm text-gray-400">Students Present</p>
              <div className="flex gap-2 mt-3">
                <button onClick={downloadExcel} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  <Download size={14}/> Download
                </button>
                <button onClick={endSession} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">End Session</button>
              </div>
            </div>
          </div>

          {/* Attendance list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Reg No</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {attendance.map(s => (
                  <tr key={s.regNo}>
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{s.regNo}</td>
                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{s.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.present ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {s.present ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => togglePresent(s.regNo, s.present)}
                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                        {s.present ? <><X size={12}/> Mark Absent</> : <><Check size={12}/> Mark Present</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-center py-10 text-gray-400">No session history yet.</p>
          ) : (
            history.map(h => (
              <div key={h._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-white text-sm">{new Date(h.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {h.presentCount ?? '?'} / {h.totalStudents ?? '?'} present
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${h.ended ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {h.ended ? 'Ended' : 'Active'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
