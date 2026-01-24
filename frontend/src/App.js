import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardHome from './pages/DashboardHome';
import NotificationPage from './pages/NotificationPage';
import CatalogPage from './pages/CatalogPage';
import DepartmentPage from './pages/DepartmentPage';
import MainLayout from './components/layout/MainLayout';
import StudentManager from './pages/StudentManager';
import AdminManager from './pages/AdminManager';
import StaffManager from './pages/StaffManager';
import CirculationPage from './pages/CirculationPage';
import PolicyPage from './pages/PolicyPage';
import SettingsPage from './pages/SettingsPage';
import SystemHealthPage from './pages/SystemHealthPage';
import ReportsPage from './pages/ReportsPage';
import AuditPage from './pages/AuditPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import UserProfile from './pages/UserProfile';
import { PreferencesProvider } from './context/PreferencesContext';
import './App.css';
import './styles/index.css';

// --- Temporary Placeholder Components ---
const DbStatusCheck = () => {
  const [status, setStatus] = React.useState('checking');

  React.useEffect(() => {
    fetch('http://localhost:3001/api/status')
      .then(res => res.json())
      .then(data => setStatus(data.status === 'online' ? 'online' : 'error'))
      .catch(() => setStatus('offline'));
  }, []);

  if (status === 'online') return null; // Don't show if fine
  return (
    <div className="toast fixed" style={{ bottom: 10, right: 10, zIndex: 9999 }}>
      API: {status}
    </div>
  );
};

function App() {
  return (
    <PreferencesProvider>
      <Router>
        <div className="app-container">
          <div className="gradient-bg" />
          <DbStatusCheck />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<MainLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="books" element={<CatalogPage />} />
              <Route path="departments" element={<DepartmentPage />} />
              <Route path="members" element={<StudentManager />} />
              <Route path="staff" element={<StaffManager />} />
              <Route path="circulation" element={<CirculationPage />} />
              <Route path="policy" element={<PolicyPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="health" element={<SystemHealthPage />} />
              <Route path="transactions" element={<TransactionHistoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationPage />} />
              <Route path="admins" element={<AdminManager />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </PreferencesProvider>
  );
}

export default App;
