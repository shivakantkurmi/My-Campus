import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import * as XLSX from 'xlsx';
import { Upload, Users, QrCode, Download, RefreshCw, Check, X, Play, StopCircle, Clock, TrendingUp, FileSpreadsheet, PlusCircle, Trash2, Loader2 } from 'lucide-react';

// ── Flexible Excel column resolution ────────────────────────────────────────
// slug() lowercases + strips ALL spaces/punctuation/special chars first, so
// every alias below matches ANY capitalisation, spacing or punctuation variant:
//   "REG. NO."  → "regno"     "Reg Num"     → "regnum"
//   "reG nUmBer"→ "regnumber" "ROLL NUMBER" → "rollnumber"
const slug = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const REG_ALIASES = new Set([
  // ── reg / reg no / reg number ──────────────────────────────
  'reg','regno','regnos','regno',
  'regnum','regnumber','regnumbers',
  'regnno','regnnumber',                    // common typos
  'regid','regids',

  // ── registration … ────────────────────────────────────────
  'registration',
  'registrationno','registrationnum','registrationnumber',
  'registrationid',
  'registrationno','registrationnos',

  // ── typo: regestration / registeration ───────────────────
  'regestrationno','regestrationnumber',
  'registerationno','registerationnumber',
  'registrationnumber',                     // exported header (round-trip safe)

  // ── roll no / roll number ──────────────────────────────────
  'roll','rollno','rollnos',
  'rollnum','rollnumber','rollnumbers',
  'rollid',

  // ── enroll / enrollment / enrolment ───────────────────────
  'enrollno','enrollnum','enrollnumber',
  'enrollmentno','enrollmentnum','enrollmentnumber',
  'enrollmentid',
  'enrolno','enrolnum','enrolnumber',
  'enrolmentno','enrolmentnum','enrolmentnumber',

  // ── admission ─────────────────────────────────────────────
  'admissionno','admissionnum','admissionnumber',
  'admissionid','admno','admnum','admid',

  // ── student-prefixed ──────────────────────────────────────
  'studentid','studentids',
  'studentno','studentnum','studentnumber',
  'studentregno','studentregnumber','studentregnum',
  'studentrollno','studentrollnumber','studentrollnum',
  'studentenrollno','studentenrollmentno',

  // ── short shorthands ──────────────────────────────────────
  'rno','rnum',
  'srno','slno',                            // serial/student reg no in some sheets
]);

const NAME_ALIASES = new Set([
  // ── plain name ────────────────────────────────────────────
  'name','names',

  // ── student name ──────────────────────────────────────────
  'studentname','studentsname','studentnames',
  'studentfullname','stuname','stunames',
  'sname','snames',

  // ── full name ─────────────────────────────────────────────
  'fullname','fullnames',
  'firstname','lastname',                   // single-column first/last fallback

  // ── common typos / alternate phrasings ────────────────────
  'nameofstudent','nameofsudent',           // typos
  'nameofstudents',
  'studnam','stname',
  'candidatename','candidatenames',
  'participantname',
]);

/** Scan a header row and return { regIdx, nameIdx } (-1 when not found). */
const resolveColumns = (headerRow) => {
  let regIdx = -1, nameIdx = -1;
  (headerRow || []).forEach((cell, i) => {
    const s = slug(cell);
    if (regIdx  === -1 && REG_ALIASES.has(s))  regIdx  = i;
    if (nameIdx === -1 && NAME_ALIASES.has(s)) nameIdx = i;
  });
  return { regIdx, nameIdx };
};

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
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const intervalRef = useRef(null);
  const countRef = useRef(null);
  const inputCls = 'px-3 py-2 bg-white/40 dark:bg-[#1c1c2e] backdrop-blur-md border border-white/60 dark:border-[#2a2a40] rounded-lg text-sm focus:outline-none dark:text-white';

  // ── Excel upload ──────────────────────────────────────────────
  // Accepts any column order and any recognised header variation.
  // Falls back to positional (col 0 = reg, col 1 = name) when no headers matched.
  const handleExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rows.length) return;

      const { regIdx, nameIdx } = resolveColumns(rows[0]);
      const hasHeaders = regIdx !== -1 || nameIdx !== -1;

      // Resolved indices, or fallback positional (A=reg, B=name)
      const rCol = regIdx  !== -1 ? regIdx  : 0;
      const nCol = nameIdx !== -1 ? nameIdx : 1;

      const dataRows = hasHeaders ? rows.slice(1) : rows;
      const parsed = dataRows
        .filter(r => r[rCol])
        .map(r => ({
          regNo: String(r[rCol]).trim(),
          name:  String(r[nCol] ?? '').trim(),
        }));
      setStudents(parsed);
    };
    reader.readAsArrayBuffer(file);
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
    try {
      setIsStartingSession(true);
      const res = await api.post('/attendance/session', { students });
      setSession(res.data.session);
      setAttendance(students.map(s => ({ ...s, present: false })));
      generateQR(res.data.session.qrToken);
      setTab('live');
      startQrRefresh(res.data.session._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start session');
    } finally {
      setIsStartingSession(false);
    }
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
    try {
      setIsEndingSession(true);
      clearInterval(intervalRef.current);
      clearInterval(countRef.current);
      await api.post(`/attendance/session/${session._id}/end`);
      setSession(null); setTab('history');
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end session');
    } finally {
      setIsEndingSession(false);
    }
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
  // Uses canonical header names so re-uploading an exported file always works.
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      attendance.map(s => ({
        'Registration Number': s.regNo,
        'Name':   s.name,
        'Status': s.present ? 'Present' : 'Absent',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const presentCount = attendance.filter(s => s.present).length;
  const totalCount = attendance.length;
  const progressPct = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  // SVG QR countdown ring: cx=cy=110 r=104 circ≈653.3
  const QR_CIRC = 653.3;
  const qrRingOffset = QR_CIRC * (1 - countdown / 10);

  const tabLabels = { setup: 'Setup', live: 'Live', history: 'History' };
  const tabList = ['setup', 'live', 'history'];
  const tabIdx = tabList.indexOf(tab);

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn  { 0%{opacity:0;transform:scale(0.8)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulse-ring { 0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.03)} }
        .fadein    { animation: fadein 0.35s ease both; }
        .pop-in    { animation: popIn 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .pulse-qr  { animation: pulse-ring 2s ease-in-out infinite; }
        .tab-pill  { transition: transform 0.25s cubic-bezier(.4,0,.2,1); }
        .row-enter { animation: fadein 0.3s ease both; }
      `}</style>

      {/* ── Tab Bar ── */}
      <div className="relative flex bg-white/40 dark:bg-[#1a1a2e] backdrop-blur-md rounded-2xl p-1">
        {/* Sliding pill */}
        <div className="tab-pill absolute top-1 bottom-1  bg-white dark:bg-gray-700 shadow-sm"
          style={{ width: `${100 / 3}%`, transform: `translateX(${tabIdx * 100}%)` }} />
        {tabList.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative z-10 flex-1 py-2 text-sm font-medium  transition-colors duration-200
              ${tab === t ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tabLabels[t]}
            {t === 'live' && session && (
              <span className="inline-block ml-1.5 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ══ SETUP ══ */}
      {tab === 'setup' && (
        <div className="fadein space-y-4">
          {/* Upload card */}
          <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-[#c9a84c]/10 rounded-lg">
                <FileSpreadsheet size={18} className="text-indigo-600 dark:text-[#c9a84c]"/>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Upload Student List</h3>
                <p className="text-xs text-gray-400">Excel / CSV — any column order</p>
              </div>
            </div>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-[#2a2a40] rounded-lg py-6 px-4 cursor-pointer hover:border-indigo-400 dark:hover:border-[#c9a84c]/50 hover:bg-slate-50 dark:hover:bg-[#c9a84c]/5 transition-colors">
              <Upload size={22} className="text-gray-400"/>
              <span className="text-sm text-gray-500 dark:text-gray-400">Click to browse or drop file</span>
              <span className="text-xs text-gray-400">Supported headers: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Reg No, Registration Number, Roll No</code></span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} className="hidden"/>
            </label>
          </div>

          {/* Manual entry card */}
          <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <PlusCircle size={18} className="text-purple-500"/>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Manual Entry</h3>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <input value={newReg} onChange={e => setNewReg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                placeholder="Reg No" className={inputCls + ' min-w-0 sm:w-32'} />
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                placeholder="Student Name" className={inputCls + ' min-w-0 sm:flex-1'} />
              <button onClick={addManual}
                className="col-span-2 sm:col-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all active:scale-95">
                Add
              </button>
            </div>
          </div>

          {/* Student list */}
          {students.length > 0 && (
            <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <Users size={15} className="text-gray-400"/> {students.length} student{students.length !== 1 ? 's' : ''}
                </span>
                <button onClick={() => setStudents([])}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                  <Trash2 size={12}/> Clear all
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                {students.map((s, i) => (
                  <div key={i} className="row-enter flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.regNo}</span>
                      <span className="text-xs text-gray-400 ml-2">{s.name}</span>
                    </div>
                    <button onClick={() => setStudents(prev => prev.filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={startSession}
            disabled={!students.length || isStartingSession}
            className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-green-500/30 transition-all active:scale-[.98]"
          >
            {isStartingSession ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Starting Session…</span>
              </>
            ) : (
              <>
                <Play size={17}/>
                <span>Start Attendance Session</span>
                {students.length > 0 && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{students.length}</span>}
              </>
            )}
          </button>
        </div>
      )}

      {/* ══ LIVE ══ */}
      {tab === 'live' && session && (
        <div className="fadein space-y-4">
          <div className="grid md:grid-cols-2 gap-4">

            {/* ── QR Code with ring ── */}
            <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] p-5 flex flex-col items-center gap-3 shadow-sm">
              <div className="flex items-center gap-2 self-start">
                <QrCode size={16} className="text-indigo-600 dark:text-[#c9a84c]"/>
                <h3 className="font-semibold text-gray-700 dark:text-white text-sm">Live QR Code</h3>
                <span className="ml-auto text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block"/>Active
                </span>
              </div>

              {/* QR with SVG countdown ring */}
              <div className="relative flex items-center justify-center w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] mx-auto">
                <svg width="100%" height="100%" viewBox="0 0 220 220" className="absolute -rotate-90 pulse-qr">
                  <circle cx="110" cy="110" r="104" fill="none" strokeWidth="4"
                    className="text-gray-100 dark:text-gray-700" stroke="currentColor"/>
                  <circle cx="110" cy="110" r="104" fill="none" strokeWidth="4"
                    stroke="url(#qrGrad)" strokeLinecap="round"
                    strokeDasharray={QR_CIRC}
                    strokeDashoffset={qrRingOffset}
                    style={{ transition: 'stroke-dashoffset 0.9s linear' }}/>
                  <defs>
                    <linearGradient id="qrGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%"   stopColor="#3b82f6"/>
                      <stop offset="100%" stopColor="#10b981"/>
                    </linearGradient>
                  </defs>
                </svg>
                {qrUrl ? (
                  <img src={qrUrl} alt="Attendance QR" className="w-[170px] h-[170px] sm:w-[190px] sm:h-[190px] rounded-xl shadow-inner"/>
                ) : (
                  <div className="w-[170px] h-[170px] flex items-center justify-center text-gray-400 text-xs">Generating QR…</div>
                )}
              </div>

              {/* Countdown badge */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={13} className="text-indigo-600 dark:text-[#c9a84c]"/>
                Refreshes in <span className="font-mono font-bold text-gray-800 dark:text-white">{countdown}s</span>
              </div>
            </div>

            {/* ── Live stats card ── */}
            <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600 dark:text-[#c9a84c]"/>
                <h3 className="font-semibold text-gray-700 dark:text-white text-sm">Live Attendance</h3>
              </div>

              {/* Big stat counter */}
              <div className="flex items-end gap-2 my-auto">
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">{presentCount}</span>
                <span className="text-xl text-gray-400 mb-1">/ {totalCount}</span>
                <span className="ml-auto text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                  {progressPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 pt-0.5">
                  <span className="text-green-600 dark:text-green-400">{presentCount} present</span>
                  <span className="text-red-400">{totalCount - presentCount} absent</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={downloadExcel}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#c9a84c] dark:hover:bg-[#a87c30] dark:text-[#07070f] text-xs font-medium transition-all active:scale-95 rounded-lg shadow-sm"
                >
                  <Download size={13}/> Export
                </button>
                <button
                  onClick={endSession}
                  disabled={isEndingSession}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-all active:scale-95 disabled:opacity-60 rounded-lg shadow-sm"
                >
                  {isEndingSession ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Ending…</span>
                    </>
                  ) : (
                    <>
                      <StopCircle size={13}/>
                      <span>End</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Attendance list ── */}
          <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Users size={15} className="text-gray-400"/>
              <span className="text-sm font-semibold text-gray-700 dark:text-white">Students</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[#1c1c2e]">
                  <tr>
                    {['Reg No', 'Name', 'Status', 'Override'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {attendance.map((s, i) => (
                    <tr key={s.regNo}
                      className={`transition-colors duration-200 ${s.present ? 'bg-green-50/60 dark:bg-green-900/10' : ''}`}>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">{s.regNo}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{s.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-200
                          ${s.present
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.present ? 'bg-green-500' : 'bg-gray-400'}`}/>
                          {s.present ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => togglePresent(s.regNo, s.present)}
                          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all active:scale-95
                            ${s.present
                              ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40'
                              : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'}`}>
                          {s.present ? <><X size={11}/> Absent</> : <><Check size={11}/> Present</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* no session but live tab selected */}
      {tab === 'live' && !session && (
        <div className="fadein flex flex-col items-center gap-3 py-16 text-center">
          <QrCode size={40} className="text-gray-300"/>
          <p className="font-medium text-gray-400">No active session</p>
          <p className="text-xs text-gray-400">Go to <button onClick={() => setTab('setup')} className="text-indigo-600 dark:text-[#c9a84c] underline">Setup</button> and start one.</p>
        </div>
      )}

      {/* ══ HISTORY ══ */}
      {tab === 'history' && (
        <div className="fadein space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Clock size={40} className="text-gray-300"/>
              <p className="font-medium text-gray-400">No session history yet.</p>
            </div>
          ) : (
            history.map((h) => {
              const pct = h.totalStudents ? Math.round(((h.presentCount ?? 0) / h.totalStudents) * 100) : 0;
              const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={h._id} className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] px-5 py-4 shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {new Date(h.createdAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(h.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{h.totalStudents ?? 0} students
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${h.ended ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                      {h.ended ? 'Ended' : 'Active'}
                    </span>
                  </div>
                  {/* Attendance bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{h.presentCount ?? '?'} / {h.totalStudents ?? '?'} present</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}/>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
