import { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

// VIT Bhopal grading system
// P = non-graded course — credits AND points are excluded from all calculations
const GRADE_MAP = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0,
  N1: 0, N2: 0, N3: 0, N4: 0,
  P: null,   // null = skip entirely
};

// Descriptions shown in the grade dropdown
const GRADE_DESC = {
  S:  'S',
  A:  'A',
  B:  'B',
  C:  'C',
  D:  'D',
  E:  'E',
  F:  'F(Fail)',
  N1: 'N1 — (Failed a component)',
  N2: 'N2 — (Debarred: attendance)',
  N3: 'N3 — (Absent in FAT)',
  N4: 'N4 — (Debarred: malpractice)',
  P:  'P  — Pass/Fail  (not counted)',
};

const CREDIT_OPTIONS = [1, 1.5, 2, 3, 4, 5, 6,10,20,40];
const GRADES = Object.keys(GRADE_MAP);

const emptyCourse = () => ({ id: Date.now() + Math.random(), grade: 'S', credits: 3 });

export default function CGPACalculator() {
  const [tab, setTab] = useState('gpa');
  const [gpaRows, setGpaRows] = useState([emptyCourse()]);
  const [semesters, setSemesters] = useState([
    { id: 1, label: 'Semester 1', courses: [emptyCourse()] },
  ]);

  // ── Compute helpers ──────────────────────────────────────────
  const computeGpa = (courses) => {
    let pts = 0, creds = 0;
    courses.forEach(c => {
      const p = GRADE_MAP[c.grade];
      if (p === null || p === undefined) return;
      pts += p * Number(c.credits);
      creds += Number(c.credits);
    });
    if (creds === 0) return '—';
    return (pts / creds).toFixed(2);
  };

  const computeCgpa = () => {
    let pts = 0, creds = 0;
    semesters.forEach(sem =>
      sem.courses.forEach(c => {
        const p = GRADE_MAP[c.grade];
        if (p === null || p === undefined) return;
        pts += p * Number(c.credits);
        creds += Number(c.credits);
      })
    );
    if (creds === 0) return '—';
    return (pts / creds).toFixed(2);
  };

  // ── GPA row helpers ──────────────────────────────────────────
  const updateGpa = (id, field, val) =>
    setGpaRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));

  // ── CGPA helpers ─────────────────────────────────────────────
  const updateSem = (semId, courseId, field, val) =>
    setSemesters(prev => prev.map(s =>
      s.id === semId
        ? { ...s, courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: val } : c) }
        : s
    ));

  const addSemCourse = (semId) =>
    setSemesters(prev => prev.map(s =>
      s.id === semId ? { ...s, courses: [...s.courses, emptyCourse()] } : s
    ));

  const removeSemCourse = (semId, courseId) =>
    setSemesters(prev => prev.map(s =>
      s.id === semId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s
    ));

  // ── Shared row component ─────────────────────────────────────
  const select = 'w-full px-2 py-2 rounded-lg border border-white/60 dark:border-[#2a2a40] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer';

  const CourseRow = ({ course, onChange, onRemove, canRemove }) => {
    const pts = GRADE_MAP[course.grade];
    const pointsDisplay = pts === null
      ? <span className="text-gray-400 text-xs">skip</span>
      : <span className="font-semibold text-indigo-600 dark:text-indigo-400">{(pts * Number(course.credits)).toFixed(0)}</span>;

    return (
      <div className="space-y-2">
        {/* Row 1: Grade + Credits */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Grade</label>
            <select value={course.grade} onChange={e => onChange('grade', e.target.value)} className={select}>
              {GRADES.map(g => (
                <option key={g} value={g}>{GRADE_DESC[g]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Credits</label>
            <select value={course.credits} onChange={e => onChange('credits', e.target.value)} className={select}>
              {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {/* Row 2: Points preview + Remove */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">Points: {pointsDisplay}</span>
          {canRemove && (
            <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const resultVal = tab === 'gpa' ? computeGpa(gpaRows) : computeCgpa();
  const numResult = parseFloat(resultVal);
  const resultColor = isNaN(numResult) ? 'text-gray-400'
    : numResult >= 8.5 ? 'text-emerald-500'
    : numResult >= 7 ? 'text-indigo-500'
    : numResult >= 5.5 ? 'text-amber-500'
    : 'text-red-500';

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/40 dark:bg-[#1a1a2e] backdrop-blur-md rounded-xl w-full sm:w-fit">
        {['gpa', 'cgpa'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Result card */}
      <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] shadow-sm p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tab === 'gpa' ? 'Semester GPA' : 'Cumulative GPA (CGPA)'}
            </p>
            <p className={`text-5xl font-extrabold mt-1 ${resultColor}`}>
              {resultVal === '—' ? '—' : resultVal}
            </p>
            {resultVal !== '—' && (
              <p className="text-xs text-gray-400 mt-1">
                {numResult >= 9 ? 'Outstanding 🏆'
                  : numResult >= 8 ? 'Excellent 🌟'
                  : numResult >= 7 ? 'Good 👍'
                  : numResult >= 6 ? 'Average'
                  : 'Needs improvement'}
              </p>
            )}
          </div>
          {/* Grade reference */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(GRADE_MAP).map(([g, p]) => (
              <span key={g} className={`text-xs px-2 py-0.5 rounded-md border ${
                p === null
                  ? 'bg-slate-50 dark:bg-[#1c1c2e] text-gray-400 dark:text-gray-500 border-slate-200 dark:border-[#2a2a40]'
                  : p === 0
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800'
                  : 'bg-slate-50 dark:bg-[#1c1c2e] text-gray-600 dark:text-gray-300 border-slate-200 dark:border-[#2a2a40]'
              }`}>
                {g}={p ?? 'skip'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* GPA tab */}
      {tab === 'gpa' && (
        <div className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2">
              <Calculator size={15} className="text-indigo-500" />
              Courses this semester
            </h3>
            <span className="text-xs text-gray-400">{gpaRows.length} course{gpaRows.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {gpaRows.map((r, i) => (
              <div key={r.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#1c1c2e] border border-slate-200/60 dark:border-[#2a2a40]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-xs text-gray-400 font-medium">Course {i + 1}</span>
                </div>
                <CourseRow
                  course={r}
                  onChange={(f, v) => updateGpa(r.id, f, v)}
                  onRemove={() => setGpaRows(prev => prev.filter(x => x.id !== r.id))}
                  canRemove={gpaRows.length > 1}
                />
              </div>
            ))}
          </div>

          <button onClick={() => setGpaRows(prev => [...prev, emptyCourse()])}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-[#c9a84c] hover:text-indigo-700 dark:hover:text-[#a87c30] transition pt-2">
            <Plus size={15} /> Add Course
          </button>
        </div>
      )}

      {/* CGPA tab */}
      {tab === 'cgpa' && (
        <div className="space-y-4">
          {semesters.map((sem) => (
            <div key={sem.id} className="bg-white dark:bg-[#121220] rounded-xl border border-slate-200 dark:border-[#2a2a40] shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    value={sem.label}
                    onChange={e => setSemesters(prev => prev.map(s => s.id === sem.id ? { ...s, label: e.target.value } : s))}
                    className="font-semibold text-gray-700 dark:text-white bg-transparent text-sm border-b border-transparent hover:border-gray-300 focus:outline-none focus:border-indigo-400 w-32"
                  />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-[#c9a84c]/20 text-indigo-600 dark:text-[#c9a84c]">
                    GPA {computeGpa(sem.courses)}
                  </span>
                </div>
                {semesters.length > 1 && (
                  <button onClick={() => setSemesters(prev => prev.filter(s => s.id !== sem.id))}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {sem.courses.map((c, i) => (
                  <div key={c.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#1c1c2e] border border-slate-200/60 dark:border-[#2a2a40]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-xs text-gray-400 font-medium">Course {i + 1}</span>
                    </div>
                    <CourseRow
                      course={c}
                      onChange={(f, v) => updateSem(sem.id, c.id, f, v)}
                      onRemove={() => removeSemCourse(sem.id, c.id)}
                      canRemove={sem.courses.length > 1}
                    />
                  </div>
                ))}
              </div>

              <button onClick={() => addSemCourse(sem.id)}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-[#c9a84c] hover:text-indigo-700 dark:hover:text-[#a87c30] transition pt-2">
                <Plus size={14} /> Add Course
              </button>
            </div>
          ))}

          <button
            onClick={() => setSemesters(prev => [...prev, { id: Date.now(), label: `Semester ${prev.length + 1}`, courses: [emptyCourse()] }])}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-[#2a2a40] text-slate-500 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-[#c9a84c] dark:hover:text-[#c9a84c] rounded-xl transition text-sm font-medium"
          >
            + Add Semester
          </button>
        </div>
      )}
    </div>
  );
}
