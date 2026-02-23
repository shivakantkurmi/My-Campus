import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useThemeStore from './store/themeStore';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/landing/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BlockedPage from './pages/auth/BlockedPage';
import Dashboard from './pages/dashboard/Dashboard';
import Notes from './pages/notes/Notes';
import FacultyCabins from './pages/faculty-cabins/FacultyCabins';
import Attendance from './pages/attendance/Attendance';
import CGPACalculator from './pages/cgpa/CGPACalculator';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/profile/Profile';

export default function App() {
  const { initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
