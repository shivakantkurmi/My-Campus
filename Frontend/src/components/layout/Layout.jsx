import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useThemeStore from '../../store/themeStore';

const TITLES = {
  '/dashboard':       'Dashboard',
  '/announcements':   'Announcement Board',
  '/notes':           'Notes Sharing',
  '/faculty-cabins':  'Faculty Cabin Finder',
  '/attendance':      'Attendance',
  '/cgpa-calculator': 'CGPA Calculator',
  '/admin':           'Admin Dashboard',
  '/profile':         'My Profile',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { dark } = useThemeStore();

  const title = TITLES[pathname] ?? 'My-Campus';

  return (
    <div className={`flex h-screen overflow-hidden relative ${
      dark ? 'bg-[#050508]' : 'bg-[#e5e7f0]'
    }`}>
      {/* ── Global Animated Backgrounds ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src={dark ? '/Images/VIT2.png' : '/Images/VIT1.jpg'}
          alt="Campus Background" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0" style={{
          background: dark 
            ? 'linear-gradient(to right, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.75) 100%)' 
            : 'linear-gradient(to right, rgba(255,255,255,0.75) 0%, rgba(240,245,255,0.55) 100%)',
          backdropFilter: 'blur(8px)'
        }} />
      </div>

      {/* ── Foreground Content ── */}
      <div className="flex h-screen w-full relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 overflow-hidden relative">
          <div className={pathname === '/dashboard' ? 'lg:hidden' : ''}>
            <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div key={pathname} className="mc-page">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
