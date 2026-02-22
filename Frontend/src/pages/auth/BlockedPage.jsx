import { useState } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function BlockedPage() {
  const { user } = useAuthStore();
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const handleAppeal = async () => {
    if (!msg.trim()) return setErr('Please write your appeal message.');
    try {
      await api.post('/feedback', { type: 'unblock_appeal', message: msg });
      setSent(true);
    } catch {
      setErr('Failed to send appeal. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-red-800 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Account Blocked</h2>
        <p className="text-gray-400 mb-6">
          Your account has been blocked by the administrator. Submit an appeal below.
        </p>

        {sent ? (
          <p className="text-green-400 font-medium">Appeal sent! Admin will review it.</p>
        ) : (
          <>
            <textarea
              value={msg}
              onChange={(e) => { setMsg(e.target.value); setErr(''); }}
              rows={4}
              placeholder="Explain your appeal…"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none resize-none mb-3"
            />
            {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
            <button
              onClick={handleAppeal}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Send Appeal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
