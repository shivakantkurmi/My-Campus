import { useState } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function BlockedPage() {
  const { user } = useAuthStore();
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAppeal = async () => {
    if (!msg.trim()) return setErr('Please write your appeal message.');
    try {
      setIsSubmitting(true);
      setErr('');
      await api.post('/feedback', { type: 'unblock_appeal', message: msg });
      setSent(true);
    } catch {
      setErr('Failed to send appeal. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="mc-pop-in w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-red-800 text-center">
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
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#c9a84c] dark:hover:bg-[#a87c30] dark:text-[#07070f] font-semibold rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Appeal…</span>
                </>
              ) : (
                'Send Appeal'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
