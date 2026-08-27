import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Check, Settings, X, ChevronRight, Lock } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

const STORAGE_KEY = 'mc_cookie_consent';

export default function CookieConsent() {
  const { dark } = useThemeStore();
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  const [preferences, setPreferences] = useState({
    essential: true,   // Always required
    functional: true,  // Theme preferences, saved filters
    analytics: true,   // Anonymous usage metrics
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Small entrance delay for smooth UI transition
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.preferences) {
          setPreferences(parsed.preferences);
        }
      } catch (e) {
        console.error('Error parsing cookie preferences', e);
      }
    }
  }, []);

  // Listen for external trigger to open cookie settings (e.g. from Privacy Policy or Footer)
  useEffect(() => {
    const handleOpenSettings = () => {
      setVisible(true);
      setShowPreferences(true);
    };
    window.addEventListener('mc_open_cookie_preferences', handleOpenSettings);
    return () => window.removeEventListener('mc_open_cookie_preferences', handleOpenSettings);
  }, []);

  const saveConsent = (prefs) => {
    const consentPayload = {
      consented: true,
      timestamp: new Date().toISOString(),
      preferences: prefs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentPayload));
    setPreferences(prefs);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
    });
  };

  const handleDeclineOptional = () => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 md:left-auto md:right-8 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div
        className={`rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 border ${
          dark
            ? 'bg-[#0e0e1a]/95 border-[#c9a84c]/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(201,168,76,0.15)] text-gray-200'
            : 'bg-white/90 border-indigo-100 shadow-[0_20px_50px_rgba(99,102,241,0.2)] text-gray-800'
        }`}
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                dark
                  ? 'bg-gradient-to-br from-[#c9a84c] to-[#8a6020] text-[#07070f] shadow-[#c9a84c]/20'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/30'
              }`}
            >
              <Cookie size={20} />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                Cookie &amp; Privacy Preferences
              </h3>
              <span className={`text-[11px] font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                VIT Bhopal · My-Campus Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className={`p-1.5 rounded-full transition-colors ${
              dark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title="Close banner"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Text */}
        <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          We use cookies and local cache to keep your campus session secure, remember your visual theme, and provide verified QR attendance and notes sharing. Review our{' '}
          <Link
            to="/privacy-policy"
            className={`font-semibold underline underline-offset-2 transition-colors ${
              dark ? 'text-[#c9a84c] hover:text-[#e8c76b]' : 'text-indigo-600 hover:text-indigo-800'
            }`}
          >
            Privacy Policy
          </Link>{' '}
          to learn more.
        </p>

        {/* Detailed Preferences Accordion */}
        {showPreferences && (
          <div
            className={`mb-4 p-4 rounded-2xl space-y-3 text-xs border ${
              dark ? 'bg-black/40 border-[#c9a84c]/15' : 'bg-indigo-50/60 border-indigo-100'
            }`}
          >
            {/* Essential */}
            <div className="flex items-center justify-between gap-2">
              <div className="pr-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock size={12} className={dark ? 'text-[#c9a84c]' : 'text-indigo-600'} />
                  <span>Strictly Essential (Required)</span>
                </div>
                <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Required for authentication, security tokens, and QR attendance validation.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                  dark ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                Always Active
              </span>
            </div>

            <div className={`border-t ${dark ? 'border-white/10' : 'border-indigo-200/50'}`} />

            {/* Functional */}
            <div className="flex items-center justify-between gap-2">
              <div className="pr-2">
                <div className="font-bold">Functional &amp; Theme Preferences</div>
                <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Saves your dark/light mode preference and custom filters.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="sr-only peer"
                />
                <div
                  className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                    dark
                      ? 'bg-gray-700 peer-checked:bg-[#c9a84c]'
                      : 'bg-gray-300 peer-checked:bg-indigo-600'
                  }`}
                />
              </label>
            </div>

            <div className={`border-t ${dark ? 'border-white/10' : 'border-indigo-200/50'}`} />

            {/* Analytics */}
            <div className="flex items-center justify-between gap-2">
              <div className="pr-2">
                <div className="font-bold">Anonymous Analytics</div>
                <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Helps us analyze platform performance and popular notes resources.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="sr-only peer"
                />
                <div
                  className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                    dark
                      ? 'bg-gray-700 peer-checked:bg-[#c9a84c]'
                      : 'bg-gray-300 peer-checked:bg-indigo-600'
                  }`}
                />
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!showPreferences ? (
            <>
              <button
                onClick={handleAcceptAll}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                  dark
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                }`}
              >
                <Check size={14} /> Accept All
              </button>

              <button
                onClick={handleDeclineOptional}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 ${
                  dark
                    ? 'border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 bg-white/5'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white/60'
                }`}
              >
                Essential Only
              </button>

              <button
                onClick={() => setShowPreferences(true)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  dark
                    ? 'text-[#c9a84c] hover:bg-[#c9a84c]/10'
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Settings size={14} /> Customize
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveCustom}
                className={`flex-1 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                  dark
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#a87c30] text-[#07070f] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                }`}
              >
                Save Preferences
              </button>

              <button
                onClick={() => setShowPreferences(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 ${
                  dark
                    ? 'border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 bg-white/5'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white/60'
                }`}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
