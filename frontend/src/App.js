import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SetupWizard from './pages/SetupWizard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardHome from './pages/DashboardHome';
import AboutPage from './pages/AboutPage';
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
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { SocketProvider } from './context/SocketContext';
import { TutorialProvider } from './context/TutorialContext';
import GlobalNotifications from './components/common/GlobalNotifications';
import UserManualModal from './components/common/UserManualModal';
import DatabaseSchemaModal from './components/common/DatabaseSchemaModal';
import LockScreen from './components/common/LockScreen';
import PerformanceWidget from './components/common/PerformanceWidget';
import TitleBar from './components/layout/TitleBar';
import useFontToggle from './hooks/useFontToggle';
import './styles/index.css';
import './App.css';
import API_BASE from './config/apiConfig';

// ---------------------------------------------------------------------------
// Global Frontend Error Forwarding — sends JS errors to electron-log file
// ---------------------------------------------------------------------------
if (window.electron?.logError) {
  window.onerror = (msg, url, line, col, error) => {
    window.electron.logError({ msg: String(msg), url, line, col, stack: error?.stack });
  };
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    window.electron.logError({
      msg: `Unhandled Promise Rejection: ${reason?.message || reason}`,
      stack: reason?.stack
    });
  });
}

// --- API Status Check with Restart Button ---
const DbStatusCheck = () => {
  const [status, setStatus] = React.useState('checking');

  const checkStatus = React.useCallback(() => {
    fetch(`${API_BASE}/api/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status === 'online' ? 'online' : 'error'))
      .catch(() => setStatus('offline'));
  }, []);

  React.useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (status === 'online' || status === 'checking') return null;

  const handleRestart = () => {
    if (window.electron?.restartApp) {
      window.electron.restartApp();
    } else {
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      background: status === 'offline'
        ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
        : 'linear-gradient(135deg, #2d1b1b, #3e1616)',
      color: '#fff', borderRadius: 12, padding: '14px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: 'Inter, sans-serif', maxWidth: 380,
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: status === 'offline' ? '#ef4444' : '#f59e0b',
        boxShadow: `0 0 8px ${status === 'offline' ? '#ef4444' : '#f59e0b'}`,
        animation: 'pulse 2s infinite'
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>
          API: {status === 'offline' ? 'Offline' : 'Error'}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
          {status === 'offline' ? 'Backend server is not responding' : 'Backend returned an error'}
        </div>
      </div>
      <button onClick={handleRestart} style={{
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff', padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        transition: 'all 0.2s ease'
      }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; }}
      >
        Restart App
      </button>
    </div>
  );
};

// Setup check wrapper — redirects to /setup if no admin exists
const SetupGuard = ({ children }) => {
  const [needsSetup, setNeedsSetup] = React.useState(null); // null = checking

  React.useEffect(() => {
    fetch(`${API_BASE}/api/auth/setup-status`)
      .then(res => res.json())
      .then(data => setNeedsSetup(data.needsSetup))
      .catch(() => setNeedsSetup(false)); // On error, allow normal flow
  }, []);

  if (needsSetup === null) return null; // Still checking
  if (needsSetup) return <Navigate to="/setup" replace />;
  return children;
};

// Registers the Alt+F global font toggle shortcut
const FontToggleInitializer = () => {
  useFontToggle();
  return null;
};

function App() {
  const [showPerfWidget, setShowPerfWidget] = useState(false);

  useEffect(() => {
    const handler = () => setShowPerfWidget(prev => !prev);
    window.addEventListener('toggle-perf-widget', handler);
    return () => window.removeEventListener('toggle-perf-widget', handler);
  }, []);
  return (
    <PreferencesProvider>
      <LanguageProvider>
        <UserProvider>
          <SessionProvider>
            <SocketProvider>
              <TutorialProvider>
                <Router>
                  <div className="app-container">
                    <FontToggleInitializer />
                    <TitleBar />
                    <div className="gradient-bg" />
                    <DbStatusCheck />
                    <GlobalNotifications />
                    <LockScreen />
                    {showPerfWidget && <PerformanceWidget />}
                    <Routes>
                      <Route path="/setup" element={<SetupWizard />} />
                      <Route path="/" element={<SetupGuard><LandingPage /></SetupGuard>} />
                      <Route path="/login" element={<SetupGuard><LoginPage /></SetupGuard>} />
                      <Route path="/about" element={<AboutPage />} />
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
                    <UserManualModal />
                    <DatabaseSchemaModal />
                  </div>
                </Router>
              </TutorialProvider>
            </SocketProvider>
          </SessionProvider>
        </UserProvider>
      </LanguageProvider>
    </PreferencesProvider>
  );
}

export default App;
