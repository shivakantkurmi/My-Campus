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
    <div className={`flex h-screen overflow-hidden ${
      dark
        ? 'bg-[#07070f]'
        : 'bg-gradient-to-br from-[#eef2ff] via-[#f0f4ff] to-[#f5f3ff]'
    }`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* key={pathname} forces remount → triggers mc-page entrance on every navigation */}
          <div key={pathname} className="mc-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
