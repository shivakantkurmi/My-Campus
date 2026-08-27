import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useThemeStore from './store/themeStore';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/landing/Landing';
import AuthPage from './pages/auth/AuthPage';
import BlockedPage from './pages/auth/BlockedPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Dashboard from './pages/dashboard/Dashboard';
import Notes from './pages/notes/Notes';
import Announcements from './pages/announcements/Announcements';
import FacultyCabins from './pages/faculty-cabins/FacultyCabins';
import Attendance from './pages/attendance/Attendance';
import CGPACalculator from './pages/cgpa/CGPACalculator';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/profile/Profile';
import CookieConsent from './components/common/CookieConsent';

export default function App() {
  const { initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      {/* Global Theme-Consistent Cookie & Privacy Consent */}
      <CookieConsent />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<PrivacyPolicy />} />

        {/* Auth routes wrapped to prevent unmounting during 3D flip */}
        <Route element={<AuthPage />}>
          <Route path="/login" element={<div />} />
          <Route path="/register" element={<div />} />
        </Route>
        <Route path="/blocked" element={<BlockedPage />} />

        {/* Protected layout — outer guard */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/faculty-cabins" element={<FacultyCabins />} />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute roles={['student', 'faculty']}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route path="/cgpa-calculator" element={<CGPACalculator />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
