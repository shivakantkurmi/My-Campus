import { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, P: null, N1: 0, N2: 0 };
const CREDIT_OPTIONS = [1, 1.5, 2, 3, 4, 5, 6, 10, 20, 40];
const GRADES = Object.keys(GRADE_MAP);

const emptySubject = () => ({ id: Date.now(), name: '', grade: 'O', credits: 3 });

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState([
    { id: 1, label: 'Semester 1', subjects: [emptySubject()] },
  ]);
  const [gpaSubjects, setGpaSubjects] = useState([emptySubject()]);
  const [tab, setTab] = useState('gpa'); // gpa | cgpa

  // ── GPA ──────────────────────────────────────────────────────
  const computeGPA = (subjects) => {
    let totalPoints = 0, totalCredits = 0;
    subjects.forEach(s => {
      const pts = GRADE_MAP[s.grade];
      if (pts === null) return; // P — skip
      totalPoints += pts * Number(s.credits);
      totalCredits += Number(s.credits);
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  // ── CGPA ─────────────────────────────────────────────────────
  const computeCGPA = () => {
    let totalPoints = 0, totalCredits = 0;
    semesters.forEach(sem => {
      sem.subjects.forEach(s => {
        const pts = GRADE_MAP[s.grade];
        if (pts === null) return;
        totalPoints += pts * Number(s.credits);
        totalCredits += Number(s.credits);
      });
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  // ── Helpers ──────────────────────────────────────────────────
  const updateGpaSub = (id, field, value) =>
    setGpaSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const updateSemSub = (semId, subId, field, value) =>
    setSemesters(prev => prev.map(sem =>
      sem.id === semId
        ? { ...sem, subjects: sem.subjects.map(s => s.id === subId ? { ...s, [field]: value } : s) }
        : sem
    ));

  const addCgpaSemester = () =>
    setSemesters(prev => [...prev, { id: Date.now(), label: `Semester ${prev.length + 1}`, subjects: [emptySubject()] }]);

  const removeSemester = (id) => setSemesters(prev => prev.filter(s => s.id !== id));

  const inputCls = 'px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm focus:outline-none dark:text-white';

  const SubjectRow = ({ sub, onUpdate, onRemove }) => (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        value={sub.name} onChange={e => onUpdate('name', e.target.value)}
        placeholder="Subject name"
        className={`${inputCls} flex-1 min-w-28`}
      />
      <select value={sub.grade} onChange={e => onUpdate('grade', e.target.value)} className={inputCls}>
        {GRADES.map(g => <option key={g}>{g}</option>)}
      </select>
      <select value={sub.credits} onChange={e => onUpdate('credits', e.target.value)} className={inputCls}>
        {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['gpa', 'cgpa'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 uppercase text-sm font-semibold border-b-2 transition ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* GPA Tab */}
      {tab === 'gpa' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 dark:text-white flex items-center gap-2"><Calculator size={16}/> GPA Calculator</h3>
            <span className="text-2xl font-bold text-blue-600">GPA: {computeGPA(gpaSubjects)}</span>
          </div>

          <div className="text-xs text-gray-400 font-medium grid grid-cols-[1fr_80px_80px_36px] gap-2 px-1">
            <span>Subject</span><span>Grade</span><span>Credits</span><span></span>
          </div>

          <div className="space-y-2">
            {gpaSubjects.map(s => (
              <SubjectRow key={s.id} sub={s}
                onUpdate={(f, v) => updateGpaSub(s.id, f, v)}
                onRemove={() => setGpaSubjects(prev => prev.filter(x => x.id !== s.id))}
              />
            ))}
          </div>

          <button onClick={() => setGpaSubjects(prev => [...prev, emptySubject()])}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 font-medium">
            <Plus size={15}/> Add Subject
          </button>

          {/* Grade table quick reference */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            {Object.entries(GRADE_MAP).map(([g, p]) => (
              <span key={g} className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                {g} = {p ?? 'skip'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CGPA Tab */}
      {tab === 'cgpa' && (
        <div className="space-y-4">
          <div className="bg-blue-600 rounded-2xl p-5 text-white text-center">
            <p className="text-sm font-medium opacity-80">Cumulative GPA</p>
            <p className="text-5xl font-bold mt-1">{computeCGPA()}</p>
          </div>

          {semesters.map(sem => (
            <div key={sem.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input value={sem.label}
                    onChange={e => setSemesters(prev => prev.map(s => s.id === sem.id ? { ...s, label: e.target.value } : s))}
                    className="font-semibold text-gray-700 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none text-sm"
                  />
                  <span className="text-sm text-blue-500 font-medium">GPA: {computeGPA(sem.subjects)}</span>
                </div>
                {semesters.length > 1 && (
                  <button onClick={() => removeSemester(sem.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                )}
              </div>

              <div className="space-y-2">
                {sem.subjects.map(s => (
                  <SubjectRow key={s.id} sub={s}
                    onUpdate={(f, v) => updateSemSub(sem.id, s.id, f, v)}
                    onRemove={() => setSemesters(prev => prev.map(se =>
                      se.id === sem.id ? { ...se, subjects: se.subjects.filter(x => x.id !== s.id) } : se
                    ))}
                  />
                ))}
              </div>

              <button
                onClick={() => setSemesters(prev => prev.map(se =>
                  se.id === sem.id ? { ...se, subjects: [...se.subjects, emptySubject()] } : se
                ))}
                className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 font-medium">
                <Plus size={14}/> Add Subject
              </button>
            </div>
          ))}

          <button onClick={addCgpaSemester}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition text-sm font-medium">
            + Add Semester
          </button>
        </div>
      )}
    </div>
  );
}
